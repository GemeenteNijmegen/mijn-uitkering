import fs from 'fs';
import path from 'path';
import { ApiClient } from '@gemeentenijmegen/apiclient';
import { FileApiClient } from '../FileApiClient';
import { UitkeringsApi } from '../UitkeringsApi';

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

test('returns one uitkering', async () => {
  const client = new FileApiClient();
  let api = new UitkeringsApi(client);
  const result = await api.getUitkeringen('00000000');
  expect(result.uitkeringen).toHaveLength(1);
  expect(result.uitkeringen[0].fields).toBeInstanceOf(Array);
});

// This test doesn't run in CI by default, depends on unavailable secrets
test('Http Api', async () => {
  if (
    !process.env.CERTPATH
      || !process.env.KEYPATH
      || !process.env.CAPATH
      || !process.env.BSN
      || !process.env.UITKERING_API_URL
      || !process.env.UITKERING_BSN) {
    console.debug('skipping live api test');
    return;
  }
  const cert = await getStringFromFilePath(process.env.CERTPATH);
  const key = await getStringFromFilePath(process.env.KEYPATH);
  const ca = await getStringFromFilePath(process.env.CAPATH);
  if (!cert || !key || !ca) {
    expect(false).toBe(true);
  }
  const client = new ApiClient(cert, key, ca);
  const body = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
            <ns2:dataRequest xmlns:ns2="${process.env.UITKERING_API_URL}/">
                <identifier>${process.env.UITKERING_BSN}</identifier>
                <contentSource>mijnUitkering</contentSource>
            </ns2:dataRequest>
        </soap:Body>
    </soap:Envelope>`;

  const result = await client.requestData(process.env.UITKERING_API_URL, body, {
    'Content-type': 'text/xml',
    'SoapAction': process.env.UITKERING_API_URL + '/getData',
  });
  expect(result).toContain('<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">');
});


// This test doesn't run in CI by default, depends on unavailable secrets
test('Http Api No result', async () => {
  if (
    !process.env.CERTPATH
      || !process.env.KEYPATH
      || !process.env.CAPATH
      || !process.env.BSN
      || !process.env.UITKERING_API_URL
      || !process.env.UITKERING_BSN) {
    console.debug('skipping live api test');
    return;
  }
  const cert = await getStringFromFilePath(process.env.CERTPATH);
  const key = await getStringFromFilePath(process.env.KEYPATH);
  const ca = await getStringFromFilePath(process.env.CAPATH);
  if (!cert || !key || !ca) {
    expect(false).toBe(true);
  }
  const client = new ApiClient(cert, key, ca);
  const body = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
            <ns2:dataRequest xmlns:ns2="${process.env.UITKERING_API_URL}/">
                <identifier>12345678</identifier>
                <contentSource>mijnUitkering</contentSource>
            </ns2:dataRequest>
        </soap:Body>
    </soap:Envelope>`;

  const result = await client.requestData(process.env.UITKERING_API_URL, body, {
    'Content-type': 'text/xml',
    'SoapAction': process.env.UITKERING_API_URL + '/getData',
  });
  expect(result).toContain('<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">');
});