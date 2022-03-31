const { ApiClient } = require('./ApiClient');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { requestHandler } = require("./requestHandler");

const dynamoDBClient = new DynamoDBClient();
exports.dynamoDBClient = dynamoDBClient;
const apiClient = new ApiClient();

async function init() {
    return new Promise((resolve, reject) => {
        console.time('init');
        console.timeLog('init', 'start init');
        apiClient.init();
        console.timeEnd('init');
    });
}

const initPromise = init();

function redirectResponse(location, code = 302) {
    return {
        'statusCode': code,
        'body': '',
        'headers': { 
            'Location': location
        }
    }
}
exports.redirectResponse = redirectResponse;

function parseEvent(event) {
    return { 
        'cookies': event?.cookies?.join(';'),
    };
}

exports.handler = async (event, context) => {
    try {
        const params = parseEvent(event);
        await initPromise;
        return await requestHandler(params.cookies, apiClient, dynamoDBClient);
    
    } catch (err) {
        console.debug(err);
        response = {
            'statusCode': 500
        }
        return response;
    }
};