import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { phoneApi } from '../services/api';
import StatusIndicator from '../components/StatusIndicator';
import './PhoneNumbersView.css';

const PhoneNumbersView = () => {
  const { country } = useParams();
  const [phoneData, setPhoneData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await phoneApi.getPhoneNumbersByCountry(country);
        setPhoneData(response.data);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.status === 404
            ? `No phone numbers found for ${country}`
            : 'Failed to fetch phone numbers. Please try again later.'
        );
        setLoading(false);
        console.error('Error fetching phone numbers:', err);
      }
    };

    fetchData();
  }, [country]);

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading phone numbers...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error">{error}</div>
        <Link to={`/country/${phoneData[0]?.id || ''}`} className="back-link">Back to Country View</Link>
      </div>
    );
  }

  return (
    <div className="phone-numbers-view">
      <div className="phone-header">
        <Link to={`/country/${phoneData[0]?.id || ''}`} className="back-link">
          &larr; Back to Country View
        </Link>
        <h1>{country} Phone Numbers</h1>
        <div className="phone-summary">
          <div className="summary-item">
            <span className="label">Total Numbers:</span>
            <span className="value">{phoneData.length}</span>
          </div>
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
            {phoneData.map((phone) => (
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
    </div>
  );
};

export default PhoneNumbersView;