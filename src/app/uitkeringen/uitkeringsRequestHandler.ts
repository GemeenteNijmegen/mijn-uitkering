import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ApiClient } from '@gemeentenijmegen/apiclient';

import { Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import { Session } from '@gemeentenijmegen/session';
import * as template from './templates/uitkeringen.mustache';
import * as uitkering from './templates/uitkerings-item.mustache';
import { UitkeringsApi } from './UitkeringsApi';
import { render } from '../../shared/render';

export async function uitkeringsRequestHandler(cookies: string, apiClient: ApiClient, dynamoDBClient: DynamoDBClient) {
  if (!apiClient || !dynamoDBClient) { throw new Error('all handler params are required'); }
  console.time('request');
  console.timeLog('request', 'start request');

  let session = new Session(cookies, dynamoDBClient);
  await session.init();
  console.timeLog('request', 'init session');
  if (session.isLoggedIn() == true) {
    // Get API data
    const response = await handleLoggedinRequest(session, apiClient);
    console.timeEnd('request');
    return response;
  }
  console.timeEnd('request');
  return Response.redirect('/login');
}

async function handleLoggedinRequest(session: Session, apiClient: ApiClient) {
  const bsn = session.getValue('bsn');
  console.timeLog('request', 'Api Client init');
  const uitkeringsApi = new UitkeringsApi(apiClient);
  console.timeLog('request', 'UitkeringsApi');
  const data = await uitkeringsApi.getUitkeringen(bsn);
  data.volledigenaam = session.getValue('username');
  data.multipleUitkeringen = (data?.uitkeringen?.length > 1);

  const html = await renderHtml(data);

  return Response.html(html, 200, session.getCookie());
}

async function renderHtml(data: any) {
  data.title = 'Uitkeringen';
  data.shownav = true;

  // render page
  const html = await render(data, template.default, { uitkering: uitkering.default });
  return html;
}
