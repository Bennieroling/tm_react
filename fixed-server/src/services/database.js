const sql = require('mssql');

let pool;
let connectionFailed = false;

// Configuration for Azure SQL connection
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // For Azure SQL
    trustServerCertificate: false,
    enableArithAbort: true
  }
};

/**
 * Initializes the database connection pool
 */
const setupDbConnection = async () => {
  try {
    // Create a connection pool
    pool = await new sql.ConnectionPool(config).connect();
    console.log('Connected to Azure SQL database');
    connectionFailed = false;
  } catch (err) {
    console.error('Database connection failed:', err);
    connectionFailed = true;
    console.log('Running with mock data for local development');
    // We don't throw the error to allow the server to start anyway
  }
};

/**
 * Executes a SQL query
 * @param {string} query - SQL query to execute
 * @param {object} params - Parameters for the query
 * @returns {Promise<object>} - Query result
 */
const executeQuery = async (query, params = {}) => {
  // If connection failed, return mock data
  if (connectionFailed) {
    return getMockData(query, params);
  }
  
  try {
    if (!pool) {
      throw new Error('Database connection not established');
    }
    
    const request = pool.request();
    
    // Add parameters to the request
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const result = await request.query(query);
    return result;
  } catch (err) {
    console.error('Query execution failed:', err);
    // Return mock data on error
    return getMockData(query, params);
  }
};

/**
 * Returns mock data based on the query
 * @param {string} query - SQL query
 * @param {object} params - Query parameters
 * @returns {object} - Mock data
 */
const getMockData = (query, params) => {
  console.log('Using mock data for query:', query.substring(0, 100) + '...');
  console.log('With params:', params);

  // Store consistent dataset for status history to ensure filters return same data
  const statusHistoryData = generateStatusHistoryData();
  const phoneHistoryData = generatePhoneHistoryData();
  
  // Check query to determine what kind of data to return
  if (query.includes('statuses_phone') && params.country) {
    return {
      recordset: [
        {
          id: 1,
          phone_number: '+1234567890',
          country: params.country,
          status: 'green',
          type: 'Website',
          provider: 'Provider A',
          last_updated: new Date().toISOString()
        },
        {
          id: 2,
          phone_number: '+9876543210',
          country: params.country,
          status: 'red',
          type: 'Sales',
          provider: 'Provider B',
          last_updated: new Date().toISOString()
        },
        {
          id: 3,
          phone_number: '+1122334455',
          country: params.country,
          status: 'yellow',
          type: 'Support',
          provider: 'Provider C',
          last_updated: new Date().toISOString()
        }
      ]
    };
  }
  
  if (query.includes('statuses WHERE') && params.countryId) {
    return {
      recordset: [
        {
          id: parseInt(params.countryId),
          country: 'Sample Country',
          region: 'Sample Region',
          status: 'green',
          last_updated: new Date().toISOString(),
          type: 'Test',
          provider: 'Sample Provider'
        }
      ]
    };
  }
  
  if (query.includes('statuses')) {
    return {
      recordset: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        country: `Country ${i + 1}`,
        region: i % 3 === 0 ? 'EMEA' : (i % 3 === 1 ? 'APAC' : 'Americas'),
        status: i % 3 === 0 ? 'green' : (i % 3 === 1 ? 'yellow' : 'red'),
        last_updated: new Date().toISOString(),
        type: 'Test',
        provider: `Provider ${i % 3 + 1}`
      }))
    };
  }
  
  if (query.includes('status_history')) {
    // Always return the same dataset regardless of filter
    return {
      recordset: statusHistoryData
    };
  }
  
  if (query.includes('status_phone_history')) {
    // Always return the same dataset regardless of filter
    return {
      recordset: phoneHistoryData
    };
  }
  
  // Default mock data
  return {
    recordset: []
  };
};

/**
 * Generate consistent status history mock data
 */
const generateStatusHistoryData = () => {
  const countries = ['United States', 'Germany', 'Japan', 'Brazil', 'Australia', 'France', 'South Africa'];
  const statusTypes = ['yellow', 'red'];
  const providers = ['Provider A', 'Provider B', 'Provider C'];
  const types = ['Website', 'Sales', 'Support'];
  
  // Generate 60-70 records for good variety
  return Array.from({ length: 67 }, (_, i) => {
    // Random status that's either yellow or red (we filter out green)
    const status = statusTypes[i % statusTypes.length];
    // Random end date (some null for ongoing issues)
    const isOngoing = i % 4 === 0;
    const startDate = new Date(Date.now() - (i * 86400000 / 2)); // Staggered start dates
    
    return {
      id: i + 1,
      country: countries[i % countries.length],
      status: status,
      status_start: startDate.toISOString(),
      status_end: isOngoing ? null : new Date(startDate.getTime() + (86400000 * (1 + i % 3))).toISOString(),
      type: types[i % types.length],
      provider: providers[i % providers.length]
    };
  });
};

/**
 * Generate consistent phone history mock data
 */
const generatePhoneHistoryData = () => {
  const countries = ['United States', 'Germany', 'Japan', 'Brazil', 'Australia', 'France', 'South Africa'];
  const statusTypes = ['yellow', 'red'];
  const providers = ['Provider A', 'Provider B', 'Provider C'];
  const types = ['Website', 'Sales', 'Support'];
  const phoneNumbers = [
    '+1234567890', '+9876543210', '+1122334455', 
    '+4455667788', '+8877665544', '+6677889900',
    '+3344556677', '+7788990011', '+2233445566'
  ];
  
  // Generate 60-70 records for good variety
  return Array.from({ length: 60 }, (_, i) => {
    // Random status that's either yellow or red (we filter out green)
    const status = statusTypes[i % statusTypes.length];
    // Random end date (some null for ongoing issues)
    const isOngoing = i % 4 === 0;
    const startDate = new Date(Date.now() - (i * 86400000 / 2)); // Staggered start dates
    
    return {
      id: i + 1,
      number: phoneNumbers[i % phoneNumbers.length],
      country: countries[i % countries.length],
      status: status,
      status_start: startDate.toISOString(),
      status_end: isOngoing ? null : new Date(startDate.getTime() + (86400000 * (1 + i % 3))).toISOString(),
      type: types[i % types.length],
      provider: providers[i % providers.length]
    };
  });
};

/**
 * Closes the database connection pool
 */
const closeDbConnection = async () => {
  try {
    if (pool) {
      await pool.close();
      console.log('Database connection closed');
    }
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
};

module.exports = {
  setupDbConnection,
  executeQuery,
  closeDbConnection
};