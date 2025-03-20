const { executeQuery } = require('../services/database');

/**
 * Get phone numbers for a specific country
 */
const getPhoneNumbersByCountry = async (req, res, next) => {
  try {
    const country = req.params.country;
    console.log(`Fetching phone numbers for country: "${country}"`);
    
    // First, let's check if the country exists in our database
    const checkQuery = `
      SELECT COUNT(*) as count
      FROM statuses_phone
      WHERE country = @country
    `;
    
    const checkResult = await executeQuery(checkQuery, { country });
    console.log('Check result:', checkResult.recordset[0]);
    
    // If no matching country, try a LIKE search
    if (checkResult.recordset[0].count === 0) {
      console.log(`No exact match found, trying LIKE search for: "%${country}%"`);
      const likeQuery = `
        SELECT DISTINCT country
        FROM statuses_phone
        WHERE country LIKE @countryPattern
      `;
      
      const likeResult = await executeQuery(likeQuery, { countryPattern: `%${country}%` });
      console.log('Similar countries found:', likeResult.recordset);
    }
    
    // Proceed with the original query
    const query = `
      SELECT 
        id,
        phone_number,
        country,
        status,
        type,
        provider,
        last_updated
      FROM 
        statuses_phone
      WHERE 
        country = @country
      ORDER BY 
        phone_number
    `;
    
    const result = await executeQuery(query, { country });
    console.log(`Found ${result.recordset.length} phone numbers for country "${country}"`);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No phone numbers found for country ${country}`
      });
    }
    
    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error in getPhoneNumbersByCountry:', error);
    next(error);
  }
};

module.exports = {
  getPhoneNumbersByCountry
};