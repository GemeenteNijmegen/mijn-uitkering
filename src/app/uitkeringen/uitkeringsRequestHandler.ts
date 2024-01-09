import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { ApiClient } from '@gemeentenijmegen/apiclient';

import { Response } from '@gemeentenijmegen/apigateway-http/lib/V2/Response';
import { Session } from '@gemeentenijmegen/session';
import * as template from './templates/uitkeringen.mustache';
import * as uitkering from './templates/uitkerings-item.mustache';
import { MdiFileMultiple } from '../../shared/Icons';
import { nav } from '../../shared/nav';
import { UitkeringsApi } from './UitkeringsApi';
import { render } from '../../shared/render';

interface Config {
  apiClient: ApiClient;
  dynamoDBClient: DynamoDBClient;
  showZaken: boolean; //Show zaken in menu
}

export class uitkeringsRequestHandler {
  private config: Config;
  constructor(config: Config) {
    this.config = config;
    const zakenNav = {
      url: '/zaken',
      title: 'Zaken',
      description: 'Bekijk de status van uw zaken en aanvragen.',
      label: 'Bekijk zaken',
      icon: MdiFileMultiple.default,
    };
    if (config?.showZaken) {
      nav.push(zakenNav);
    }
  }

  async handleRequest(cookies: string) {
    console.time('request');
    console.timeLog('request', 'start request');
  
    let session = new Session(cookies, this.config.dynamoDBClient);
    await session.init();
    console.timeLog('request', 'init session');
    if (session.isLoggedIn() == true) {
      // Get API data
      const response = await this.handleLoggedinRequest(session);
      console.timeEnd('request');
      return response;
    }
    console.timeEnd('request');
    return Response.redirect('/login');
  }  

  private async handleLoggedinRequest(session: Session) {
    const bsn = session.getValue('bsn');
    console.timeLog('request', 'Api Client init');
    const uitkeringsApi = new UitkeringsApi(this.config.apiClient);
    console.timeLog('request', 'UitkeringsApi');
    const data = await uitkeringsApi.getUitkeringen(bsn);
    data.volledigenaam = session.getValue('username');
    data.multipleUitkeringen = (data?.uitkeringen?.length > 1);

    const html = await this.renderHtml(data);

    return Response.html(html, 200, session.getCookie());
  }

  async renderHtml(data: any) {
    data.title = 'Uitkeringen';
    data.shownav = true;
    data.nav = nav;

    // render page
    const html = await render(data, template.default, { uitkering: uitkering.default });
    return html;
  }
}
