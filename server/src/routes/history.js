const express = require('express');
const { getStatusHistory } = require('../controllers/historyController');
const { getPhoneHistory } = require('../controllers/phoneHistoryController');

const router = express.Router();

// Get status history with time-based filtering
router.get('/', getStatusHistory);

// Get phone history with time-based filtering
router.get('/phone', getPhoneHistory);

module.exports = {
  historyRouter: router
};