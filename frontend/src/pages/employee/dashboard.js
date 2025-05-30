import React, { useState } from 'react';
import Catalog from './catalog';
import Develop from './develop';
import Perf from './perf';
import Profile from './profile';

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('catalog'); // Default to dashboard home

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleLogout = () => {
    // Clear any authentication tokens or user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // You can redirect to login or show login component
    window.location.href = '/';
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'catalog':
        return <Catalog />;
      case 'develop':
        return <Develop />;
      case 'performance':
        return <Perf />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <div style={styles.welcomeSection}>
            <h2 style={styles.welcomeTitle}>Welcome to Your Dashboard</h2>
            <p style={styles.welcomeText}>
              Navigate through the tabs above to access different sections of your employee portal.
            </p>
            
            <div style={styles.quickStats}>
              <div style={styles.statCard}>
                <h3 style={styles.statCardTitle}>Training Progress</h3>
                <p style={styles.statCardText}>
                  View your current training modules and progress
                </p>
              </div>
              
              <div style={styles.statCard}>
                <h3 style={styles.statCardTitle}>Performance Metrics</h3>
                <p style={styles.statCardText}>
                  Check your performance evaluations and feedback
                </p>
              </div>
              
              <div style={styles.statCard}>
                <h3 style={styles.statCardTitle}>Available Courses</h3>
                <p style={styles.statCardText}>
                  Browse the catalog for new learning opportunities
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  // Style objects
  const styles = {
    employeeDashboard: {
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: "'Arial', sans-serif"
    },
    
    dashboardHeader: {
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '1rem 2rem',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    
    headerTitle: {
      margin: 0,
      fontSize: '2rem',
      fontWeight: 600
    },
    
    dashboardNavbar: {
      backgroundColor: '#34495e',
      padding: '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    
    navTabs: {
      display: 'flex',
      gap: 0
    },
    
    navTab: {
      backgroundColor: 'transparent',
      color: 'white',
      border: 'none',
      padding: '1rem 1.5rem',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 500,
      transition: 'all 0.3s ease',
      borderBottomWidth: '3px',
      borderBottomStyle: 'solid',
      borderBottomColor: 'transparent'
    },
    
    navTabActive: {
      backgroundColor: '#2c3e50',
      borderBottomColor: '#3498db'
    },
    
    navTabHover: {
      backgroundColor: '#2c3e50',
      borderBottomColor: '#3498db'
    },
    
    logoutBtn: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 500,
      transition: 'background-color 0.3s ease'
    },
    
    logoutBtnHover: {
      backgroundColor: '#c0392b'
    },
    
    dashboardContent: {
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 140px)' // Adjust based on header/navbar height
    },
    
    welcomeSection: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    },
    
    welcomeTitle: {
      color: '#2c3e50',
      marginBottom: '1rem',
      textAlign: 'center'
    },
    
    welcomeText: {
      color: '#7f8c8d',
      fontSize: '1.1rem',
      textAlign: 'center',
      marginBottom: '2rem'
    },
    
    quickStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem'
    },
    
    statCard: {
      backgroundColor: '#f8f9fa',
      padding: '1.5rem',
      borderRadius: '8px',
      border: '1px solid #dee2e6',
      textAlign: 'center',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      cursor: 'pointer'
    },
    
    statCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
    },
    
    statCardTitle: {
      color: '#2c3e50',
      marginBottom: '0.5rem',
      fontSize: '1.2rem'
    },
    
    statCardText: {
      color: '#7f8c8d',
      margin: 0,
      lineHeight: '1.5'
    }
  };

  // State for hover effects
  const [hoveredTab, setHoveredTab] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [logoutHovered, setLogoutHovered] = useState(false);

  const getTabStyle = (tabName) => {
    const isActive = activeTab === tabName;
    const isHovered = hoveredTab === tabName;
    
    return {
      ...styles.navTab,
      ...(isActive ? styles.navTabActive : {}),
      ...(isHovered && !isActive ? styles.navTabHover : {})
    };
  };

  return (
    <div style={styles.employeeDashboard}>
      <header style={styles.dashboardHeader}>
        <h1 style={styles.headerTitle}>Employee Dashboard</h1>
      </header>
      
      <nav style={styles.dashboardNavbar}>
        <div style={styles.navTabs}>
          <button 
            style={getTabStyle('catalog')}
            onMouseEnter={() => setHoveredTab('catalog')}
            onMouseLeave={() => setHoveredTab(null)}
            onClick={() => handleTabClick('catalog')}
          >
            Catalog
          </button>
          
          <button 
            style={getTabStyle('develop')}
            onMouseEnter={() => setHoveredTab('develop')}
            onMouseLeave={() => setHoveredTab(null)}
            onClick={() => handleTabClick('develop')}
          >
            Develop
          </button>
          
          <button 
            style={getTabStyle('performance')}
            onMouseEnter={() => setHoveredTab('performance')}
            onMouseLeave={() => setHoveredTab(null)}
            onClick={() => handleTabClick('performance')}
          >
            Performance
          </button>
          
          <button 
            style={getTabStyle('profile')}
            onMouseEnter={() => setHoveredTab('profile')}
            onMouseLeave={() => setHoveredTab(null)}
            onClick={() => handleTabClick('profile')}
          >
            Profile
          </button>
        </div>
        
        <button 
          style={{
            ...styles.logoutBtn,
            ...(logoutHovered ? styles.logoutBtnHover : {})
          }}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
          onClick={handleLogout}
        >
          Logout
        </button>
      </nav>
      
      <main style={styles.dashboardContent}>
        {renderActiveComponent()}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
