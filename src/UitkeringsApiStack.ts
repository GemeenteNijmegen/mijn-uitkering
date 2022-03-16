import * as apigatewayv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { aws_secretsmanager, Stack, StackProps, aws_ssm as SSM } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { ApiFunction } from './ApiFunction';
import { SessionsTable } from './SessionsTable';
import { Statics } from './statics';

export interface UitkeringsApiStackProps extends StackProps {
  sessionsTable: SessionsTable;
  gateway: apigatewayv2.HttpApi;
  branch: string;
}

export class UitkeringsApiStack extends Stack {
  private sessionsTable: Table;
  private api: apigatewayv2.HttpApi;

  constructor(scope: Construct, id: string, props: UitkeringsApiStackProps) {
    super(scope, id);
    this.sessionsTable = props.sessionsTable.table;
    this.api = props.gateway;
    const subdomain = Statics.subDomain(props.branch);
    const cspDomain = `${subdomain}.csp-nijmegen.nl`;
    this.setFunctions(`https://${cspDomain}/`);
  }

  /**
   * Create and configure lambda's for all api routes, and
   * add routes to the gateway.
   * @param {string} baseUrl the application url
   */
  setFunctions(baseUrl: string) {

    const secretMTLSPrivateKey = aws_secretsmanager.Secret.fromSecretNameV2(this, 'tls-key-secret', Statics.secretMTLSPrivateKey);
    const tlskeyParam = SSM.StringParameter.fromStringParameterName(this, 'tlskey', Statics.ssmMTLSClientCert)
    const tlsRootCAParam = SSM.StringParameter.fromStringParameterName(this, 'tlsrootca', Statics.ssmMTLSRootCA)

    const uitkeringenFunction = new ApiFunction(this, 'uitkeringen-function', {
      description: 'Uitkeringen-lambda voor de Mijn Uitkering-applicatie.',
      codePath: 'app/uitkeringen',
      table: this.sessionsTable,
      tablePermissions: 'ReadWrite',
      applicationUrlBase: baseUrl,
      environment: {
        MTLS_PRIVATE_KEY_ARN: secretMTLSPrivateKey.secretArn,
        MTLS_CLIENT_CERT_NAME: Statics.ssmMTLSClientCert,
        MTLS_ROOT_CA_NAME: Statics.ssmMTLSRootCA,
        UITKERING_API_URL: SSM.StringParameter.valueForStringParameter(this, Statics.ssmUitkeringsApiEndpointUrl),
        BRP_API_URL: SSM.StringParameter.valueForStringParameter(this, Statics.ssmBrpApiEndpointUrl),
      },
    });
    secretMTLSPrivateKey.grantRead(uitkeringenFunction.lambda);
    tlskeyParam.grantRead(uitkeringenFunction.lambda);
    tlsRootCAParam.grantRead(uitkeringenFunction.lambda);

    this.api.addRoutes({
      integration: new HttpLambdaIntegration('uitkeringen', uitkeringenFunction.lambda),
      path: '/uitkeringen',
      methods: [apigatewayv2.HttpMethod.GET],
    });
  }
}