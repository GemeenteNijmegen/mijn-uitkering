import { aws_lambda as Lambda, aws_dynamodb, RemovalPolicy, Duration, Stack } from 'aws-cdk-lib';
import { Alarm } from 'aws-cdk-lib/aws-cloudwatch';
import { IRole } from 'aws-cdk-lib/aws-iam';
import { FilterPattern, IFilterPattern, MetricFilter, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { LambdaReadOnlyPolicy } from './iam/lambda-readonly-policy';
import { Statics } from './statics';

type T = Lambda.Function;

export interface ApiFunctionProps {
  apiFunction: {new(scope: Construct, id:string, props?: Lambda.FunctionProps): T };
  description: string;
  codePath: string;
  table: aws_dynamodb.ITable;
  tablePermissions: string;
  applicationUrlBase?: string;
  environment?: {[key: string]: string};
  monitorFilterPattern?: IFilterPattern;
  readOnlyRole: IRole;
}

export class ApiFunction extends Construct {
  lambda: Lambda.Function;
  constructor(scope: Construct, id: string, props: ApiFunctionProps) {
    super(scope, id);
    // See https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-extension-versionsx86-64.html
    const insightsArn = `arn:aws:lambda:${Stack.of(this).region}:580247275435:layer:LambdaInsightsExtension:21`;
    this.lambda = new props.apiFunction(this, 'lambda', {
      runtime: Lambda.Runtime.NODEJS_18_X, // Overwritten by projen project type configuration
      memorySize: 512,
      handler: 'index.handler',
      description: props.description,
      code: Lambda.Code.fromInline('empty'), // Overwritten,
      insightsVersion: Lambda.LambdaInsightsVersion.fromInsightVersionArn(insightsArn),
      logRetention: RetentionDays.ONE_MONTH,
      environment: {
        SESSION_TABLE: props.table.tableName,
        SHOW_ZAKEN: 'True',
        ...props.environment,
      },
    });
    props.table.grantReadWriteData(this.lambda.grantPrincipal);

    this.monitor(props.monitorFilterPattern);
    this.allowAccessToReadOnlyRole(props.readOnlyRole);
  }

  /**
   * Monitor the logs generated by this function for a filter pattern, generate metric
   * and alarm on increased error rate.
   *
   * @param filterPattern Pattern to filter by (default: containing ERROR)
   */
  private monitor(filterPattern?: IFilterPattern) {
    const errorMetricFilter = new MetricFilter(this, 'MetricFilter', {
      logGroup: this.lambda.logGroup,
      metricNamespace: `${Statics.projectName}/${this.node.id}`,
      metricName: 'Errors',
      filterPattern: filterPattern ?? FilterPattern.anyTerm('ERROR'),
      metricValue: '1',
    });
    errorMetricFilter.applyRemovalPolicy(RemovalPolicy.DESTROY);

    const alarm = new Alarm(this, `${Statics.projectName}-${this.node.id}-alarm`, {
      metric: errorMetricFilter.metric({
        statistic: 'sum',
        period: Duration.minutes(5),
      }),
      evaluationPeriods: 3,
      threshold: 5,
      alarmName: `Increased error rate for ${this.node.id}`,
      alarmDescription: `This alarm triggers if the function ${this.node.id} is logging more than 5 errors over n minutes.`,
    });
    alarm.applyRemovalPolicy(RemovalPolicy.DESTROY);

  }

  private allowAccessToReadOnlyRole(role: IRole) {
    role.addManagedPolicy(
      new LambdaReadOnlyPolicy(this, 'read-policy', {
        functionArn: this.lambda.functionArn,
        logGroupArn: this.lambda.logGroup.logGroupArn,
      }),
    );
  }
}
