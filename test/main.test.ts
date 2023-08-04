import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Dotenv from 'dotenv';
import { ParameterStack } from '../src/ParameterStage';
import { PipelineStack } from '../src/PipelineStack';
import { UitkeringsApiStack } from '../src/UitkeringsApiStack';
import { Configuration } from '../src/Configuration';

const env = {
  account: '123456789012',
  region: 'eu-west-1',
}

const config: Configuration = {
  branchName: 'testing',
  buildEnvironment: env,
  deploymentEnvironment: env,
  envIsInNewLandingZone: true,
  pipelineName: 'pipeline-testing',
  pipelineStackCdkName: 'testing-pipeline-stack', 
}

beforeAll(() => {
  Dotenv.config();
  if (process.env.VERBOSETESTS!='True') {
    global.console.error = jest.fn();
    global.console.time = jest.fn();
    global.console.log = jest.fn();
  }
});

test('Snapshot', () => {
  const app = new App();
  const stack = new PipelineStack(app, 'test', { env, configuration: config });
  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

test('MainPipelineExists', () => {
  const app = new App();
  const stack = new PipelineStack(app, 'test', { env, configuration: config });
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
});


test('StackHasLambdas', () => {
  const app = new App();
  const stack = new UitkeringsApiStack(app, 'api');
  const template = Template.fromStack(stack);
  console.log(template);
  template.resourceCountIs('AWS::Lambda::Function', 2); //Setting log retention creates a lambda
});


test('StackHasParameters', () => {
  const app = new App();
  const stack = new ParameterStack(app, 'test');
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::SSM::Parameter', 4);
});