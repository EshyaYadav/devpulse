const express = require('express');
const http = require('http');
const cors = require('cors');
const { initDb } = require('./db/schema');
const { initSockets } = require('./sockets');
const { startWorker } = require('./queue/worker');
const githubWebhook = require('./webhooks/github');

const app = express();
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Routes
app.use('/webhook', githubWebhook);

const server = http.createServer(app);

// Init systems
initDb();
initSockets(server);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  // Start the polling worker
  startWorker();
});
