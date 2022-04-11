const { awscdk } = require('projen');
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.20.0',
  cdkVersionPinning: true,
  defaultReleaseBranch: 'production',
  release: true,
  majorVersion: 1,
  license: 'EUPL-1.2',
  name: 'mijnuitkering',
  deps: [
    'dotenv',
    '@aws-cdk/aws-apigatewayv2-alpha',
    '@aws-cdk/aws-apigatewayv2-integrations-alpha',
    '@aws-solutions-constructs/aws-lambda-dynamodb@2.0.0',
  ], /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
    'copyfiles',
  ], /* Build dependencies for this module. */
  depsUpgradeOptions: {
    workflowOptions: {
      branches: ['acceptance'],
    },
  },
  // packageName: undefined,  /* The "name" in package.json. */
  mutableBuild: true,
  jestOptions: {
    jestConfig: {
      setupFiles: ['dotenv/config'],
      testPathIgnorePatterns: ['/node_modules/', '/cdk.out'],
      roots: ['src', 'test'],
    },
  },
  scripts: {
    'install:uitkeringen': 'copyfiles -f src/shared/*.js src/app/uitkeringen/shared && cd src/app/uitkeringen && npm install',
    'postinstall': 'npm run install:uitkeringen',
  },
  eslintOptions: {
    devdirs: ['src/app/uitkeringen/tests', '/test', '/build-tools'],
  },
  gitignore: [
    '.env',
    '.vscode',
    'src/app/**/shared',
    '.DS_Store',
    'src/app/**/tests/output',
  ],
});
project.synth();