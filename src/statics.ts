export abstract class Statics {
  static readonly projectName: string = 'mijn-uitkering';

  /**
   * Certificate private key for mTLS
   */
  static readonly secretMTLSPrivateKey: string = '/cdk/mijn-nijmegen/mtls-privatekey';

  /**
   * Certificate for mTLS
   */
  static readonly ssmMTLSClientCert: string = '/cdk/mijn-nijmegen/mtls-clientcert';

  /**
    * Root CA for mTLS (PKIO root)
    */
  static readonly ssmMTLSRootCA: string = '/cdk/mijn-nijmegen/mtls-rootca';

  /**
   * BRP API endpoint
   */
  static readonly ssmBrpApiEndpointUrl: string = '/cdk/mijn-nijmegen/brp-api-url';

  static readonly ssmApiGatewayId: string = '/cdk/mijn-nijmegen/apigateway-id';

  static readonly ssmSessionsTableArn: string = '/cdk/mijn-nijmegen/sessionstable-arn';

  /**
   * Uitkeringsgegevens API endpoint
   */
  static readonly ssmUitkeringsApiEndpointUrl: string = '/cdk/mijn-uitkering/uitkerings-api-url';

}