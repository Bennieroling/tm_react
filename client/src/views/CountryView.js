import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { telemetryApi, phoneApi } from '../services/api';
import StatusIndicator from '../components/StatusIndicator';
import './CountryView.css';

const CountryView = () => {
  const { countryId } = useParams();
  const [countryData, setCountryData] = useState(null);
  const [phoneData, setPhoneData] = useState([]);
  const [filteredPhoneData, setFilteredPhoneData] = useState([]);
  const [phoneLoading, setPhoneLoading] = useState(true);
  const [phoneError, setPhoneError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await telemetryApi.getCountryStatus(countryId);
        setCountryData(response.data);
        setLoading(false);
        
        // After getting country data, fetch phone numbers
        if (response.data && response.data.country) {
          try {
            setPhoneLoading(true);
            const phoneResponse = await phoneApi.getPhoneNumbersByCountry(response.data.country);
            setPhoneData(phoneResponse.data);
            setFilteredPhoneData(phoneResponse.data);
            setPhoneLoading(false);
          } catch (phoneErr) {
            console.error('Error fetching phone numbers:', phoneErr);
            setPhoneError(
              phoneErr.response?.status === 404
                ? `No phone numbers found for ${response.data.country}`
                : 'Failed to fetch phone numbers. Please try again later.'
            );
            setPhoneLoading(false);
          }
        }
      } catch (err) {
        setError(
          err.response?.status === 404
            ? `No data found for country ID ${countryId}`
            : 'Failed to fetch country data. Please try again later.'
        );
        setLoading(false);
        console.error('Error fetching country data:', err);
      }
    };

    fetchData();

    // Set up polling every 1 minute
    const intervalId = setInterval(fetchData, 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [countryId]);

  // Apply filters whenever filter states change
  useEffect(() => {
    if (!phoneData.length) return;
    
    let filtered = [...phoneData];
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(phone => 
        phone.phone_number.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(phone => 
        phone.type && phone.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(phone => 
        phone.status === statusFilter
      );
    }
    
    // Apply date filter
    if (dateFilter) {
      const today = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          // Today
          filtered = filtered.filter(phone => {
            const phoneDate = new Date(phone.last_updated);
            return phoneDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
          });
          break;
        case 'yesterday':
          // Yesterday
          filterDate.setDate(today.getDate() - 1);
          filtered = filtered.filter(phone => {
            const phoneDate = new Date(phone.last_updated);
            return phoneDate.setHours(0, 0, 0, 0) === filterDate.setHours(0, 0, 0, 0);
          });
          break;
        case 'week':
          // Last 7 days
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(phone => {
            const phoneDate = new Date(phone.last_updated);
            return phoneDate >= filterDate;
          });
          break;
        case 'month':
          // Last 30 days
          filterDate.setDate(today.getDate() - 30);
          filtered = filtered.filter(phone => {
            const phoneDate = new Date(phone.last_updated);
            return phoneDate >= filterDate;
          });
          break;
        default:
          break;
      }
    }
    
    setFilteredPhoneData(filtered);
  }, [phoneData, searchTerm, typeFilter, statusFilter, dateFilter]);

  // Get unique types for filter dropdown
  const getUniqueTypes = () => {
    if (!phoneData.length) return [];
    
    const types = new Set();
    phoneData.forEach(phone => {
      if (phone.type) types.add(phone.type);
    });
    
    return Array.from(types).sort();
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
    setDateFilter('');
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading country data...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <Link to="/" className="back-link">Back to Global View</Link>
      </div>
    );
  }

  return (
    <div className="country-view">
      <div className="country-header">
        <Link to="/" className="back-link">
          &larr; Back to Global View
        </Link>
        <h1>{countryData.country} Telephony Status</h1>
        <div className="country-summary">
          <div className="summary-item">
            <span className="label">Status:</span>
            <StatusIndicator status={countryData.status} />
          </div>
          <div className="summary-item">
            <span className="label">Region:</span>
            <span className="value">{countryData.region}</span>
          </div>
          <div className="summary-item">
            <span className="label">Last Updated:</span>
            <span className="value">{formatDate(countryData.last_updated)}</span>
          </div>
          {countryData.provider && (
            <div className="summary-item">
              <span className="label">Provider:</span>
              <span className="value">{countryData.provider}</span>
            </div>
          )}
          {countryData.type && (
            <div className="summary-item">
              <span className="label">Type:</span>
              <span className="value">{countryData.type}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="phone-numbers-section">
        <h2>Phone Numbers</h2>
        
        {phoneLoading && <div className="loading">Loading phone numbers...</div>}
        
        {phoneError && <div className="error">{phoneError}</div>}
        
        {!phoneLoading && !phoneError && phoneData.length > 0 && (
          <>
            <div className="filter-section">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search phone numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filters-container">
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
                
                <div className="filter-group">
                  <label htmlFor="statusFilter">Status:</label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Statuses</option>
                    <option value="green">Online</option>
                    <option value="yellow">Degraded</option>
                    <option value="red">Offline</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <label htmlFor="dateFilter">Last Updated:</label>
                  <select
                    id="dateFilter"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Dates</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                  </select>
                </div>
                
                <button
                  onClick={clearFilters}
                  className="clear-filter-btn"
                  disabled={!searchTerm && !typeFilter && !statusFilter && !dateFilter}
                >
                  Clear Filters
                </button>
              </div>
              
              <div className="results-info">
                Showing {filteredPhoneData.length} of {phoneData.length} phone numbers
              </div>
            </div>
            
            <div className="table-container">
              <table className="phone-table">
                <thead>
                  <tr>
                    <th>Phone Number</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPhoneData.map((phone) => (
                    <tr key={phone.id}>
                      <td>{phone.phone_number}</td>
                      <td>{phone.type || 'N/A'}</td>
                      <td>
                        <StatusIndicator status={phone.status} />
                      </td>
                      <td>{formatDate(phone.last_updated)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredPhoneData.length === 0 && (
              <div className="no-results">No phone numbers match the current filters. <button onClick={clearFilters} className="clear-link">Clear filters</button></div>
            )}
          </>
        )}
        
        {!phoneLoading && !phoneError && phoneData.length === 0 && (
          <div className="no-data">No phone numbers found for this country.</div>
        )}
      </div>
    </div>
  );
};

export default CountryView;