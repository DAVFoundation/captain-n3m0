const CONTEXT_SWITCH_TIME = 100;
const request = require('supertest');
const apiKey = process.env.CAPTAIN_API_KEY;
let app, listener;

const forContextSwitch = (factor = 1) => {
    return new Promise((resolve) => {
        jest.useRealTimers();
        setTimeout(resolve, CONTEXT_SWITCH_TIME * factor);
        jest.useFakeTimers();
    });
};


const messagesMock = {
    subscribe: jest.fn((cb) => cb({})),
}

const missionMock = {
    messages: jest.fn(() => messagesMock),
    signContract: jest.fn(),
    finalizeMission: jest.fn(),
    sendMessage: jest.fn()
}

const missionsMock = {
    subscribe: jest.fn(async (cb) => {
        await forContextSwitch();
        cb(missionMock);
    }),
}

const bidMock = {
    accept: jest.fn(() => missionMock),
    missions: jest.fn(() => missionsMock),
    sendMessage: jest.fn()
}

const bidsMock = {
    subscribe: jest.fn((cb) => cb(bidMock)),
}

const needMock = {
    bids: jest.fn(() => bidsMock),
    createBid: jest.fn(() => bidMock),
    sendMessage: jest.fn()
}

const needsMock = {
    subscribe: jest.fn((cb) => cb(needMock)),
}

const identityMock = {
    publishNeed: jest.fn(() => needMock),
    needsForType: jest.fn(() => needsMock)
}

describe('Test healthy', async () => {

    beforeAll(() => {
        jest.doMock('dav-js', () => ({
            SDKFactory: () => ({
                getIdentity: () => identityMock
            }),
        }));
        app = require('./index').app;
        listener = require('./index').listener;
        Date = class Date {
            constructor() {
            }
        };
        Date.now = jest.fn(() => 1);
    });

    test('It response hello world', async () => {
        const response = await request(app).get('/healthy');
        expect(response.text).toBe('hello world');
    });

    test('It reject an invalid key error message', async () => {
        const response = await request(app).get(`/need/INVALID_API_KEY`);
        expect(JSON.parse(response.text)).toEqual({message: 'Invalid Key'});
    });

    test('It success to create a new mission with id 1', async () => {
        const response = await request(app).get(`/need/${apiKey}`);
        expect(JSON.parse(response.text)).toEqual({id: 1});
    });

    test('It success to create a new mission with id 2', async () => {
        const response = await request(app).get(`/need/${apiKey}`);
        expect(JSON.parse(response.text)).toEqual({id: 2});
    });

    test('It change mission state to ready_to_charge', async () => {
        await forContextSwitch();
        const response = await request(app).get(`/ready_to_charge/${apiKey}/1`);
        expect(JSON.parse(response.text)).toEqual({id: 1, state: 'ready_to_charge'});
    });

    test('mission state is ready_to_charge', async () => {
        const response = await request(app).get(`/status/${apiKey}/1`);
        expect(JSON.parse(response.text)).toEqual({id: 1, state: 'ready_to_charge'});
    });

    test('It change mission state to charging', async () => {
        const response = await request(app).get(`/begin_charging/${apiKey}/1`);
        expect(JSON.parse(response.text)).toEqual({id: 1, state: 'charging', charging_started_at: {}});
    });

    test('mission 2 state is need_sent', async () => {
        const response = await request(app).get(`/status/${apiKey}/2`);
        expect(JSON.parse(response.text)).toEqual({id: 2, state: 'need_sent'});
    });

    test('mission 1 state is charging', async () => {
        const response = await request(app).get(`/status/${apiKey}/1`);
        expect(JSON.parse(response.text)).toEqual({id: 1, state: 'charging', charging_started_at: {}});
    });

    test('It change mission state to charging_complete', async () => {
        const response = await request(app).get(`/finish_charging/${apiKey}/1`);
        expect(JSON.parse(response.text)).toEqual({id: 1, state: 'charging_complete', charging_started_at: {}, charging_completed_at: {}});
    });

    afterAll(function(done){
        listener.close(done)
    })
});