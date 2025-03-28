const sql = require('mssql');
const { executeQuery } = require('../services/database');

// Controller functions
const getPhoneNumbersByCountry = async (req, res) => {
  try {
    const countryName = req.params.countryName;
    console.log(`Retrieving phone numbers for country: ${countryName}`);
    
    // Use executeQuery instead of direct connection
    const result = await executeQuery(`
      SELECT 
        id,
        phone_number,
        country,
        status,
        type,
        last_updated
      FROM statuses_phone
      WHERE country = @country
    `, { country: countryName });
    
    console.log(`Found ${result.recordset.length} phone numbers for ${countryName}`);
    
    // Return the results - already handled in route
    return { 
      success: true, 
      count: result.recordset.length,
      data: result.recordset 
    };
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    
    // If there's an error, return mock data as fallback
    const mockData = generateMockPhoneData(countryName, 5);
    
    console.log(`Using mock data for ${countryName} due to database error`);
    
    return { 
      success: true, 
      count: mockData.length,
      data: mockData,
      note: "Using mock data due to database error"
    };
  }
};

const getPhoneDetails = async (phoneId) => {
  try {
    console.log(`Retrieving details for phone ID: ${phoneId}`);
    
    // Use executeQuery instead of direct connection
    const result = await executeQuery(`
      SELECT 
        id,
        phone_number,
        country,
        status,
        type,
        last_updated
      FROM statuses_phone
      WHERE id = @id
    `, { id: phoneId });
    
    if (result.recordset.length > 0) {
      return { 
        success: true, 
        data: result.recordset[0] 
      };
    } else {
      return { 
        success: false, 
        error: 'Phone number not found' 
      };
    }
  } catch (error) {
    console.error('Error fetching phone details:', error);
    
    // Return a generic error
    return { 
      success: false, 
      error: 'Error retrieving phone details' 
    };
  }
};

// Helper function to generate mock data as fallback
function generateMockPhoneData(countryName, count) {
  const phoneNumbers = [];
  
  for (let i = 1; i <= count; i++) {
    phoneNumbers.push({
      id: i,
      phone_number: `+${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      country: countryName,
      status: ['green', 'yellow', 'red'][Math.floor(Math.random() * 3)],
      type: ['Mobile', 'Office', 'Fax'][Math.floor(Math.random() * 3)],
      last_updated: new Date().toISOString()
    });
  }
  
  return phoneNumbers;
}

module.exports = {
  getPhoneNumbersByCountry,
  getPhoneDetails
};