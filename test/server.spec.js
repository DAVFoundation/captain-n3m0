const { promisify } = require("util");
const server = require('../server');
const handler = promisify(server.handler);
const context = {};
let event, healthCheckEvent;

beforeEach(() => {
  event = {
    httpMethod: 'GET',
    queryStringParameters: {
      key: '0xb57e00b34959a72ccf2131cf0318b413ae457bd2'
    }
  };
  healthCheckEvent = {...event, path: '/healthy'};
});

test('health check', async () => {
  const response = await handler(healthCheckEvent, context);
  expect(response.statusCode).toBe(200);
  expect(response.body).toBe('"Hello World!"');
});
