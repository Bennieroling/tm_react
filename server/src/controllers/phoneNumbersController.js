// This is a mock implementation of a phone numbers controller
// In a real application, this would connect to your database

// Mock database for demo purposes
const mockPhoneData = {};
const countries = ['Argentina', 'Brazil', 'Canada', 'Germany', 'UK', 'USA', 'France', 'Spain', 'Italy', 'Japan', 'China', 'Australia'];

// Generate mock phone data for each country
countries.forEach(country => {
  mockPhoneData[country] = [];
  // Generate 5-10 random phone numbers for each country
  const count = Math.floor(Math.random() * 6) + 5;
  for (let i = 1; i <= count; i++) {
    mockPhoneData[country].push({
      id: i,
      phone_number: `+${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      country: country,
      status: ['green', 'yellow', 'red'][Math.floor(Math.random() * 3)],
      type: ['Mobile', 'Office', 'Fax'][Math.floor(Math.random() * 3)],
      last_updated: new Date().toISOString()
    });
  }
});

// Controller functions
const getPhoneNumbersByCountry = async (req, res) => {
  try {
    const countryName = req.params.countryName;
    console.log(`Retrieving phone numbers for country: ${countryName}`);
    
    // Use mock data for now - in production, you would query your database
    const phoneNumbers = mockPhoneData[countryName] || [];
    
    // If we don't have mock data for this country, generate some
    if (phoneNumbers.length === 0) {
      const count = Math.floor(Math.random() * 6) + 3;
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
      // Store for future requests
      mockPhoneData[countryName] = phoneNumbers;
    }
    
    return { 
      success: true, 
      count: phoneNumbers.length,
      data: phoneNumbers 
    };
  } catch (error) {
    console.error('Error fetching phone numbers:', error);
    throw error;
  }
};

const getPhoneDetails = async (phoneId) => {
  try {
    console.log(`Retrieving details for phone ID: ${phoneId}`);
    
    // For mock purposes - find this phone in any country
    let phoneDetails = null;
    
    for (const country in mockPhoneData) {
      const found = mockPhoneData[country].find(phone => phone.id.toString() === phoneId);
      if (found) {
        phoneDetails = found;
        break;
      }
    }
    
    if (phoneDetails) {
      return { success: true, data: phoneDetails };
    } else {
      return { success: false, error: 'Phone number not found' };
    }
  } catch (error) {
    console.error('Error fetching phone details:', error);
    throw error;
  }
};

module.exports = {
  getPhoneNumbersByCountry,
  getPhoneDetails
};