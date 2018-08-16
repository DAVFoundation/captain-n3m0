const { updateMissionState } = require('./model/mission');
const storage = require('./lib/storage');
const util = require('util');

try {
  exports.handler = async function (event, context, callback) {
    try {
      const key = process.env.KEY;
      if (isKeyValid(key, event)) {
        const path = event.path.substring(1);
        await mainHandler[path]({event, context, callback});
      } else {
        callback(new Error('Invalid Key'));
      }
    } catch (error) {
      console.log(util.inspect(error));
    }
  };
} catch (error) {
  console.log(util.inspect(error));
}

const isKeyValid = (key, event) => !event.pathParameters || !event.pathParameters.key || event.pathParameters.key === key;

const getMission = async (event) => {
  try {
    const mission = await storage.getMission(event.pathParameters.mission_id);
    return mission;
  } catch (e) {
    throw new Error('Invalid mission id');
  }
}

const mainHandler = {
  healthy: ({callback}) => callback(null, 'Hello World!'),
  need: ({callback}) => {
    const missionId = await storage.createNeed();
    callback(null, { missionId });
  },
  status: ({event, callback}) => {
    try {
      const mission = await getMission(event);
      callback(null, mission);
    } catch (err) {
      callback(err);
    }
  },
  begin_charging: ({event, callback}) => {
    try {
      let mission = await getMission(event);
      mission = await updateMissionState(mission, 'charging');
      callback(null, mission);
    } catch (err) {
      callback(err);
    }
  }
}
