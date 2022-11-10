const { ApiClient } = require('@gemeentenijmegen/apiclient');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { uitkeringsRequestHandler } = require("./uitkeringsRequestHandler");
const { Response } = require('@gemeentenijmegen/apigateway-http/lib/V2/Response');

const dynamoDBClient = new DynamoDBClient();
const apiClient = new ApiClient();

async function init() {
    console.time('init');
    console.timeLog('init', 'start init');
    let promise = apiClient.init();
    console.timeEnd('init');
    return promise;
}

const initPromise = init();

function parseEvent(event) {
    return { 
        'cookies': event?.cookies?.join(';'),
    };
}

exports.handler = async (event, context) => {
    try {
        const params = parseEvent(event);
        await initPromise;
        return await uitkeringsRequestHandler(params.cookies, apiClient, dynamoDBClient);
    
    } catch (err) {
        console.error(err);
        Response.error(500);
    }
};