// Simple Express server to receive logs from the React app
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const LOG_FILE = 'react-client.log';

app.post('/log', (req, res) => {
  const { message, timestamp } = req.body;
  const logLine = `[${timestamp}] ${message}\n`;
  fs.appendFile(LOG_FILE, logLine, err => {
    if (err) console.error('Failed to write log:', err);
  });
  res.json({ status: 'ok' });
});

app.get('/logs', (req, res) => {
  fs.readFile(LOG_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).send('Could not read log file');
    res.type('text/plain').send(data);
  });
});

app.listen(PORT, () => {
  console.log(`Log server listening on http://localhost:${PORT}`);
});
