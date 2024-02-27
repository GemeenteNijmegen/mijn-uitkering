// ~~ Generated by projen. To modify, edit .projenrc.js and run "npx projen".
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Props for UitkeringFunction
 */
export interface UitkeringFunctionProps extends lambda.FunctionOptions {
}

/**
 * An AWS Lambda function which executes src/app/uitkeringen/uitkering.
 */
export class UitkeringFunction extends lambda.Function {
  constructor(scope: Construct, id: string, props?: UitkeringFunctionProps) {
    super(scope, id, {
      description: 'src/app/uitkeringen/uitkering.lambda.ts',
      ...props,
      runtime: new lambda.Runtime('nodejs20.x', lambda.RuntimeFamily.NODEJS),
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../assets/app/uitkeringen/uitkering.lambda')),
    });
    this.addEnvironment('AWS_NODEJS_CONNECTION_REUSE_ENABLED', '1', { removeInEdge: true });
  }
}