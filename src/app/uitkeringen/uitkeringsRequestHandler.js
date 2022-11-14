const { render } = require('./shared/render');
const { UitkeringsApi } = require('./UitkeringsApi');
const { BrpApi } = require('./BrpApi');
const { Session } = require('@gemeentenijmegen/session');
const { Response } = require('@gemeentenijmegen/apigateway-http/lib/V2/Response');

exports.uitkeringsRequestHandler = async (cookies, apiClient, dynamoDBClient) => {
    if(!cookies || !apiClient || !dynamoDBClient) { throw new Error('all handler params are required'); }
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

async function handleLoggedinRequest(session, apiClient) {
    console.timeLog('request', 'Api Client init');
    const bsn = session.getValue('bsn');
    const brpApi = new BrpApi(apiClient);
    console.timeLog('request', 'Brp Api');
    const uitkeringsApi = new UitkeringsApi(apiClient);
    console.timeLog('request', 'UitkeringsApi');
    const [data, brpData] = await Promise.all([uitkeringsApi.getUitkeringen(bsn), brpApi.getBrpData(bsn)]);
    data.volledigenaam = brpData?.Persoon?.Persoonsgegevens?.Naam ? brpData.Persoon.Persoonsgegevens.Naam : 'Onbekende gebruiker';
    data.multipleUitkeringen = (data?.uitkeringen?.length > 1);

    const html = await renderHtml(data);

    return Response.html(html, 200, session.getCookie());
}

async function renderHtml(data) {
    data.title = 'Uitkeringen';
    data.shownav = true;

    // render page
    const html = await render(data, __dirname + '/templates/uitkeringen.mustache', {
        'header': __dirname + '/shared/header.mustache',
        'footer': __dirname + '/shared/footer.mustache',
        'uitkering': __dirname + '/templates/uitkerings-item.mustache'
    });
    return html;
}

