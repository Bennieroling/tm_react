import React, { useState, useEffect } from 'react';
import { historyApi } from '../services/api';
import StatusIndicator from '../components/StatusIndicator';
import './GlobalHistoryView.css';

const GlobalHistoryView = () => {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [showOngoingOnly, setShowOngoingOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('country');  // 'country' or 'phone'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Added new filters
  const [countryFilter, setCountryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Filter settings
  const [timeRange, setTimeRange] = useState('5d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomDates, setShowCustomDates] = useState(false);

  useEffect(() => {
    fetchHistoryData();
  }, [timeRange, viewMode]);

  // Apply filters when filter states change or historyData updates
  useEffect(() => {
    if (!historyData || !Array.isArray(historyData)) {
      setFilteredData([]);
      return;
    }
    
    // First filter out the "green" (online) events as we're only interested in issues
    let filtered = historyData.filter(item => item.status !== 'green');
    
    // Apply status filter if active
    if (activeFilter) {
      filtered = filtered.filter(item => item.status === activeFilter);
    }
    
    // Apply search filter if in phone mode
    if (viewMode === 'phone' && searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.number && item.number.toLowerCase().includes(term)
      );
    }
    
    // Apply country filter if selected
    if (countryFilter) {
      const search = countryFilter.toLowerCase();
      filtered = filtered.filter(item => 
        item.country && item.country.toLowerCase().includes(search)
      );
    }
    
    // Apply type filter if selected
    if (typeFilter) {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    
    // Apply ongoing filter if active
    if (showOngoingOnly) {
      filtered = filtered.filter(item => item.status_end === null);
    }
    
    setFilteredData(filtered);
  }, [activeFilter, showOngoingOnly, historyData, viewMode, searchTerm, countryFilter, typeFilter]);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      
      let params = { timeRange };
      if (timeRange === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      let response;
      
      if (viewMode === 'country') {
        response = await historyApi.getStatusHistory(
          params.timeRange,
          params.startDate,
          params.endDate
        );
      } else {
        response = await historyApi.getPhoneHistory(
          params.timeRange,
          params.startDate,
          params.endDate,
          searchTerm || null
        );
      }
      
      // Check if response and response.data exist
      if (response && response.data) {
        setHistoryData(response.data);
        
        // Log data for debugging
        console.log('Fetched history data:', response.data);
        console.log('Yellow items count:', response.data.filter(item => item.status === 'yellow').length);
      } else {
        // Handle empty or malformed response
        console.warn('API returned empty or invalid data');
        setHistoryData([]);
        setError('No history data available. Please try again later.');
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch history data. Please try again later.');
      setLoading(false);
      console.error('Error fetching history data:', err);
      // Initialize with empty array to prevent filter errors
      setHistoryData([]);
    }
  };

  const handleFilterClick = (status) => {
    if (activeFilter === status) {
      // If clicking the same filter again, clear the filter
      setActiveFilter(null);
    } else {
      setActiveFilter(status);
    }
  };
  
  const handleOngoingFilterClick = () => {
    setShowOngoingOnly(!showOngoingOnly);
    // Don't reset status filter
  };
  
  const clearAllFilters = () => {
    setActiveFilter(null);
    setShowOngoingOnly(false);
    setSearchTerm('');
    setCountryFilter('');
    setTypeFilter('');
  };
  
  // Get unique countries for filter dropdown
  const getUniqueCountries = () => {
    if (!historyData || !historyData.length) return [];
    
    const countries = new Set();
    historyData.forEach(item => {
      if (item.country) countries.add(item.country);
    });
    
    return Array.from(countries).sort();
  };
  
  // Get unique types for filter dropdown
  const getUniqueTypes = () => {
    if (!historyData || !historyData.length) return [];
    
    const types = new Set();
    historyData.forEach(item => {
      if (item.type) types.add(item.type);
    });
    
    return Array.from(types).sort();
  };
  
  // Get counts by status for issues only
  const getStatusCounts = () => {
    const counts = {
      yellow: 0,
      red: 0,
      ongoing: 0,
      total: 0
    };
    
    if (!historyData || !Array.isArray(historyData)) {
      return counts;
    }
    
    historyData.forEach(item => {
      if (item.status === 'yellow' || item.status === 'red') {
        counts[item.status] = (counts[item.status] || 0) + 1;
        counts.total++;
        
        // Count ongoing issues
        if (item.status_end === null) {
          counts.ongoing++;
        }
      }
    });
    
    return counts;
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Present';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Calculate duration between start and end times
  const calculateDuration = (startDate, endDate) => {
    if (!endDate) return 'Ongoing';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = end - start;
    
    // Less than a minute
    if (durationMs < 60000) {
      return `${Math.floor(durationMs / 1000)} seconds`;
    }
    // Less than an hour
    if (durationMs < 3600000) {
      return `${Math.floor(durationMs / 60000)} minutes`;
    }
    // Less than a day
    if (durationMs < 86400000) {
      return `${Math.floor(durationMs / 3600000)} hours`;
    }
    // More than a day
    return `${Math.floor(durationMs / 86400000)} days`;
  };

  const handleTimeRangeChange = (e) => {
    const newRange = e.target.value;
    setTimeRange(newRange);
    setShowCustomDates(newRange === 'custom');
  };

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    fetchHistoryData();
  };

  // Group history data by country or phone number
  const groupData = (data = filteredData) => {
    const grouped = {};
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return grouped;
    }
    
    if (viewMode === 'country') {
      data.forEach(item => {
        if (!item || !item.country) return;
        
        if (!grouped[item.country]) {
          grouped[item.country] = [];
        }
        grouped[item.country].push(item);
      });
    } else {
      data.forEach(item => {
        if (!item || !item.number) return;
        
        if (!grouped[item.number]) {
          grouped[item.number] = [];
        }
        grouped[item.number].push(item);
      });
    }
    
    return grouped;
  };

  // Add a title that shows the current filter status
  const getFilterTitle = () => {
    let title = "";
    
    if (activeFilter) {
      title += `${activeFilter === 'yellow' ? 'Degraded' : 'Offline'} `;
    } else {
      title += "All ";
    }
    
    title += "Issues";
    
    if (showOngoingOnly) {
      title += " (Ongoing Only)";
    }
    
    if (countryFilter) {
      title += ` in ${countryFilter}`;
    }
    
    if (typeFilter) {
      title += ` of type ${typeFilter}`;
    }
    
    return title;
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    // Reset filters when changing view mode
    setActiveFilter(null);
    setShowOngoingOnly(false);
    setSearchTerm('');
    setCountryFilter('');
    setTypeFilter('');
  };

  if (loading) {
    return <div className="loading">Loading history data...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const groupedData = groupData();
  
  return (
    <div className="history-view">
      <h1>Global Status History</h1>
      
      <div className="view-mode-toggle">
        <button 
          className={`toggle-btn ${viewMode === 'country' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('country')}
        >
          View by Country
        </button>
        <button 
          className={`toggle-btn ${viewMode === 'phone' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('phone')}
        >
          View by Phone Number
        </button>
      </div>
      
      <div className="filter-controls">
        <div className="time-range-selector">
          <label htmlFor="timeRange">Time Range:</label>
          <select 
            id="timeRange" 
            value={timeRange} 
            onChange={handleTimeRangeChange}
            className="time-range-select"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="48h">Last 48 Hours</option>
            <option value="5d">Last 5 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        {showCustomDates && (
          <form onSubmit={handleCustomDateSubmit} className="custom-date-form">
            <div className="date-input-group">
              <label htmlFor="startDate">Start Date:</label>
              <input 
                type="datetime-local" 
                id="startDate" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div className="date-input-group">
              <label htmlFor="endDate">End Date:</label>
              <input 
                type="datetime-local" 
                id="endDate" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="apply-btn">Apply</button>
          </form>
        )}
        
        <div className="advanced-filters">
          <div className="filter-group">
            <label htmlFor="countryFilter">Country:</label>
            <div className="search-field">
              <input
                type="text"
                id="countryFilter"
                placeholder="Search for a country..."
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                className="search-input"
              />
              {countryFilter && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setCountryFilter('')}
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          <div className="filter-group">
            <label htmlFor="typeFilter">Type:</label>
            <select
              id="typeFilter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Types</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        {viewMode === 'phone' && (
          <div className="search-container">
            <input
              type="text"
              placeholder="Search phone numbers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button 
              onClick={fetchHistoryData} 
              className="search-btn"
              disabled={!searchTerm}
            >
              Search
            </button>
          </div>
        )}
        
        {(countryFilter || typeFilter || activeFilter || showOngoingOnly || searchTerm) && (
          <button
            className="clear-filter-btn visible"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </button>
        )}
      </div>
      
      <div className="history-summary">
        <div className="summary-cards">
          <div 
            className={`summary-card ${activeFilter === 'red' ? 'active' : ''}`}
            onClick={() => handleFilterClick('red')}
          >
            <h3>Offline Issues</h3>
            <div className="summary-count red">{getStatusCounts().red}</div>
            {activeFilter === 'red' && <div className="filter-badge">Filtered</div>}
          </div>
          
          <div 
            className={`summary-card ${activeFilter === 'yellow' ? 'active' : ''}`}
            onClick={() => handleFilterClick('yellow')}
          >
            <h3>Degraded Issues</h3>
            <div className="summary-count yellow">{getStatusCounts().yellow || 0}</div>
            {activeFilter === 'yellow' && <div className="filter-badge">Filtered</div>}
          </div>
        </div>
        
        <div className="summary-cards">
          <div 
            className={`summary-card ${!activeFilter && !showOngoingOnly ? 'active' : ''}`}
            onClick={clearAllFilters}
          >
            <h3>Total Issues</h3>
            <div className="summary-count blue">{getStatusCounts().total}</div>
            {!activeFilter && !showOngoingOnly && !countryFilter && !typeFilter && <div className="filter-badge">Showing All</div>}
          </div>
          
          <div 
            className={`summary-card ${showOngoingOnly ? 'active' : ''}`}
            onClick={handleOngoingFilterClick}
          >
            <h3>Ongoing Issues</h3>
            <div className="summary-count purple">{getStatusCounts().ongoing}</div>
            {showOngoingOnly && <div className="filter-badge">Filtered</div>}
          </div>
        </div>
        
        <div className="summary-info">
          <div className="info-card">
            <h3>Issues Shown</h3>
            <div className="info-value">{filteredData.length}</div>
            <div className="info-detail">
              {activeFilter 
                ? `${activeFilter === 'yellow' ? 'Degraded' : 'Offline'} incidents` 
                : (showOngoingOnly ? 'Ongoing incidents' : 'All incidents')}
            </div>
          </div>
          <div className="info-card">
            <h3>{viewMode === 'country' ? 'Countries' : 'Phone Numbers'}</h3>
            <div className="info-value">{Object.keys(groupedData).length}</div>
            <div className="info-detail">
              {countryFilter ? `In ${countryFilter}` : 'All regions'}
              {typeFilter ? `, type: ${typeFilter}` : ''}
            </div>
          </div>
        </div>
      </div>
      
      <div className="history-header">
        <h2>{viewMode === 'country' ? 'Countries' : 'Phone Numbers'} - {getFilterTitle()}</h2>
        {(activeFilter || showOngoingOnly || searchTerm || countryFilter || typeFilter) && (
          <button 
            className="clear-filter visible"
            onClick={clearAllFilters}
          >
            Clear All Filters
          </button>
        )}
      </div>
      
      <div className="history-list">
        {Object.entries(groupedData).map(([key, events]) => (
          <div key={key} className={viewMode === 'country' ? "country-history-card" : "phone-history-card"}>
            <h2>{key}</h2>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Started</th>
                  <th>Ended</th>
                  <th>Duration</th>
                  {viewMode === 'phone' && <th>Country</th>}
                  {viewMode === 'phone' && <th>Type</th>}
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className={`status-${event.status}`}>
                    <td>
                      <StatusIndicator status={event.status} />
                    </td>
                    <td>{formatDate(event.status_start)}</td>
                    <td>{formatDate(event.status_end)}</td>
                    <td>{calculateDuration(event.status_start, event.status_end)}</td>
                    {viewMode === 'phone' && <td>{event.country}</td>}
                    {viewMode === 'phone' && <td>{event.type || 'N/A'}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        
        {Object.keys(groupedData).length === 0 && (
          <div className="no-results">
            No {viewMode === 'country' ? 'countries' : 'phone numbers'} match the current filters.
            <button onClick={clearAllFilters} className="clear-link">Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalHistoryView;