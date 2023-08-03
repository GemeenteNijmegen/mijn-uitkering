import { Stack, StackProps, Tags, pipelines, CfnParameter, Aspects } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Configurable } from './Configuration';
import { ParameterStage } from './ParameterStage';
import { Statics } from './statics';
import { UitkeringsApiStage } from './UitkeringsApiStage';
import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';

export interface PipelineStackProps extends StackProps, Configurable {}

export class PipelineStack extends Stack {
  branchName: string;
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
    super(scope, id, props);
    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);
    if(props.configuration.envIsInNewLandingZone){
      Aspects.of(this).add(new PermissionsBoundaryAspect());
    }
    this.branchName = props.configuration.branchName;
    const pipeline = this.pipeline();
    pipeline.addStage(new ParameterStage(this, 'mijn-uitkering-parameters', { env: props.configuration.deploymentEnvironment, configuration: props.configuration }));
    pipeline.addStage(new UitkeringsApiStage(this, 'mijn-uitkering-api', { env: props.configuration.deploymentEnvironment, configuration: props.configuration }));
  }

  pipeline(): pipelines.CodePipeline {
    const connectionArn = new CfnParameter(this, 'connectionArn');
    const source = pipelines.CodePipelineSource.connection('GemeenteNijmegen/mijn-uitkering', this.branchName, {
      connectionArn: connectionArn.valueAsString,
    });
    const pipeline = new pipelines.CodePipeline(this, `mijnuitkering-${this.branchName}`, {
      pipelineName: `mijnuitkering-${this.branchName}`,
      dockerEnabledForSelfMutation: true,
      dockerEnabledForSynth: true,
      crossAccountKeys: true,
      synth: new pipelines.ShellStep('Synth', {
        input: source,
        env: {
          BRANCH_NAME: this.branchName,
        },
        commands: [
          'yarn install --frozen-lockfile',
          'npx projen build',
          'npx projen synth',
        ],
      }),
    });
    return pipeline;
  }
}