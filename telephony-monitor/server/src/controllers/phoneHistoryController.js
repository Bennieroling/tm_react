const { executeQuery } = require('../services/database');

/**
 * Get phone number history with time-based filtering
 */
const getPhoneHistory = async (req, res, next) => {
  try {
    const { timeRange = '5d', startDate, endDate, number } = req.query;
    
    let whereClause = '';
    const params = {};
    
    // Calculate date range based on the selected option
    const now = new Date();
    let calculatedStartDate;
    
    if (timeRange === 'custom' && startDate && endDate) {
      // Custom date range
      whereClause = 'WHERE (status_start BETWEEN @startDate AND @endDate) OR (status_end BETWEEN @startDate AND @endDate) OR (status_start <= @startDate AND (status_end IS NULL OR status_end >= @endDate))';
      params.startDate = startDate;
      params.endDate = endDate;
    } else {
      // Predefined ranges
      switch (timeRange) {
        case '24h':
          calculatedStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '48h':
          calculatedStartDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
          break;
        case '5d':
        default:
          calculatedStartDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
          break;
      }
      
      whereClause = 'WHERE (status_start >= @calculatedStartDate) OR (status_end >= @calculatedStartDate) OR (status_start <= @calculatedStartDate AND status_end IS NULL)';
      params.calculatedStartDate = calculatedStartDate.toISOString();
    }
    
    // Add number filter if provided
    if (number) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += 'number LIKE @number';
      params.number = `%${number}%`;
    }
    
    const query = `
      SELECT 
        id,
        number,
        country,
        status,
        status_start,
        status_end,
        type,
        provider
      FROM 
        status_phone_history
      ${whereClause}
      ORDER BY 
        number, status_start DESC
    `;
    
    console.log('Executing phone history query:', query);
    console.log('With params:', params);
    
    const result = await executeQuery(query, params);
    
    console.log(`Query returned ${result.recordset.length} records`);
    
    res.status(200).json({
      success: true,
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error in getPhoneHistory:', error);
    next(error);
  }
};

module.exports = {
  getPhoneHistory
};