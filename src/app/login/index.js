const cookie = require('cookie');

async function checkLogin(event) {
    if('cookies' in event == false) {
        console.log('no cookies');
        return false;
    }
    const cookies = cookie.parse(event.cookies.join(';'));
    if('session' in cookies == false) { 
        console.log('no session');
        return false; 
    }
    return true;
}

function redirectToHome() {
    const response = {
        'statusCode': 302
    };
    return response;
}

exports.handler = async (event, context) => {
    try {
        console.log(event);
        const isLoggedIn = await checkLogin(event);
        if(isLoggedIn) {
            return redirectToHome();
        }
        const html = '<html><head><title>Login</title></head><body><h1>Login</h1></body></html>';
        response = {
            'statusCode': 200,
            'body': html,
            'headers': { 
                'Content-type': 'text/html'
            }
        }
        return response;
    } catch (err) {
        console.log(err);
        return err;
    }
};