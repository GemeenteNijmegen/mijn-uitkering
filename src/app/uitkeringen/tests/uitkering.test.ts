import * as fs from 'fs';
import * as path from 'path';
import { DynamoDBClient, GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { SecretsManagerClient, GetSecretValueCommandOutput } from '@aws-sdk/client-secrets-manager';
import { SSMClient, GetParameterCommandOutput } from '@aws-sdk/client-ssm';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { mockClient } from 'jest-aws-client-mock';
import { ApiClient } from '../ApiClient';
import { uitkeringsRequestHandler } from '../uitkeringsRequestHandler';

beforeAll(() => {
  if (process.env.VERBOSETESTS!='True') {
    global.console.error = jest.fn();
    global.console.time = jest.fn();
    global.console.log = jest.fn();
  }
  // Set env variables
  process.env.SESSION_TABLE = 'mijnuitkering-sessions';
  process.env.AUTH_URL_BASE = 'https://authenticatie-accp.nijmegen.nl';
  process.env.APPLICATION_URL_BASE = 'https://testing.example.com/';
  process.env.CLIENT_SECRET_ARN = '123';
  process.env.OIDC_CLIENT_ID = '1234';
  process.env.OIDC_SCOPE = 'openid';

  process.env.MTLS_PRIVATE_KEY_ARN = 'testarn';

  const secretsOutput: GetSecretValueCommandOutput = {
    $metadata: {},
    SecretString: 'test',
  };
  secretsMock.mockImplementation(() => secretsOutput);
  const ssmOutput: GetParameterCommandOutput = {
    $metadata: {},
    Parameter: {
      Value: 'test',
    },
  };

  secretsMock.mockImplementation(() => secretsOutput);
  parameterStoreMock.mockImplementation(() => ssmOutput);
});


const ddbMock = mockClient(DynamoDBClient);
const secretsMock = mockClient(SecretsManagerClient);
const axiosMock = new MockAdapter(axios);
const parameterStoreMock = mockClient(SSMClient);

beforeEach(() => {
  ddbMock.mockReset();
  secretsMock.mockReset();
  axiosMock.reset();

  const getItemOutput: Partial<GetItemCommandOutput> = {
    Item: {
      data: {
        M: {
          loggedin: { BOOL: true },
          bsn: { S: '999990676' },
        },
      },
    },
  };
  ddbMock.mockImplementation(() => getItemOutput);
});

test('Returns 200', async () => {
  const output: GetSecretValueCommandOutput = {
    $metadata: {},
    SecretString: 'ditiseennepgeheim',
  };
  secretsMock.mockImplementation(() => output);
  const file = 'uitkering-12345678.xml';
  const filePath = path.join('responses', file);
  const returnData = await getStringFromFilePath(filePath)
    .then((data: any) => {
      return data;
    });
  axiosMock.onPost().reply(200, returnData);
  const client = new ApiClient();
  const dynamoDBClient = new DynamoDBClient({});
  const result = await uitkeringsRequestHandler('session=12345', client, dynamoDBClient);
  expect(result.statusCode).toBe(200);
});

test('Shows overview page', async () => {
  const output: GetSecretValueCommandOutput = {
    $metadata: {},
    SecretString: 'ditiseennepgeheim',
  };
  secretsMock.mockImplementation(() => output);
  const client = new ApiClient();
  const dynamoDBClient = new DynamoDBClient({ region: 'eu-west-1' });
  const file = 'uitkering-12345678.xml';
  const filePath = path.join('responses', file);
  const returnData = await getStringFromFilePath(filePath)
    .then((data: any) => {
      return data;
    });
  axiosMock.onPost().reply(200, returnData);
  const result = await uitkeringsRequestHandler('session=12345', client, dynamoDBClient);
  expect(result.body).toMatch('Mijn Uitkering');
  expect(result.body).toMatch('Participatiewet');
  fs.writeFile(path.join(__dirname, 'output', 'test.html'), result.body, () => {});
});


test('Shows two uitkeringen page', async () => {
  const output: GetSecretValueCommandOutput = {
    $metadata: {},
    SecretString: 'ditiseennepgeheim',
  };
  secretsMock.mockImplementation(() => output);
  const client = new ApiClient();
  const dynamoDBClient = new DynamoDBClient({ region: 'eu-west-1' });
  const file = 'tweeuitkeringen.xml';
  const filePath = path.join('responses', file);
  const returnData = await getStringFromFilePath(filePath)
    .then((data: any) => {
      return data;
    });
  axiosMock.onPost().reply(200, returnData);
  const result = await uitkeringsRequestHandler('session=12345', client, dynamoDBClient);
  expect(result.body).toMatch('Mijn Uitkering');
  expect(result.body).toMatch('Participatiewet');
  fs.writeFile(path.join(__dirname, 'output', 'test-twee.html'), result.body, () => {});
});


test('Shows empty page', async () => {
  const output: GetSecretValueCommandOutput = {
    $metadata: {},
    SecretString: 'ditiseennepgeheim',
  };
  secretsMock.mockImplementation(() => output);
  const client = new ApiClient();
  const dynamoDBClient = new DynamoDBClient({ region: 'eu-west-1' });
  const file = 'empty.xml';
  const filePath = path.join('responses', file);
  const returnData = await getStringFromFilePath(filePath)
    .then((data: any) => {
      return data;
    });
  axiosMock.onPost().reply(200, returnData);
  const result = await uitkeringsRequestHandler('session=12345', client, dynamoDBClient);
  expect(result.body).toMatch('Mijn Uitkering');
  expect(result.body).toMatch('U heeft geen lopende uitkeringen');
  fs.writeFile(path.join(__dirname, 'output', 'test-empty.html'), result.body, () => {});
});


test('Shows error page', async () => {
  const output: GetSecretValueCommandOutput = {
    $metadata: {},
    SecretString: 'ditiseennepgeheim',
  };
  secretsMock.mockImplementation(() => output);
  const client = new ApiClient();
  const dynamoDBClient = new DynamoDBClient({ region: 'eu-west-1' });

  axiosMock.onPost().reply(404);
  const result = await uitkeringsRequestHandler('session=12345', client, dynamoDBClient);
  expect(result.body).toMatch('Mijn Uitkering');
  expect(result.body).toMatch('Er is iets misgegaan');
  fs.writeFile(path.join(__dirname, 'output', 'test-error.html'), result.body, () => {});
});

async function getStringFromFilePath(filePath: string) {
  return new Promise((res, rej) => {
    fs.readFile(path.join(__dirname, filePath), (err, data) => {
      if (err) {return rej(err);}
      return res(data.toString());
    });
  });
}