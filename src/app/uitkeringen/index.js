const { Session } = require('./shared/Session');
const { render } = require('./shared/render');
const { UitkeringsApi } = require('./UitkeringsApi');
const { BrpApi } = require('./BrpApi');
const { ApiClient } = require('./ApiClient');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

const dynamoDBClient = new DynamoDBClient();

function redirectResponse(location, code = 302) {
    return {
        'statusCode': code,
        'body': '',
        'headers': { 
            'Location': location
        }
    }
}

function parseEvent(event) {
    return { 
        'cookies': event?.cookies?.join(';'),
    };
}

async function requestHandler(cookies, client) {
    console.time('request');
    console.timeLog('request', 'start request');
    let session = new Session(dynamoDBClient, cookies);
    await session.init();
    console.timeLog('request', 'init session');
    if(session.isLoggedIn() !== true) {
        return redirectResponse('/login');
    } 
    // Get API data
    client = client ? client : new ApiClient();
    await client.init();
    console.timeLog('request', 'Api Client init');
    const bsn = session.getValue('bsn');
    const brpApi = new BrpApi(client);
    console.timeLog('request', 'Brp Api');
    const uitkeringsApi = new UitkeringsApi(client);
    console.timeLog('request', 'UitkeringsApi');
    const [data, brpData] = await Promise.all([uitkeringsApi.getUitkeringen(bsn), brpApi.getBrpData(bsn)]);

    data.volledigenaam = brpData?.Persoon?.Persoonsgegevens?.Naam ? brpData.Persoon.Persoonsgegevens.Naam : 'Onbekende gebruiker';
    
    // render page
    const html = await render(data, __dirname + '/templates/uitkeringen.mustache');
    response = {
        'statusCode': 200,
        'body': html,
        'headers': { 
            'Content-type': 'text/html'
        },
        'cookies': [
            'session='+ session.sessionId + '; HttpOnly; Secure;',
        ]
    }
    console.timeEnd('request');
    return response;
}
exports.handler = async (event, context) => {
    try {
        const params = parseEvent(event);
        return await requestHandler(params.cookies);
    
    } catch (err) {
        console.debug(err);
        response = {
            'statusCode': 500
        }
        return response;
    }
};
exports.requestHandler = requestHandler;