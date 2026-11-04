/**
 * Vercel Serverless Function entry point
 */
const app = require('./app');

module.exports = (req, res) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error('[HELIOS Vercel Invocation Error]:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Serverless invocation error: ' + (err.message || 'Unknown error')
      });
    }
  }
};
