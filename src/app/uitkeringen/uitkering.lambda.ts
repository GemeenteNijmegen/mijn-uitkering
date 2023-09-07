const { ApiClient } = require('@gemeentenijmegen/apiclient');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { uitkeringsRequestHandler } = require("./uitkeringsRequestHandler");
import { APIGatewayProxyEventV2 } from 'aws-lambda';
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

function parseEvent(event: APIGatewayProxyEventV2) {
    return { 
        'cookies': event?.cookies?.join(';'),
    };
}

exports.handler = async (event: any, _context: any) => {
    try {
        const params = parseEvent(event);
        await initPromise;
        return await uitkeringsRequestHandler(params.cookies, apiClient, dynamoDBClient);
    
    } catch (err) {
        console.error(err);
        return Response.error(500);
    }
};
