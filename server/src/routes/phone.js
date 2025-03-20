const express = require('express');
const { getPhoneNumbersByCountry } = require('../controllers/phoneNumbersController');

const router = express.Router();

// Get phone numbers for a specific country
router.get('/country/:country', getPhoneNumbersByCountry);

module.exports = {
  phoneRouter: router
};