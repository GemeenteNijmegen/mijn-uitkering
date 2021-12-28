const lambda = require('../index.js');
test('Return 200', async () => {
    const result = await lambda.handler({}, {});
    expect(result.statusCode).toBe(200);
});

test('No redirect if no session cookie', async () => {
    const result = await lambda.handler({ 'cookies': [ 'demo=12345' ] }, {});
    expect(result.statusCode).toBe(302);
});

test('Redirect if loggedin', async () => {
    const result = await lambda.handler({ 'cookies': [ 'session=12345' ] }, {});
    expect(result.statusCode).toBe(302);
});