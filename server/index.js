const { updateMissionState } = require('./model/mission');
const express = require('express');
const storage = require('./lib/storage');
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
    mission = updateMissionState(mission);
    req.mission = mission;
    next();
  } catch(e) {
    next(new Error('Invalid mission id'));
  }
});

// Define routes
app.get('/healthy', (req, res) => {
  res.send('hello world');
});

app.get('/need/:key', async (req, res) => {
  const missionId = await storage.createNeed();
  res.send({
    missionId
  });
});

app.get('/status/:key/:mission_id', async (req, res) => {
  res.send(req.mission);
});

// Start server
app.listen(port, () => {
  console.log(`Web server started. Listening on port ${port}`);
});
