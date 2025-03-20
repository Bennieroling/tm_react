import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  console.log("Current location:", location.pathname);
  
  // Define navigation links
  const navLinks = [
    { path: '/', label: 'Global View' },
    { path: '/history', label: 'Status History' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Telephony Monitor
        </Link>
        
        <div className="nav-links">
          {navLinks.map((link) => {
            console.log(`Link: ${link.label}, path: ${link.path}, active: ${location.pathname === link.path}`);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;