const { updateMissionState, saveBoatMission, saveChargerMission, getMission } = require('../model/mission');
const { SDKFactory } = require('dav-js');
const {
  NeedFilterParams,
  NeedParams,
  BidParams,
  enums,
  StartingMessageParams,
  ChargingArrivalMessageParams,
  ChargingCompleteMessageParams,
  MissionParams,
} = require('dav-js/dist/vessel-charging');

const apiSeedUrls = process.env.apiSeedUrls || ['http://localhost:3010'];
const kafkaSeedUrls = process.env.kafkaSeedUrls || ['localhost:9092'];
const boatDavId = process.env.boatDavId;
const chargerDavId = process.env.chargerDavId;
const boatPrivateKey = process.env.boatPrivateKey;

const needFilterParams = new NeedFilterParams({
    location: {
        lat: 38.066098,
        long: -122.230218
    },
    radius: 2000,
});

const needParams = new NeedParams({
    location: {
        lat: 38.067064,
        long: -122.230844,
    },
    radius: 20,
    amenities: [enums.Amenities.Docking],
});

const bidParams = {
    price: '15',
    vehicleId: chargerDavId,
    locationName: 'Cal Maritime Dock'
}

module.exports = class Dav {
    constructor() {
        this.charger = new Charger();
        this.boat = new Boat();
    }
}

class Boat {
    constructor() {
          this.init(boatDavId);
          this.onBid = this.onBid.bind(this);
    }

    async init(davId) {
        const DAV = SDKFactory({
            apiSeedUrls,
            kafkaSeedUrls,
        });  
        this.identity = await DAV.getIdentity(davId);
    }

    async createNeed() {
        const need = await this.identity.publishNeed(needParams);
        const bids = await need.bids();
        return new Promise((resolve) => {
            bids.subscribe(this.onBid(resolve));
        })
    }

    onBid(cb) {
        return async (bid) => {
            const mission = await bid.accept(new MissionParams({}), boatPrivateKey);
            const missionId = saveBoatMission(mission);
            cb(missionId);
            const compleatChargingMessage = await mission.messages(['charging_complete_message']);
            compleatChargingMessage.subscribe(this.finalizeMission(mission))
        }
    }

    finalizeMission(mission) {
        return async () => {
            await mission.signContract(boatPrivateKey);
            const tx = await mission.finalizeMission(boatPrivateKey);
            console.log(tx);
        }
    }

    async arrivedAtCharging(missionId) {
        const mission = getMission(missionId);
        if (mission.state !== 'ready_to_charge') throw new Error('Charger not ready yet.');

        const vesselArrivedMessage = new ChargingArrivalMessageParams({});
        await mission.boatMission.sendMessage(vesselArrivedMessage);
        const {state, charging_started_at, id, charging_completed_at} = updateMissionState(missionId, 'charging');
        return {state, charging_started_at, id, charging_completed_at};
    }
}

class Charger {
    constructor() {
        this.init(chargerDavId);
        this.onNeed = this.onNeed.bind(this);
    }

    async init(davId) {
        const DAV = SDKFactory({

            apiSeedUrls,
            kafkaSeedUrls,
        });  
        this.identity = await DAV.getIdentity(davId);
        const needs = await this.identity.needsForType(needFilterParams);    
        needs.subscribe(this.onNeed);  
    }

    async onNeed(need) {
        const bidParams = this.generateBidParams();
        const bid = await need.createBid(bidParams);
        const missions = await bid.missions();
        missions.subscribe(saveChargerMission);
    };

    async chargerIsReady(missionId) {
        const mission = getMission(missionId)
        if (mission.state !== 'need_sent') throw new Error('Charger is ready already.');

        const chargerIsReadyMessage = new StartingMessageParams({});
        await mission.chargerMission.sendMessage(chargerIsReadyMessage);
        const {state, charging_started_at, id, charging_completed_at} = updateMissionState(missionId, 'ready_to_charge');
        return {state, charging_started_at, id, charging_completed_at};
    }

    async compleatCharging(missionId) {
        const mission = getMission(missionId)
        if (mission.state !== 'charging') throw new Error('Boat has not arrived yet.');

        const chargingCompleteMessage = new ChargingCompleteMessageParams({});
        await mission.chargerMission.sendMessage(chargingCompleteMessage);
        const {state, charging_started_at, id, charging_completed_at} = updateMissionState(missionId, 'charging_complete');
        return {state, charging_started_at, id, charging_completed_at};
    }

    generateBidParams() {
        return new BidParams({...bidParams, availableFrom: Date.now()});
    }

}