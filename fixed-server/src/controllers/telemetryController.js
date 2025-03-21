const sql = require('mssql');
const { executeQuery } = require('../services/database');

// Get global telemetry status for all countries
const getGlobalStatus = async (req, res) => {
  try {
    console.log('Retrieving global telemetry status');
    
    // Use executeQuery instead of direct connection
    const result = await executeQuery(`
      SELECT 
        id,
        country,
        region,
        status,
        uptime,
        total,
        active,
        provider,
        type,
        last_updated
      FROM statuses
      ORDER BY country ASC
    `);
    
    console.log(`Retrieved status for ${result.recordset.length} countries`);
    
    // Return the results
    return res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching global status:', error);
    
    // Return mock data as fallback
    const mockData = generateMockCountryData();
    
    return res.json({
      success: true,
      count: mockData.length,
      data: mockData,
      note: "Using mock data due to database error"
    });
  }
};

// Get detailed status for a specific country
const getCountryStatus = async (req, res) => {
  try {
    const countryId = req.params.countryId;
    console.log(`Retrieving status for country ID: ${countryId}`);
    
    // Use executeQuery instead of direct connection
    const result = await executeQuery(`
      SELECT 
        id,
        country,
        region,
        status,
        uptime,
        total,
        active,
        provider,
        type,
        last_updated
      FROM statuses
      WHERE id = @id
    `, { id: countryId });
    
    if (result.recordset.length > 0) {
      console.log(`Found country: ${result.recordset[0].country}`);
      
      return res.json({
        success: true,
        data: result.recordset[0]
      });
    } else {
      console.log(`No country found with ID: ${countryId}`);
      
      return res.status(404).json({
        success: false,
        error: `No country found with ID: ${countryId}`
      });
    }
  } catch (error) {
    console.error(`Error fetching country status for ID ${req.params.countryId}:`, error);
    
    // Return generic error
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve country status'
    });
  }
};

// Helper function to generate mock country data
function generateMockCountryData() {
  const countries = [
    { name: 'Argentina', region: 'Americas' },
    { name: 'Brazil', region: 'Americas' },
    { name: 'Canada', region: 'Americas' },
    { name: 'USA', region: 'Americas' },
    { name: 'UK', region: 'Europe' },
    { name: 'Germany', region: 'Europe' },
    { name: 'France', region: 'Europe' },
    { name: 'Spain', region: 'Europe' },
    { name: 'Italy', region: 'Europe' },
    { name: 'China', region: 'Asia Pacific' },
    { name: 'Japan', region: 'Asia Pacific' },
    { name: 'Australia', region: 'Asia Pacific' }
  ];
  
  return countries.map((country, index) => {
    const status = ['green', 'yellow', 'red'][Math.floor(Math.random() * 3)];
    const total = Math.floor(Math.random() * 100) + 50;
    const active = Math.floor(total * (0.8 + (Math.random() * 0.2)));
    const uptime = Math.floor(95 + Math.random() * 5);
    
    return {
      id: index + 1,
      country: country.name,
      region: country.region,
      status,
      uptime,
      total,
      active,
      provider: ['Provider A', 'Provider B', 'Provider C'][Math.floor(Math.random() * 3)],
      type: ['VoIP', 'Cellular', 'Landline'][Math.floor(Math.random() * 3)],
      last_updated: new Date().toISOString()
    };
  });
}

module.exports = {
  getGlobalStatus,
  getCountryStatus
};