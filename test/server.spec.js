const { promisify } = require("util");
const server = require('../server');
const handler = promisify(server.handler);
  const event = {
    httpMethod: 'GET',
    queryStringParameters: {
      key: '0xb57e00b34959a72ccf2131cf0318b413ae457bd2'
    }
  };
  const context = {};

test('health check', async () => {
  event.path = '/healthy';
  const response = await handler(event, context);
  expect(response.statusCode).toBe(200);
  expect(response.body).toBe('"Hello World!"');
});
