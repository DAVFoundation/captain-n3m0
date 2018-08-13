const { updateMission } = require('../lib/storage');

const updateMissionState = (mission) => {
  switch (mission.state) {
    case 'need_sent':
      const timeElapsed = new Date().getTime() - mission.need_created_at;
      if (timeElapsed > 4000) {
        mission.state = 'ready_to_charge';
        updateMission(mission);
      }
  }
  return mission;
}

module.exports = {
  updateMissionState
}