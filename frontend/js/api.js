/**
 * HELIOS — Centralized API Interface
 * Prepares future FastAPI backend integration while handling mock data
 */

const HeliosAPI = (function() {
  const BASE_URL = '/api';

  async function request(endpoint, options = {}) {
    // Prepared for future FastAPI backend integration
    console.log(`[HELIOS API] Request to ${BASE_URL}${endpoint}`, options);
    return null;
  }

  return {
    request
  };
})();

window.HeliosAPI = HeliosAPI;
