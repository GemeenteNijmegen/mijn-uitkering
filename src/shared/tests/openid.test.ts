test('Returns 200', async () => {
    const result = await lambda.handler({ cookies: ['session=12345'] }, {});
    expect(result.statusCode).toBe(200);
});