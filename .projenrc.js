const { GemeenteNijmegenCdkApp } = require('@gemeentenijmegen/projen-project-type');
const project = new GemeenteNijmegenCdkApp({
  cdkVersion: '2.54.0',
  defaultReleaseBranch: 'production',
  majorVersion: 1,
  name: 'mijnuitkering',
  deps: [
    '@gemeentenijmegen/projen-project-type',
    '@gemeentenijmegen/aws-constructs',
    'dotenv',
    '@aws-cdk/aws-apigatewayv2-alpha',
    '@aws-cdk/aws-apigatewayv2-integrations-alpha',
    '@aws-solutions-constructs/aws-lambda-dynamodb',
  ], /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  devDeps: [
    'copyfiles',
  ], /* Build dependencies for this module. */
  mutableBuild: true,
  jestOptions: {
    jestConfig: {
      setupFiles: ['dotenv/config'],
      testPathIgnorePatterns: ['/node_modules/', '/cdk.out'],
      roots: ['src', 'test'],
    },
  },
  scripts: {
    'install:uitkeringen': 'copyfiles -f src/shared/* src/app/uitkeringen/shared && cd src/app/uitkeringen && npm install',
    'postinstall': 'npm run install:uitkeringen',
    'post-upgrade': 'cd src/app/uitkeringen && npx npm-check-updates --upgrade --target=minor',
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