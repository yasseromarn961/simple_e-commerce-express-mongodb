// Mock Express app for testing
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is running' });
});

module.exports = app;