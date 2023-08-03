import { Statics } from './statics';

export interface Environment {
  account: string;
  region: string;
}

export interface Configurable {
  configuration: Configuration;
}

export interface Configuration {
  branchName: string;
  buildEnvironment: Environment;
  deploymentEnvironment: Environment;
  pipelineStackCdkName: string;
  pipelineName: string;
  envIsInNewLandingZone: boolean;
}

const configurations: { [key: string]: Configuration } = {
  'acceptance': {
    branchName: 'acceptance',
    buildEnvironment: Statics.deploymentEnvironment,
    deploymentEnvironment: Statics.acceptanceEnvironment,
    envIsInNewLandingZone: false,
    pipelineName: 'mijnuitkering-acceptance',
    pipelineStackCdkName: 'uitkering-pipeline-acceptance',
  },
  'production': {
    branchName: 'production',
    buildEnvironment: Statics.deploymentEnvironment,
    deploymentEnvironment: Statics.productionEnvironment,
    envIsInNewLandingZone: false,
    pipelineName: 'mijnuitkering-production',
    pipelineStackCdkName: 'uitkering-pipeline-production',
  },
  'acceptance-new-lz': {
    branchName: 'acceptance-new-lz',
    buildEnvironment: Statics.gnBuildEnvironment,
    deploymentEnvironment: Statics.gnMijnNijmegenAccpEnvironment,
    envIsInNewLandingZone: true,
    pipelineName: 'mijnuitkering-acceptance',
    pipelineStackCdkName: 'uitkering-pipeline-acceptance',
  },
  'production-new-lz': {
    branchName: 'production-new-lz',
    buildEnvironment: Statics.gnBuildEnvironment,
    deploymentEnvironment: Statics.gnMijnNijmegenProdEnvironment,
    envIsInNewLandingZone: true,
    pipelineName: 'mijnuitkering-production',
    pipelineStackCdkName: 'uitkering-pipeline-production',
  },
};

export function getConfiguration(branchName: string) {
  const config = configurations[branchName];
  if (!config) {
    throw new Error(`Configuration for branch ${branchName} not found`);
  }
  return config;
}