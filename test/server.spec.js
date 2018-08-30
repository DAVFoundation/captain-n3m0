const { promisify } = require('util');
const server = require('../server');
const handler = promisify(server.handler);
const context = {};
let event, healthCheckEvent, createNeedEvent, statusEvent, readyToChargeEvent;

beforeEach(() => {
  event = {
    httpMethod: 'GET',
    queryStringParameters: {
      key: '0xb57e00b34959a72ccf2131cf0318b413ae457bd2',
    },
  };
  healthCheckEvent = { ...event, path: '/healthy' };
  createNeedEvent = { ...event, path: '/need' };
  statusEvent = { ...event, path: '/status' };
  readyToChargeEvent = { ...event, path: '/ready_to_charge' };
});

describe('health check', async () => {
  test('returns hello world', async () => {
    const response = await handler(healthCheckEvent, context);
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('"Hello World!"');
  });
});

describe('create need', async () => {
  test('returns the new mission id', async () => {
    const response = await handler(createNeedEvent, context);
    const body = JSON.parse(response.body);
    expect(response.statusCode).toBe(200);
    expect(body.missionId).toBeGreaterThan(0);
  });
});

describe('status check', async () => {
  let needResponse, missionId;
  beforeEach(async () => {
    needResponse = await handler(createNeedEvent, context);
    missionId = JSON.parse(needResponse.body).missionId;
    statusEvent.queryStringParameters.mission_id = missionId;
  });

  test('returns initial state after need creation', async () => {
    let statusResponse = await handler(statusEvent, context);
    expect(statusResponse.statusCode).toBe(200);
    const statusBody = JSON.parse(statusResponse.body);
    expect(statusBody.state).toEqual('need_sent');
    expect(statusBody.need_created_at).toMatch(
      new Date().getFullYear().toString(),
    );
    expect(statusBody.charging_started_at).toBe(null);
    expect(statusBody.charging_completed_at).toBe(null);
  });
});

describe('ready to charge', async () => {
  let needResponse, missionId;
  beforeEach(async () => {
    needResponse = await handler(createNeedEvent, context);
    missionId = JSON.parse(needResponse.body).missionId;
    readyToChargeEvent.queryStringParameters.mission_id = missionId;
  });

  test('advances the state to ready_to_charge', async () => {
    let statusResponse = await handler(readyToChargeEvent, context);
    expect(statusResponse.statusCode).toBe(200);
    const statusBody = JSON.parse(statusResponse.body);
    expect(statusBody.state).toEqual('ready_to_charge');
    expect(statusBody.need_created_at).toMatch(
      new Date().getFullYear().toString(),
    );
    expect(statusBody.charging_started_at).toBe(null);
    expect(statusBody.charging_completed_at).toBe(null);
  });
});
