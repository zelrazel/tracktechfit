import React, { useState, useEffect } from 'react';
import { FaWeight, FaDumbbell, FaCalendarCheck, FaSync, FaCrown, FaEnvelope, FaUser, FaGraduationCap, FaLaptopCode, FaServer, FaCaretDown, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import '../styles/Leaderboard.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState('weightLoss');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('BSCS');
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  // Time filter state
  const [timePeriod, setTimePeriod] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [showTimeFilter, setShowTimeFilter] = useState(false);
  const timeFilterRef = React.useRef(null);

  const categories = [
    { id: 'weightLoss', name: 'Weight Loss', icon: <FaWeight /> },
    { id: 'strength', name: 'Strength-Based', icon: <FaDumbbell /> },
    { id: 'consistency', name: 'Consistency', icon: <FaCalendarCheck /> },
    { id: 'hybrid', name: 'Hybrid', icon: <FaSync /> }
  ];
  
  const courses = [
    { id: 'BSCS', name: 'BSCS', icon: <FaLaptopCode /> },
    { id: 'BSIT', name: 'BSIT', icon: <FaServer /> }
  ];

  // Find the active category details
  const activeTabDetails = categories.find(cat => cat.id === activeCategory);

  const handleCategoryChange = (id) => {
    setActiveCategory(id);
    setShowMobileDropdown(false);
  };

  useEffect(() => {
    if (activeCategory === 'weightLoss' || 
        activeCategory === 'strength' || 
        activeCategory === 'consistency' || 
        activeCategory === 'hybrid') {
        fetchLeaderboardData();
    }
  }, [activeCategory, selectedCourse, timePeriod, selectedMonth, selectedWeek]);

  // Helper to get startDate and endDate for the current filter
  const getTimePeriodRange = () => {
    if (timePeriod === 'all') return { startDate: null, endDate: null };
    if (timePeriod === 'monthly' && selectedMonth) {
      const start = new Date(selectedMonth.year, selectedMonth.month, 1);
      const end = new Date(selectedMonth.year, selectedMonth.month + 1, 0);
      return { startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] };
    }
    if (timePeriod === 'weekly' && selectedWeek) {
      return {
        startDate: selectedWeek.startDate.toISOString().split('T')[0],
        endDate: selectedWeek.endDate.toISOString().split('T')[0]
      };
    }
    return { startDate: null, endDate: null };
  };

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      const endpoint = activeCategory === 'weightLoss' 
          ? 'weight-loss' 
          : activeCategory === 'strength' 
          ? 'strength'
          : activeCategory === 'consistency'
          ? 'consistency'
          : activeCategory === 'hybrid'
          ? 'hybrid'
          : null;

      if (!endpoint) {
          setLeaderboardData([]);
          return;
      }

      // Get date range for all categories
      const { startDate, endDate } = getTimePeriodRange();
      let url = `${API_URL}api/leaderboard/${endpoint}?course=${selectedCourse}`;
      if (activeCategory !== 'weightLoss' && startDate && endDate) {
        url += `&startDate=${startDate}&endDate=${endDate}`;
      }
      // For weightLoss, keep old behavior (client-side filtering)
      if (activeCategory === 'weightLoss') {
        // No date filtering in backend, keep as is
      }
      const response = await axios.get(url, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setLeaderboardData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch leaderboard data');
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract months and weeks from leaderboard data
  useEffect(() => {
    if (!leaderboardData || leaderboardData.length === 0) {
      setAvailableMonths([]);
      setAvailableWeeks([]);
      setSelectedMonth(null);
      setSelectedWeek(null);
      return;
    }
    // Use the correct date field for each category
    let dateField = null;
    if (activeCategory === 'weightLoss') dateField = 'lastWeighInDate';
    else dateField = 'lastWorkoutDate';
    if (!dateField) {
      setAvailableMonths([]);
      setAvailableWeeks([]);
      setSelectedMonth(null);
      setSelectedWeek(null);
      return;
    }
    const monthsMap = new Map();
    leaderboardData.forEach(entry => {
      const date = entry[dateField] ? new Date(entry[dateField]) : null;
      if (!date) return;
      const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      if (!monthsMap.has(monthYear)) {
        monthsMap.set(monthYear, {
          name: monthYear,
          entries: [],
          month: date.getMonth(),
          year: date.getFullYear(),
        });
      }
      monthsMap.get(monthYear).entries.push(entry);
    });
    const monthsArr = Array.from(monthsMap.values()).sort((a, b) => {
      const dateA = new Date(a.year, a.month);
      const dateB = new Date(b.year, b.month);
      return dateB - dateA;
    });
    setAvailableMonths(monthsArr);
    if (selectedMonth) {
      const monthData = monthsArr.find(m => m.name === selectedMonth.name);
      if (monthData) generateWeeksForMonth(monthData);
    }
  }, [leaderboardData, activeCategory]);

  // Generate weeks for a given month
  const generateWeeksForMonth = (monthData) => {
    if (!monthData) return;
    const entries = monthData.entries;
    if (!entries || entries.length === 0) {
      setAvailableWeeks([]);
      return;
    }
    // Group by week (Sunday-Saturday)
    const weeks = [];
    let weekMap = {};
    entries.forEach(entry => {
      let date = null;
      if (activeCategory === 'weightLoss') date = entry.lastWeighInDate ? new Date(entry.lastWeighInDate) : null;
      else date = entry.lastWorkoutDate ? new Date(entry.lastWorkoutDate) : null;
      if (!date) return;
      // Get week start (Sunday)
      const start = new Date(date);
      start.setDate(date.getDate() - date.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const key = `${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
      if (!weekMap[key]) {
        weekMap[key] = {
          name: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
          startDate: new Date(start),
          endDate: new Date(end),
          key,
          entries: [],
        };
      }
      weekMap[key].entries.push(entry);
    });
    const weeksArr = Object.values(weekMap).sort((a, b) => b.startDate - a.startDate);
    setAvailableWeeks(weeksArr);
  };

  // Handle time period change
  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
    if (period === 'monthly') {
      if (availableMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(availableMonths[0]);
      }
    } else if (period === 'weekly') {
      const currentDate = new Date();
      const currentMonthYear = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      const currentMonthData = availableMonths.find(m => m.name === currentMonthYear);
      if (currentMonthData) {
        setSelectedMonth(currentMonthData);
        setTimePeriod('weekly');
        generateWeeksForMonth(currentMonthData);
      } else if (availableMonths.length > 0) {
        setSelectedMonth(availableMonths[0]);
        setTimePeriod('weekly');
        generateWeeksForMonth(availableMonths[0]);
      }
    } else {
      setSelectedWeek(null);
    }
    setShowTimeFilter(false);
  };
  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
    setTimePeriod('monthly');
    generateWeeksForMonth(month);
  };
  const handleWeekSelect = (week) => {
    setSelectedWeek(week);
    setTimePeriod('weekly');
    setShowTimeFilter(false);
  };
  const getTimeFilterLabel = () => {
    if (timePeriod === 'all') return 'All Time';
    if (timePeriod === 'monthly') return selectedMonth ? selectedMonth.name : 'Monthly';
    if (timePeriod === 'weekly') return selectedWeek ? selectedWeek.name : 'Weekly';
    return 'All Time';
  };
  // Filter leaderboard data based on time period (only for weightLoss)
  const getFilteredLeaderboardData = () => {
    if (activeCategory !== 'weightLoss') return leaderboardData;
    if (timePeriod === 'all') return leaderboardData;
    if (timePeriod === 'monthly' && selectedMonth) {
      return leaderboardData.filter(entry => {
        const date = entry.lastWeighInDate ? new Date(entry.lastWeighInDate) : null;
        return date && date.getMonth() === selectedMonth.month && date.getFullYear() === selectedMonth.year;
      });
    }
    if (timePeriod === 'weekly' && selectedWeek) {
      return leaderboardData.filter(entry => {
        const date = entry.lastWeighInDate ? new Date(entry.lastWeighInDate) : null;
        if (!date) return false;
        const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const startDay = new Date(selectedWeek.startDate.getFullYear(), selectedWeek.startDate.getMonth(), selectedWeek.startDate.getDate());
        const endDay = new Date(selectedWeek.endDate.getFullYear(), selectedWeek.endDate.getMonth(), selectedWeek.endDate.getDate());
        return day >= startDay && day <= endDay;
      });
    }
    return leaderboardData;
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (timeFilterRef.current && !timeFilterRef.current.contains(event.target)) {
        setShowTimeFilter(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderRankInfo = (user, category) => {
    // Check if user profile is private, if so return a privacy notice
    if (user.isPrivate) {
        return (
            <div className="private-profile-notice">
                <span className="lock-icon">🔒</span>
                <span>Private Profile</span>
            </div>
        );
    }

    if (category === 'hybrid') {
        return (
            <div className="hybrid-info">
                <div className="hybrid-stats">
                    <div className="volume-stats">
                        <div className="total-volume">
                            Total Volume <span>{(user.totalVolume || 0).toLocaleString()}</span>
                        </div>
                        <div className="total-workouts">
                            Workouts <span>{user.totalWorkouts || 0}</span>
                        </div>
                    </div>
                    <div className="consistency-stats">
                        <div className="active-days">
                            Active Days <span>{user.activeDays || 0}</span>
                        </div>
                        <div className="hybrid-score">
                            {(user.hybridScore || 0).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) return null;

    if (category === 'weightLoss') {
        return (
            <div className="weight-info">
                <div className="weight-details">
                    <div className="weight-stat">
                        <span>Start:</span> <span>{user.startingWeight?.toFixed(1)} kg</span>
                    </div>
                    <div className="weight-stat">
                        <span>Current:</span> <span>{user.currentWeight?.toFixed(1)} kg</span>
                    </div>
                    <div className="weight-stat">
                        <span>Loss:</span> <span>{user.weightLoss?.toFixed(1)} kg</span>
                    </div>
                    {user.consistencyBonus > 0 && (
                        <div className="bonus-details">
                            <span className="bonus-tag">
                                +{(user.consistencyBonus * 100).toFixed(0)}% bonus
                            </span>
                            <span className="weigh-ins">
                                ({user.weighInDays} days)
                            </span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (category === 'strength') {
        return (
            <div className="strength-info">
                <div className="strength-stats">
                    <div className="total-volume">
                        Total Volume <span>{(user.totalVolume || 0).toLocaleString()}</span>
                    </div>
                    <div className="total-workouts">
                        Workouts <span>{user.workoutCount || 0}</span>
                    </div>
                    <div className="strength-score">
                        {(user.strengthScore || 0).toLocaleString()}
                    </div>
                </div>
            </div>
        );
    }

    if (category === 'consistency') {
        return (
            <div className="consistency-info">
                <div className="consistency-stats">
                    <div className="total-workouts">
                        Total Workouts: <span>{user.totalWorkouts || 0}</span>
                    </div>
                    <div className="active-days">
                        Active Days: <span>{user.activeDays || 0}</span>
                    </div>
                    <div className="consistency-score">
                        Score: {(user.consistencyScore || 0).toLocaleString()}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

const renderProfilePicture = (user) => {
    return (
        <div className="leaderboard-profile-container">
            {user.profilePicture ? (
                <img 
                    src={user.profilePicture} 
                    alt="Profile" 
                    className="leaderboard-profile-picture"
                />
            ) : (
                <div className="profile-placeholder">
                    <FaUser />
                </div>
            )}
        </div>
    );
};

const renderMedal = (rank) => {
    switch (rank) {
        case 0:
            return <div className="crown">👑</div>;
        case 1:
            return <div className="medal silver">🥈</div>;
        case 2:
            return <div className="medal bronze">🥉</div>;
        default:
            return null;
    }
};

const renderLeaderboardContent = (filteredData) => {
    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (!filteredData || filteredData.length === 0) {
        return <div className="no-data">No rankings available yet for {selectedCourse} students</div>;
    }

    return (
        <>
            <div className="top-performers mobile-performers">
                {filteredData.slice(0, 3).map((user, index) => (
                    <div key={user._id || index} className={`performer ${['first', 'second', 'third'][index]}`}>
                        {renderMedal(index)}
                        {renderProfilePicture(user)}
                        <div className="rank">{index + 1}</div>
                        <div className="name">{user.firstName} {user.lastName}</div>
                        <div className="leaderboard-email">
                            <FaEnvelope className="email-icon" />
                            {user.email}
                        </div>
                        <button
                            className="about-me-button"
                            onClick={() => window.location.href = `/profile/${user.email}`}
                        >
                            About Me
                        </button>
                        {renderRankInfo(user, activeCategory)}
                    </div>
                ))}
            </div>
            <div className="other-ranks">
                {filteredData.slice(3).map((user, index) => (
                    <div key={user._id || index + 3} className="rank-item">
                        <div className="rank-number">{index + 4}</div>
                        {renderProfilePicture(user)}
                        <div className="rank-info">
                            <div className="rank-name">{user.firstName} {user.lastName}</div>
                            <div className="leaderboard-email">
                                <FaEnvelope className="email-icon" />
                                {user.email}
                            </div>
                            <button
                                className="about-me-button"
                                onClick={() => window.location.href = `/profile/${user.email}`}
                            >
                                About Me
                            </button>
                        </div>
                        {renderRankInfo(user, activeCategory)}
                    </div>
                ))}
            </div>
        </>
    );
};

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-wrapper">
        <div className="leaderboard-container">
          <div className="leaderboard-header">
            <h2>Leaderboard Rankings</h2>
          </div>
          
          <div className="course-filter">
            {courses.map(course => (
              <button
                key={course.id}
                className={`course-tab ${selectedCourse === course.id ? 'active' : ''}`}
                onClick={() => setSelectedCourse(course.id)}
              >
                {course.icon}
                <span>{course.name}</span>
              </button>
            ))}
          </div>
          
          {/* Only show time filter dropdown for non-weightLoss categories */}
          {activeCategory !== 'weightLoss' && (
            <div className="time-filter-container" ref={timeFilterRef}>
              <div className="time-filter-dropdown" onClick={() => setShowTimeFilter(!showTimeFilter)}>
                <span className="time-filter-label">{getTimeFilterLabel()}</span>
                <FaChevronDown className="dropdown-icon" />
              </div>
              {showTimeFilter && (
                <div className="time-filter-options">
                  <div className={`time-option ${timePeriod === 'all' ? 'active' : ''}`} onClick={() => handleTimePeriodChange('all')}>All Time</div>
                  <div className={`time-option ${timePeriod === 'monthly' && !selectedMonth ? 'active' : ''}`} onClick={() => handleTimePeriodChange('monthly')}>Monthly</div>
                  {availableMonths.map((month, idx) => (
                    <div key={`month-${idx}`} className={`time-option time-option-indent ${selectedMonth && selectedMonth.name === month.name ? 'active' : ''}`} onClick={() => handleMonthSelect(month)}>{month.name}</div>
                  ))}
                  <div className={`time-option ${timePeriod === 'weekly' ? 'active' : ''}`} onClick={() => handleTimePeriodChange('weekly')}>Weekly</div>
                  {selectedMonth && availableWeeks.length > 0 && (
                    availableWeeks.map((week, idx) => (
                      <div key={`week-${week.key}`} className={`time-option time-option-indent ${selectedWeek && selectedWeek.key === week.key ? 'active' : ''}`} onClick={() => handleWeekSelect(week)}>{week.name}</div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Desktop category tabs */}
          <div className="category-tabs desktop-only">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-tab ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.icon}
                <span>{category.name}</span>
              </button>
            ))}
          </div>
          
          {/* Mobile category dropdown */}
          <div className="mobile-category-dropdown">
            <button 
              className="mobile-dropdown-button"
              onClick={() => setShowMobileDropdown(!showMobileDropdown)}
            >
              {activeTabDetails.icon}
              <span>{activeTabDetails.name}</span>
              <FaCaretDown className="dropdown-caret" />
            </button>
            
            {showMobileDropdown && (
              <div className="dropdown-menu">
                {categories.map(category => (
                  <button
                    key={category.id}
                    className={`dropdown-item ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.icon}
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {!user && (
            <div className="auth-message">
              <p>Sign in to see your rank and compete with others!</p>
              <button onClick={() => window.location.href = '/signin'} className="signin-btn">
                Sign In
              </button>
            </div>
          )}

          <div className="leaderboard-content">
            {renderLeaderboardContent(getFilteredLeaderboardData())}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
