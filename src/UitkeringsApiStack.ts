import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpRouteKey } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { aws_secretsmanager, Stack, aws_ssm as SSM, aws_kms } from 'aws-cdk-lib';
import { ITable, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Role } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { ApiFunction } from './ApiFunction';
import { UitkeringFunction } from './app/uitkeringen/uitkering-function';
import { Statics } from './statics';

export class UitkeringsApiStack extends Stack {
  private sessionsTable: ITable;
  private api: apigatewayv2.IHttpApi;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const sessionsTableArn = SSM.StringParameter.fromStringParameterName(this, 'sessions-table-arn', Statics.ssmSessionsTableArn).stringValue;
    const keyArn = SSM.StringParameter.fromStringParameterName(this, 'key-arn', Statics.ssmDataKeyArn).stringValue;

    /**
     * Use fromTableAttributes so we can pass in the encryption key. This
     * way the table.grantReadWriteData() call actually sets the correct
     * KMS policy fields (kms:Encrypt etc.)
     */
    this.sessionsTable = Table.fromTableAttributes(this, 'sessionstable', {
      encryptionKey: aws_kms.Key.fromKeyArn(this, 'data-key', keyArn),
      tableArn: sessionsTableArn,
    });

    const apiGatewayId = SSM.StringParameter.fromStringParameterName(this, 'gatewayid', Statics.ssmApiGatewayId);
    this.api = apigatewayv2.HttpApi.fromHttpApiAttributes(this, 'apigateway', { httpApiId: apiGatewayId.stringValue });
    this.setFunctions();
  }

  /**
   * Create and configure lambda's for all api routes, and
   * add routes to the gateway.
   * @param {string} baseUrl the application url
   */
  setFunctions() {

    const secretMTLSPrivateKey = aws_secretsmanager.Secret.fromSecretNameV2(this, 'tls-key-secret', Statics.secretMTLSPrivateKey);
    const tlskeyParam = SSM.StringParameter.fromStringParameterName(this, 'tlskey', Statics.ssmMTLSClientCert);
    const tlsRootCAParam = SSM.StringParameter.fromStringParameterName(this, 'tlsrootca', Statics.ssmMTLSRootCA);

    const readOnlyRole = Role.fromRoleArn(this, 'readonly', SSM.StringParameter.valueForStringParameter(this, Statics.ssmReadOnlyRoleArn));

    const uitkeringenFunction = new ApiFunction(this, 'uitkeringen-function', {
      description: 'Uitkeringen-lambda voor de Mijn Uitkering-applicatie.',
      codePath: 'app/uitkeringen',
      table: this.sessionsTable,
      tablePermissions: 'ReadWrite',
      environment: {
        MTLS_PRIVATE_KEY_ARN: secretMTLSPrivateKey.secretArn,
        MTLS_CLIENT_CERT_NAME: Statics.ssmMTLSClientCert,
        MTLS_ROOT_CA_NAME: Statics.ssmMTLSRootCA,
        UITKERING_API_URL: SSM.StringParameter.valueForStringParameter(this, Statics.ssmUitkeringsApiEndpointUrl),
        BRP_API_URL: SSM.StringParameter.valueForStringParameter(this, Statics.ssmBrpApiEndpointUrl),
      },
      readOnlyRole,
      apiFunction: UitkeringFunction,
    });

    secretMTLSPrivateKey.grantRead(uitkeringenFunction.lambda);
    tlskeyParam.grantRead(uitkeringenFunction.lambda);
    tlsRootCAParam.grantRead(uitkeringenFunction.lambda);

    new apigatewayv2.HttpRoute(this, 'uitkeringen-route', {
      httpApi: this.api,
      integration: new HttpLambdaIntegration('uitkeringen', uitkeringenFunction.lambda),
      routeKey: HttpRouteKey.with('/uitkeringen', apigatewayv2.HttpMethod.GET),
    });
  }
}
