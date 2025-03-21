import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { telemetryApi } from '../services/api';
import StatusIndicator from '../components/StatusIndicator';
import './GlobalView.css';

const GlobalView = () => {
  const [telemetryData, setTelemetryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [activeFilter, setActiveFilter] = useState(null);
  const [activeRegion, setActiveRegion] = useState(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await telemetryApi.getGlobalStatus();
        // If response is the array directly (not wrapped in a data property)
        setTelemetryData(response);
        setFilteredData(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch telemetry data. Please try again later.');
        setLoading(false);
        console.error('Error fetching telemetry data:', err);
      }
    };

    fetchData();

    // Set up polling every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Apply filters when activeFilter or activeRegion changes or telemetryData updates
  useEffect(() => {
    let filtered = [...telemetryData];
    
    // Apply status filter if active
    if (activeFilter) {
      filtered = filtered.filter(item => item.status === activeFilter);
    }
    
    // Apply region filter if active
    if (activeRegion) {
      filtered = filtered.filter(item => item.region === activeRegion);
    }
    
    // Apply country search if provided
    if (countrySearch) {
      const search = countrySearch.toLowerCase();
      filtered = filtered.filter(item => 
        item.country.toLowerCase().includes(search)
      );
    }
    
    setFilteredData(filtered);
  }, [activeFilter, activeRegion, telemetryData, countrySearch]);
  
  // Handle status filter click
  const handleFilterClick = (status) => {
    if (activeFilter === status) {
      // If clicking the same filter again, clear the filter
      setActiveFilter(null);
    } else {
      setActiveFilter(status);
    }
  };
  
  // Handle region filter click
  const handleRegionClick = (region) => {
    if (activeRegion === region) {
      // If clicking the same region again, clear the filter
      setActiveRegion(null);
    } else {
      setActiveRegion(region);
    }
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilter(null);
    setActiveRegion(null);
    setCountrySearch('');
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get counts by region and status
  const getStatusCounts = () => {
    let regions = {};
    let statuses = {
      green: 0,
      yellow: 0,
      red: 0
    };
    
    
    if (telemetryData) {
      telemetryData.forEach(item => {
        // Count by region
        if (!regions[item.region]) {
          regions[item.region] = {
            total: 0,
            green: 0,
            yellow: 0,
            red: 0
          };
        }
        
        regions[item.region].total += 1;
        regions[item.region][item.status] = (regions[item.region][item.status] || 0) + 1;
        
        // Count by status
        statuses[item.status] = (statuses[item.status] || 0) + 1;
      });
    } else {
      console.error("telemetryData is undefined or null");
      // Initialize with empty objects
      regions = {};
      statuses = {};
    }
    
    return { regions, statuses };
  }

  const { regions, statuses } = getStatusCounts();

  return (
    <div className="global-view">
      <h1>Global Telephony Status</h1>
      <p>Last updated: {new Date().toLocaleString()}</p>
      
      <div className="status-summary">
        <div 
          className={`status-card ${activeFilter === 'green' ? 'active' : ''}`}
          onClick={() => handleFilterClick('green')}
        >
          <h3>Online</h3>
          <div className="status-count green">{statuses.green}</div>
          {activeFilter === 'green' && <div className="filter-badge">Filtered</div>}
        </div>
        <div 
          className={`status-card ${activeFilter === 'yellow' ? 'active' : ''}`}
          onClick={() => handleFilterClick('yellow')}
        >
          <h3>Degraded</h3>
          <div className="status-count yellow">{statuses.yellow || 0}</div>
          {activeFilter === 'yellow' && <div className="filter-badge">Filtered</div>}
        </div>
        <div 
          className={`status-card ${activeFilter === 'red' ? 'active' : ''}`}
          onClick={() => handleFilterClick('red')}
        >
          <h3>Offline</h3>
          <div className="status-count red">{statuses.red}</div>
          {activeFilter === 'red' && <div className="filter-badge">Filtered</div>}
        </div>
      </div>
      
      <div className="region-summary">
        <h2>Status by Region</h2>
        <div className="region-cards">
          {Object.entries(regions).map(([region, counts]) => (
            <div 
              className={`region-card ${activeRegion === region ? 'active' : ''}`} 
              key={region}
              onClick={() => handleRegionClick(region)}
            >
              <h3>{region}</h3>
              <div className="region-stats">
                <div className="stat">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{counts.total}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Online:</span>
                  <span className="stat-value">{counts.green}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Degraded:</span>
                  <span className="stat-value">{counts.yellow || 0}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Offline:</span>
                  <span className="stat-value">{counts.red}</span>
                </div>
              </div>
              {activeRegion === region && <div className="filter-badge">Filtered</div>}
            </div>
          ))}
        </div>
      </div>
      
      <div className="countries-header">
        <div className="header-left">
          <h2>
            {activeFilter || activeRegion ? (
              <>
                Countries 
                {activeFilter && ` - ${
                  activeFilter === 'green' ? 'Online' : 
                  activeFilter === 'yellow' ? 'Degraded' : 
                  'Offline'
                }`}
                {activeRegion && ` - ${activeRegion}`}
                {` (${filteredData.length})`}
              </>
            ) : (
              `All Countries (${telemetryData.length})`
            )}
          </h2>
        </div>
        
        <div className="header-right">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search countries..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="search-input"
            />
            {countrySearch && (
              <button 
                className="clear-search-btn"
                onClick={() => setCountrySearch('')}
              >
                ×
              </button>
            )}
          </div>
          
          {(activeFilter || activeRegion || countrySearch) && (
            <button 
              className="clear-filter visible"
              onClick={clearAllFilters}
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
      <div className="table-container">
        <table className="telemetry-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>Region</th>
              <th>Status</th>
              <th>Last Test</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((country) => (
              <tr key={country.id}>
                <td>{country.country}</td>
                <td>{country.region}</td>
                <td>
                  <StatusIndicator status={country.status} />
                </td>
                <td>{formatDate(country.last_updated)}</td>
                <td>
                  <Link to={`/country/${country.id}`} className="details-link">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalView;