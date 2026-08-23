import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Leaf, Shield, LogOut, User, ChevronDown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="logo-section" style={{ textDecoration: 'none' }}>
          <Leaf className="logo-icon" size={28} />
          <span className="logo-text" style={{ color: 'white' }}>Crop<span className="text-gradient">AI</span></span>
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <a href="#features" className="nav-link">Features</a>
              
              {/* Account Dropdown Section */}
              <div className="account-menu" ref={dropdownRef}>
                <button 
                  className="account-trigger" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown size={16} className={`dropdown-icon ${dropdownOpen ? 'open' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="dropdown-panel glass-panel animate-fade-in">
                    <div className="dropdown-header">
                      <strong>{user.username}</strong>
                      <span>{user.isAdmin ? 'Administrator' : 'Standard User'}</span>
                    </div>
                    
                    <div className="dropdown-body">
                      <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                        <User size={16} className="text-gradient" /> 
                        My Profile
                      </Link>

                      {user.isAdmin && (
                        <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <Shield size={16} className="text-gradient" /> 
                          Admin Dashboard
                        </Link>
                      )}
                      
                      <button onClick={handleLogout} className="dropdown-item logout-btn">
                        <LogOut size={16} /> 
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/auth" className="btn-primary nav-btn">Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
