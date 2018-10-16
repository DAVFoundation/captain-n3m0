const { updateMissionState, createNeed } = require('./model/mission');
const express = require('express');
const key = process.env.KEY;

// Start Express
const app = express();
const port = process.env.WEB_SERVER_PORT || 8888;

// Validate params
app.param('key', function(req, res, next, id) {
  if (id !== key) {
    next(new Error('Invalid Key'));
  } else {
    next();
  }
});

app.param('mission_id', async function(req, res, next, id) {
  try {
    let mission = await storage.getMission(id);
    // update mission state
    req.mission = await updateMissionState(mission);
    next();
  } catch (e) {
    next(new Error('Invalid mission id'));
  }
});

// Define routes
app.get('/healthy', (req, res) => {
  res.send('hello world');
});

app.get('/need/:key', async (req, res) => {
  const missionId = await createNeed();
  res.send({
    missionId,
  });
});

app.get('/status/:key/:mission_id', async (req, res) => {
  res.send(req.mission);
});

app.get('/ready_to_charge/:key/:mission_id', async (req, res) => {
  req.mission = updateMissionState(req.mission, 'ready_to_charge');
  res.send(req.mission);
});

app.get('/begin_charging/:key/:mission_id', async (req, res) => {
  req.mission = await updateMissionState(req.mission, 'charging');
  res.send(req.mission);
});

app.get('/finish_charging/:key/:mission_id', async (req, res) => {
  req.mission = updateMissionState(req.mission, 'charging_complete');
  res.send(req.mission);
});

// Define error handler
app.use(function(err, req, res, next) {
  res.status(500).send({ message: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`Web server started. Listening on port ${port}`);
});
