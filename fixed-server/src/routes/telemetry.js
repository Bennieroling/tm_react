const express = require('express');
const { getCountryStatus, getGlobalStatus } = require('../controllers/telemetryController');

const router = express.Router();

// Get global telemetry status
router.get('/global', getGlobalStatus);

// Get telemetry status by country
router.get('/country/:countryId', getCountryStatus);

module.exports = {
  telemetryRouter: router
};