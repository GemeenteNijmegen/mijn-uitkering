import fs from 'fs';
import path from 'path';
import { ApiClient } from '@gemeentenijmegen/apiclient';
import { BrpApi } from '../BrpApi';
import { FileApiClient } from '../FileApiClient';

if (process.env.VERBOSETESTS!='True') {
  global.console.error = jest.fn();
  global.console.time = jest.fn();
  global.console.log = jest.fn();
}

async function getStringFromFilePath(filePath: string): Promise<string> {
  return new Promise((res, rej) => {
    fs.readFile(path.join(__dirname, filePath), (err, data) => {
      if (err) {return rej(err);}
      return res(data.toString());
    });
  });
}


// This test doesn't run in CI by default, depends on unavailable secrets
test('Mock api', async () => {
  if (!process.env.CERTPATH || !process.env.KEYPATH || !process.env.CAPATH) {
    return;
  }
  const client = new FileApiClient();
  const api = new BrpApi(client);
  const result = await api.getBrpData('900222670');
  console.debug(result);
  expect(result.Persoon.BSN.BSN).toBe('900222670');
});

// This test doesn't run in CI by default, depends on unavailable secrets
test('Api', async () => {
  if (!process.env.CERTPATH || !process.env.KEYPATH || !process.env.CAPATH) {
    return;
  }
  const cert = await getStringFromFilePath(process.env.CERTPATH);
  const key = await getStringFromFilePath(process.env.KEYPATH);
  const ca = await getStringFromFilePath(process.env.CAPATH);
  const client = new ApiClient(cert, key, ca);
  const api = new BrpApi(client);
  const result = await api.getBrpData('999993653');
  expect(result.Persoon.BSN.BSN).toBe('999993653');
  expect(result.Persoon.Persoonsgegevens.Naam).toBe('S. Moulin');
});

// This test doesn't run in CI by default, depends on unavailable secrets
test('Api', async () => {
  if (
    !process.env.CERTPATH
    || !process.env.KEYPATH
    || !process.env.CAPATH
  ) {
    console.debug('Skipping live API test');
    return;
  }
  const cert = await getStringFromFilePath(process.env.CERTPATH);
  const key = await getStringFromFilePath(process.env.KEYPATH);
  const ca = await getStringFromFilePath(process.env.CAPATH);
  const client = new ApiClient(cert, key, ca);
  const api = new BrpApi(client);
  const result = await api.getBrpData(12345678);
  expect(result).toHaveProperty('error');
});