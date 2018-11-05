const express = require('express');
const apiKey = process.env.CAPTAIN_API_KEY;
const Dav = require('./lib/dav-integration');
const { getMission } = require('./model/mission');

// Start Express
const app = express();
const port = process.env.WEB_SERVER_PORT || 8888;
const dav = new Dav();
// Validate params
app.param('key', function(req, res, next, id) {
  if (id !== apiKey) {
    next(new Error('Invalid Key'));
  } else {
    next();
  }
});

app.param('mission_id', async function(req, res, next, id) {
  try {
    let mission = await getMission(id);
    if (mission) {
      next();
    } else {
      next(new Error('Invalid mission id'));
    }  
  } catch (err) {
    next(err);
  }
});

// Define routes
app.get('/healthy', (req, res) => {
  res.send('hello world');
});

app.get('/need/:key', async (req, res) => {
  const id = await dav.boat.createNeed();
  res.send({
    id,
  });
});

app.get('/status/:key/:mission_id', async (req, res, next) => {
  try {
    const {state, charging_started_at, id, charging_completed_at} = getMission(req.params.mission_id);
    res.send({state, charging_started_at, id, charging_completed_at});  
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

app.get('/ready_to_charge/:key/:mission_id', async (req, res, next) => {
  try {
    const missionId = req.params.mission_id;
    const mission = await dav.charger.chargerIsReady(missionId);
    res.send(mission);
  } catch (err) {
    next(err);
  }
});

app.get('/begin_charging/:key/:mission_id', async (req, res, next) => {
  try {
    const missionId = req.params.mission_id;
    const mission = await dav.boat.arrivedAtCharging(missionId);
    res.send(mission);
  } catch (err) {
    next(err);
  }
});

app.get('/finish_charging/:key/:mission_id', async (req, res, next) => {
  try {
    const missionId = req.params.mission_id;
    const mission = await dav.charger.compleatCharging(missionId);
    res.send(mission);  
  } catch (err) {
    next(err);
  }
});

// Define error handler
app.use(function(err, req, res, next) {
  res.status(500).send({ message: err.message });
});

// Start server
const listener = app.listen(port, () => {
  console.log(`Web server started. Listening on port ${port}`);
});

module.exports = { app, listener };