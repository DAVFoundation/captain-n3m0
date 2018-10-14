const { updateMission } = require('../lib/storage');

const BIDDING_TIME = 4 * 1000;
const CHARGING_TIME = 20 * 1000;

const updateMissionState = (mission, newState = undefined) => {
  let timeElapsed;
  switch (mission.state) {
    case 'need_sent':
      timeElapsed = new Date().getTime() - mission.need_created_at;
      if (timeElapsed > BIDDING_TIME) {
        mission.state = 'ready_to_charge';
        updateMission(mission);
      }
      break;
    case 'ready_to_charge':
      if (newState === 'charging') {
        mission.state = 'charging';
        mission.charging_started_at = new Date();
        updateMission(mission);
      }
      break;
    case 'charging':
      timeElapsed = new Date().getTime() - mission.charging_started_at;
      if (timeElapsed > CHARGING_TIME) {
        mission.state = 'charging_complete';
        mission.charging_completed_at = new Date();
        updateMission(mission);
      }
      break;
  }
  return mission;
};

module.exports = {
  updateMissionState,
};
