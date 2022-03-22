import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Dotenv from 'dotenv';
import { ParameterStack } from '../src/ParameterStage';
import { PipelineStackDevelopment } from '../src/PipelineStackDevelopment';
import { UitkeringsApiStack } from '../src/UitkeringsApiStack';

beforeAll(() => {
  Dotenv.config();
});

test('Snapshot', () => {
  const app = new App();
  const stack = new PipelineStackDevelopment(app, 'test', { env: { account: 'test', region: 'eu-west-1' }, branchName: 'development', deployToEnvironment: { account: 'test', region: 'eu-west-1' } });
  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});

test('MainPipelineExists', () => {
  const app = new App();
  const stack = new PipelineStackDevelopment(app, 'test', { env: { account: 'test', region: 'eu-west-1' }, branchName: 'development', deployToEnvironment: { account: 'test', region: 'eu-west-1' } });
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::CodePipeline::Pipeline', 1);
});


test('StackHasLambdas', () => {
  const app = new App();
  const stack = new UitkeringsApiStack(app, 'api');
  const template = Template.fromStack(stack);
  console.log(template.toJSON());
  template.resourceCountIs('AWS::Lambda::Function', 2); //Setting log retention creates a lambda
});


test('StackHasParameters', () => {
  const app = new App();
  const stack = new ParameterStack(app, 'test');
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::SSM::Parameter', 4);
});