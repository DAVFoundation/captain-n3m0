const { updateMission } = require('../lib/storage');

const updateMissionState = (mission, newState = undefined) => {
  switch (mission.state) {
    case 'need_sent':
      if (newState === 'ready_to_charge') {
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
      if (newState === 'charging_complete') {
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
