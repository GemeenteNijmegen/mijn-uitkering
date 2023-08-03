import { PermissionsBoundaryAspect } from '@gemeentenijmegen/aws-constructs';
import { Aspects, Stage, StageProps, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './statics';
import { UitkeringsApiStack } from './UitkeringsApiStack';
import { Configurable } from './Configuration';

export interface UitkeringsApiStageProps extends StageProps, Configurable {}

/**
 * Stage responsible for the API Gateway and lambdas
 */
export class UitkeringsApiStage extends Stage {
  constructor(scope: Construct, id: string, props: UitkeringsApiStageProps) {
    super(scope, id, props);
    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);
    if(props.configuration.envIsInNewLandingZone){
      Aspects.of(this).add(new PermissionsBoundaryAspect());
    }

    new UitkeringsApiStack(this, 'uitkerings-api');
  }
}