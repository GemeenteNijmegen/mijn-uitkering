export abstract class Statics {
  static readonly projectName: string = 'mijn-uitkering';

  /**
   * Imported arns from Mijn Nijmegen
   */
  static readonly ssmApiGatewayId: string = '/cdk/mijn-nijmegen/apigateway-id';
  static readonly ssmSessionsTableArn: string = '/cdk/mijn-nijmegen/sessionstable-arn';

  /**
   * Certificate private key for mTLS
   */
  static readonly secretMTLSPrivateKey: string = '/cdk/mijn-uitkering/mtls-privatekey';

  /**
   * Certificate for mTLS
   */
  static readonly ssmMTLSClientCert: string = '/cdk/mijn-uitkering/mtls-clientcert';

  /**
    * Root CA for mTLS (PKIO root)
    */
  static readonly ssmMTLSRootCA: string = '/cdk/mijn-uitkering/mtls-rootca';

  /**
   * BRP API endpoint
   */
  static readonly ssmBrpApiEndpointUrl: string = '/cdk/mijn-uitkering/brp-api-url';


  /**
   * Uitkeringsgegevens API endpoint
   */
  static readonly ssmUitkeringsApiEndpointUrl: string = '/cdk/mijn-uitkering/uitkerings-api-url';

}