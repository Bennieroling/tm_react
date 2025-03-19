const express = require('express');
const { getTelemetryByCountry, getGlobalTelemetry } = require('../controllers/telemetryController');

const router = express.Router();

// Get global telemetry status
router.get('/global', getGlobalTelemetry);

// Get telemetry status by country
router.get('/country/:countryId', getTelemetryByCountry);

module.exports = {
  telemetryRouter: router
};