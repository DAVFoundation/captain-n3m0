const express = require('express');
const app = express();
const port = process.env.WEB_SERVER_PORT || 8888;

// Define routes
app.get('/healthy', (req, res) => {
  res.send('hello world');
});

// Start server
app.listen(port, () => {
  console.log(`Web server started. Listening on port ${port}`);
});
