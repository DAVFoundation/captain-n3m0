const { updateMissionState } = require('./model/mission');
const storage = require('./lib/storage');

exports.handler = async function(event, context, callback) {
  const response = generateResponse(callback);
  const path = event.path.substring(event.path.lastIndexOf('/') + 1);
  const key = process.env.KEY;
  if (!mainHandler[path]) response.error('Invalid Path');
  if (!isKeyValid(key, event)) response.error('Invalid Key');
  await mainHandler[path]({ event, context, response });
};

const isKeyValid = (key, event) =>
  !event.queryStringParameters ||
  (event.queryStringParameters.key && event.queryStringParameters.key === key);

const getMission = async event => {
  try {
    const mission = await storage.getMission(
      event.queryStringParameters.mission_id,
    );
    return mission;
  } catch (e) {
    throw new Error('Invalid mission id');
  }
};

const mainHandler = {
  healthy: ({ response }) => response.success('Hello World!'),
  need: async ({ response }) => {
    const missionId = await storage.createNeed();
    response.success({ missionId });
  },
  status: async ({ event, response }) => {
    let mission = await getMission(event);
    mission = updateMissionState(mission);
    response.success(mission);
  },
  ready_to_charge: async ({ event, response }) => {
    let mission = await getMission(event);
    mission = updateMissionState(mission, 'ready_to_charge');
    response.success(mission);
  },
  begin_charging: async ({ event, response }) => {
    let mission = await getMission(event);
    mission = updateMissionState(mission, 'charging');
    response.success(mission);
  },
  finish_charging: async ({ event, response }) => {
    let mission = await getMission(event);
    mission = updateMissionState(mission, 'charging_complete');
    response.success(mission);
  },
};

const generateResponse = callback => ({
  error: msg => {
    callback(null, {
      statusCode: 400,
      body: JSON.stringify(msg),
      headers: { 'Content-Type': 'application/json' },
    });
  },
  success: msg => {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(msg),
      headers: { 'Content-Type': 'application/json' },
    });
  },
});
