const express = require('express');
const { getPhoneNumbersByCountry } = require('../controllers/phoneNumbersController');

const router = express.Router();

// Get phone numbers for a specific country
router.get('/country/:countryName', async (req, res) => {
  try {
    const countryName = req.params.countryName;
    
    // Call the controller function to get phone numbers
    const result = await getPhoneNumbersByCountry(req, res);
    
    // Return the result
    res.json(result);
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch phone numbers' });
  }
});

module.exports = {
  phoneRouter: router
};