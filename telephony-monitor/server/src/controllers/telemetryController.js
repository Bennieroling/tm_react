const { executeQuery } = require('../services/database');

/**
 * Get global telemetry status for all countries
 */
const getGlobalTelemetry = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        id,
        country,
        region,
        status,
        last_updated,
        type,
        provider
      FROM 
        statuses
      ORDER BY 
        country
    `;
    
    const result = await executeQuery(query);
    
    res.status(200).json({
      success: true,
      count: result.recordset?.length||0,
      data: result.recordset || []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get telemetry status for a specific country
 */
const getTelemetryByCountry = async (req, res, next) => {
  try {
    const countryId = req.params.countryId;
    
    const query = `
      SELECT 
        id,
        country,
        region,
        status,
        last_updated,
        type,
        provider
      FROM 
        statuses
      WHERE 
        id = @countryId
    `;
    
    const result = await executeQuery(query, { countryId });
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No telemetry data found for country ID ${countryId}`
      });
    }
    
    // Since we don't have a separate telemetry_details table,
    // we're just returning the country status data
    const countryData = result.recordset[0];
    
    res.status(200).json({
      success: true,
      data: countryData
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGlobalTelemetry,
  getTelemetryByCountry
};