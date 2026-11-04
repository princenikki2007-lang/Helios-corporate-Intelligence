/**
 * HELIOS — Production Server (Node.js & Express)
 * Serves static frontend assets and REST API endpoints
 */

const path = require('path');
const express = require('express');
const app = require('./api/app');

// Serve static frontend files and public sample documents
const frontendPath = path.join(__dirname, 'frontend');
const publicPath = path.join(__dirname, 'public');
const samplesPath = path.join(__dirname, 'public', 'samples');

app.use(express.static(frontendPath));
app.use('/public', express.static(publicPath));
app.use('/samples', express.static(samplesPath));

// Fallback to frontend/index.html for client routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const targetFile = path.join(frontendPath, req.path);
  if (fs_exists(targetFile) && !isDirectory(targetFile)) {
    return res.sendFile(targetFile);
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

function fs_exists(p) {
  try {
    const fs = require('fs');
    return fs.existsSync(p);
  } catch (e) {
    return false;
  }
}

function isDirectory(p) {
  try {
    const fs = require('fs');
    return fs.statSync(p).isDirectory();
  } catch (e) {
    return false;
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`☀️ HELIOS — Legal & Compliance Intelligence Platform`);
  console.log(`🚀 Production server running on http://localhost:${PORT}`);
  console.log(`📁 Static Frontend: ${frontendPath}`);
  console.log(`⚡ REST API: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});
