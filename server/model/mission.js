const MAX_MISSIONS = 2;
const missions = new Array(MAX_MISSIONS);
let pointer = 0

const saveBoatMission = async (mission) => {
  const missionIndex = pointer % MAX_MISSIONS;
  pointer ++;
  missions[missionIndex] = {boatMission: mission, state: 'need_sent', id: missionIndex + 1, ...missions[missionIndex]};
  return missionIndex + 1;
}

const saveChargerMission = async (chargerMission) => {
  const missionIndex = pointer % MAX_MISSIONS;
  missions[missionIndex] = { ...missions[missionIndex], chargerMission };
}

const updateMissionState = (missionId, newState) => {
  const mission = missions[missionId - 1];
  switch (mission.state) {
    case 'need_sent':
      if (newState === 'ready_to_charge') {
        mission.state = 'ready_to_charge';
      }
      break;
    case 'ready_to_charge':
      if (newState === 'charging') {
        mission.state = 'charging';
        mission.charging_started_at = new Date();
      }
      break;
    case 'charging':
      if (newState === 'charging_complete') {
        mission.state = 'charging_complete';
        mission.charging_completed_at = new Date();
      }
      break;
  }
  return mission;
};

const getMission = (missionId) => {
  const mission = missions[missionId - 1];
  if (mission) {
    return mission;
  } else {
    throw new Error(`No mission found with id:${missionId}`);
  }
}

module.exports = {
  saveBoatMission,
  saveChargerMission,
  getMission,
  updateMissionState,
};
