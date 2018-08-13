const { updateMission } = require('../lib/storage');

const updateMissionState = (mission, newState = undefined) => {
  switch (mission.state) {
    case 'need_sent':
      const timeElapsed = new Date().getTime() - mission.need_created_at;
      if (timeElapsed > 4000) {
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
    }
  return mission;
}

module.exports = {
  updateMissionState
}