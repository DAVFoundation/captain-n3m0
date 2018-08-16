const { updateMissionState } = require('./model/mission');
const storage = require('./lib/storage');

exports.handler = async function (event, context, callback) {
  const response = generateResponse(callback);
  const key = process.env.KEY;
  if (isKeyValid(key, event)) {
    const path = event.path.substring(1);
    await mainHandler[path]({event, context, response});
  } else {
    response.error(new Error('Invalid Key'));
  }
};

const isKeyValid = (key, event) => !event.pathParameters || event.pathParameters.key || event.pathParameters.key === key;

const getMission = async (event) => {
  try {
    const mission = await storage.getMission(event.pathParameters.mission_id);
    return mission;
  } catch (e) {
    throw new Error('Invalid mission id');
  }
};

const mainHandler = {
  healthy: ({response}) => response.success('Hello World!'),
  need: async ({response}) => {
    const missionId = await storage.createNeed();
    response.success({ missionId });
  },
  status: async ({event, response}) => {
    try {
      const mission = await getMission(event);
      response.success(mission);
    } catch (err) {
      response.error(err);
    }
  },
  begin_charging: async ({event, response}) => {
    try {
      let mission = await getMission(event);
      mission = await updateMissionState(mission, 'charging');
      response.success(mission);
    } catch (err) {
      response.error(err);
    }
  }
};

const generateResponse = (callback) => ({
  error: (msg) => {
    callback({
      statusCode: 400,
      body: JSON.stringify(msg),
      headers: {'Content-Type': 'application/json'}
    });
  },
  success: (msg) => {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(msg),
      headers: {'Content-Type': 'application/json'}
    });
  }
});
