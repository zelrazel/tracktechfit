import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SettingsDropdown.css';
import { handleGlobalSignOut, confirmSignOut } from '../utils/auth';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function SettingsDropdown({ mobile = false, isTokenValid: propIsTokenValid, currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(currentUser || null);
  const [isTokenValid, setIsTokenValid] = useState(propIsTokenValid || false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Use props values if they're provided
  useEffect(() => {
    if (currentUser !== undefined) {
      setUser(currentUser);
    }
    if (propIsTokenValid !== undefined) {
      setIsTokenValid(propIsTokenValid);
    }
  }, [currentUser, propIsTokenValid]);

  const checkTokenValidity = async () => {
    // Skip if we're already receiving token validity from props
    if (propIsTokenValid !== undefined) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setIsTokenValid(false);
      setUser(null);
      return;
    }

    try {
      // Make a test request to verify token
      await axios.get(`${API_URL}api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsTokenValid(true);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsTokenValid(false);
        setUser(null);
      }
    }
  };

  useEffect(() => {
    // Only run these checks if we're not receiving props
    if (propIsTokenValid === undefined || currentUser === undefined) {
      // Initial check
      checkUserState();
      checkTokenValidity();

      // Set up polling for user state and token validity
      const intervalId = setInterval(() => {
        checkUserState();
        checkTokenValidity();
      }, 500);

      // Cleanup
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [propIsTokenValid, currentUser]);

  useEffect(() => {
    // Handle clicks outside dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const checkUserState = () => {
    // Skip if we're already receiving user from props
    if (currentUser !== undefined) return;

    const storedUser = localStorage.getItem('user');
    const newUser = storedUser ? JSON.parse(storedUser) : null;
    
    // Only update state if there's a change
    if (JSON.stringify(user) !== JSON.stringify(newUser)) {
      setUser(newUser);
    }
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  // If in mobile mode, render the links directly without the dropdown
  if (mobile) {
    return (
      <div className="mobile-settings-menu">
        {isTokenValid && user ? (
          <>
            <Link 
              to="/profile" 
              className="mobile-nav-link"
            >
              Profile
            </Link>
            <Link 
              to="/notifications" 
              className="mobile-nav-link notification-link"
            >
              Notifications
            </Link>
            <Link 
              to="/achievements" 
              className="mobile-nav-link"
            >
              Achievements
            </Link>
            <Link 
              to="/friends" 
              className="mobile-nav-link"
            >
              Friends
            </Link>
            <Link 
              to="/schedule" 
              className="mobile-nav-link"
            >
              Workout Schedule
            </Link>
            <button 
              onClick={() => confirmSignOut(navigate)} 
              className="mobile-nav-link signout-button"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/signin" 
              className="mobile-nav-link"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="mobile-nav-link"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    );
  }

  // Normal desktop dropdown
  return (
    <div ref={dropdownRef} className="settings-container">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        onMouseEnter={() => setIsOpen(true)}
        className="settings-button"
      >
        Settings
      </button>

      {isOpen && (
        <div 
          className="settings-dropdown"
          onMouseLeave={() => setIsOpen(false)}
        >
          <ul>
            {isTokenValid && user ? (
              <>
                <li>
                  <Link 
                    to="/profile" 
                    onClick={handleLinkClick}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/achievements" 
                    onClick={handleLinkClick}
                  >
                    Achievements
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/friends" 
                    onClick={handleLinkClick}
                  >
                    Friends
                  </Link>
                </li>
                <li>
                
                </li>
                <li>
                
                </li>
                <li>
                  <Link 
                    to="/schedule" 
                    onClick={handleLinkClick}
                  >
                    Workout Schedule
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={() => confirmSignOut(navigate)} 
                    className="signout-button"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to="/signin" 
                    onClick={handleLinkClick}
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/signup" 
                    onClick={handleLinkClick}
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SettingsDropdown;