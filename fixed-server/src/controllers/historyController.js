const sql = require('mssql');
const { executeQuery } = require('../services/database');

// Get status history
const getStatusHistory = async (req, res) => {
  try {
    // Get query parameters
    const timeRange = req.query.timeRange || '5d'; // Default to 5 days
    let startDate, endDate;
    
    // Parse custom date range if provided
    if (timeRange === 'custom' && req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
    } else {
      // Calculate date range based on timeRange parameter
      endDate = new Date();
      startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '48h':
          startDate.setHours(startDate.getHours() - 48);
          break;
        case '5d':
        default:
          startDate.setDate(startDate.getDate() - 5);
          break;
      }
    }
    
    console.log(`Retrieving history from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    // Use executeQuery instead of direct connection
    const result = await executeQuery(`
      SELECT 
        id,
        country,
        region,
        status,
        status_start,
        status_end,
        type
      FROM status_history 
      WHERE status_start >= @startDate 
        AND (status_end IS NULL OR status_end <= @endDate)
      ORDER BY status_start DESC
    `, { 
      startDate: startDate,
      endDate: endDate
    });
    
    console.log(`Found ${result.recordset.length} history records`);
    
    // Return the results
    return res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching status history:', error);
    
    // Generate mock data as fallback
    const mockData = generateMockHistoryData(50);
    
    return res.json({
      success: true,
      count: mockData.length,
      data: mockData,
      note: "Using mock data due to database error"
    });
  }
};

// Get phone history
const getPhoneHistory = async (req, res) => {
  try {
    // Get query parameters
    const timeRange = req.query.timeRange || '5d'; // Default to 5 days
    const number = req.query.number; // Optional phone number filter
    let startDate, endDate;
    
    // Parse custom date range if provided
    if (timeRange === 'custom' && req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
    } else {
      // Calculate date range based on timeRange parameter
      endDate = new Date();
      startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '48h':
          startDate.setHours(startDate.getHours() - 48);
          break;
        case '5d':
        default:
          startDate.setDate(startDate.getDate() - 5);
          break;
      }
    }
    
    console.log(`Retrieving phone history from ${startDate.toISOString()} to ${endDate.toISOString()}`);
    
    let query;
    let params = {
      startDate: startDate,
      endDate: endDate
    };
    
    if (number) {
      query = `
        SELECT 
          id,
          number,
          country,
          status,
          status_start,
          status_end,
          type
        FROM status_phone_history
        WHERE status_start >= @startDate 
          AND (status_end IS NULL OR status_end <= @endDate)
          AND number = @number
        ORDER BY status_start DESC
      `;
      params.number = number;
    } else {
      query = `
        SELECT 
          id,
          number,
          country,
          status,
          status_start,
          status_end,
          type
        FROM status_phone_history
        WHERE status_start >= @startDate 
          AND (status_end IS NULL OR status_end <= @endDate)
        ORDER BY status_start DESC
      `;
    }
    
    // Use executeQuery
    const result = await executeQuery(query, params);
    
    console.log(`Found ${result.recordset.length} phone history records`);
    
    // Return the results
    return res.json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching phone history:', error);
    
    // Generate mock data as fallback
    const mockData = generateMockPhoneHistoryData(req.query.number, 30);
    
    return res.json({
      success: true,
      count: mockData.length,
      data: mockData,
      note: "Using mock data due to database error"
    });
  }
};

// Helper function to generate mock history data
function generateMockHistoryData(count) {
  const countries = ['Argentina', 'Brazil', 'Canada', 'Germany', 'UK', 'USA', 'France', 'Spain', 'Italy'];
  const regions = ['Americas', 'Europe', 'Asia Pacific', 'EMEA'];
  const types = ['Outage', 'Degradation', 'Maintenance'];
  const data = [];
  
  for (let i = 1; i <= count; i++) {
    const status = ['yellow', 'red'][Math.floor(Math.random() * 2)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const statusStart = new Date();
    statusStart.setDate(statusStart.getDate() - Math.floor(Math.random() * 5));
    
    // 70% chance of having an end date (30% ongoing)
    let statusEnd = null;
    if (Math.random() < 0.7) {
      statusEnd = new Date(statusStart);
      statusEnd.setHours(statusEnd.getHours() + Math.floor(Math.random() * 12) + 1);
    }
    
    data.push({
      id: i,
      country,
      region,
      status,
      status_start: statusStart.toISOString(),
      status_end: statusEnd ? statusEnd.toISOString() : null,
      type
    });
  }
  
  return data;
}

// Helper function to generate mock phone history data
function generateMockPhoneHistoryData(numberFilter, count) {
  const countries = ['Argentina', 'Brazil', 'Canada', 'Germany', 'UK', 'USA', 'France', 'Spain', 'Italy'];
  const types = ['Mobile', 'Office', 'Fax'];
  const data = [];
  
  for (let i = 1; i <= count; i++) {
    const status = ['yellow', 'red'][Math.floor(Math.random() * 2)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // If number filter is provided, use it for all records
    const number = numberFilter || `+${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    
    const statusStart = new Date();
    statusStart.setDate(statusStart.getDate() - Math.floor(Math.random() * 5));
    
    // 70% chance of having an end date (30% ongoing)
    let statusEnd = null;
    if (Math.random() < 0.7) {
      statusEnd = new Date(statusStart);
      statusEnd.setHours(statusEnd.getHours() + Math.floor(Math.random() * 12) + 1);
    }
    
    data.push({
      id: i,
      number,
      country,
      status,
      status_start: statusStart.toISOString(),
      status_end: statusEnd ? statusEnd.toISOString() : null,
      type
    });
  }
  
  return data;
}

module.exports = {
  getStatusHistory,
  getPhoneHistory
};