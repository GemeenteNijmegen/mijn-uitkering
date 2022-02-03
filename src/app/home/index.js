const { Session } = require('./shared/Session');
const { render } = require('./shared/render');
const { UitkeringsApi, FileConnector } = require('./UitkeringsApi');

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

async function requestHandler(cookies) {
    let session = new Session(cookies);
    await session.init();
    if(session.isLoggedIn() !== true) {
        return redirectResponse('/login');
    } 
    // Get API data
    const api = new UitkeringsApi(session.getValue('bsn'), FileConnector);
    const data = await api.getUitkeringen();
    
    // render page
    const html = await render(data, __dirname + '/templates/home.mustache');
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