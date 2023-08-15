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
}

const configurations: { [key: string]: Configuration } = {
  acceptance: {
    branchName: 'acceptance',
    buildEnvironment: Statics.gnBuildEnvironment,
    deploymentEnvironment: Statics.gnMijnNijmegenAccpEnvironment,
    pipelineName: 'mijnuitkering-acceptance',
    pipelineStackCdkName: 'uitkering-pipeline-acceptance',
  },
  production: {
    branchName: 'production',
    buildEnvironment: Statics.gnBuildEnvironment,
    deploymentEnvironment: Statics.gnMijnNijmegenProdEnvironment,
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