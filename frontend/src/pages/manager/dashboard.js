import React, { useState } from 'react';
import Catalog from './catalog';
import Manage from './manage';
import Review from './review';
import Profile from './profile';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('catalog'); // Default to dashboard home

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleLogout = () => {
    // Clear any authentication tokens or user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('id');
    // Redirect to login page
    window.location.href = '/';
  };

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'catalog':
        return <Catalog />;
      case 'manage':
        return <Manage />;
      case 'review':
        return <Review />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <div style={styles.welcomeSection}>
            <h2 style={styles.welcomeTitle}>Welcome to Manager Dashboard</h2>
            <p style={styles.welcomeText}>
              Manage your team's training, manage, and performance from this central hub.
            </p>
            
            <div style={styles.quickStats}>
              <div style={styles.statCard}>
                <h3 style={styles.statCardTitle}>Team Training</h3>
                <p style={styles.statCardText}>
                  Monitor and manage team member training progress and course assignments
                </p>
              </div>
              
              <div style={styles.statCard}>
                <h3 style={styles.statCardTitle}>Project Management</h3>
                <p style={styles.statCardText}>
                  Oversee project assignments, progress tracking, and team collaboration
                </p>
              </div>
              
              <div style={styles.statCard}>
                <h3 style={styles.statCardTitle}>Performance Review</h3>
                <p style={styles.statCardText}>
                  Conduct performance evaluations, set goals, and manage team development
                </p>
              </div>
              
              <div style={styles.statCard}>
                <h3 style={styles.statCardTitle}>Team Overview</h3>
                <p style={styles.statCardText}>
                  Get insights into team performance, badge achievements, and overall progress
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  // Style objects
  const styles = {
    managerDashboard: {
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
      borderBottomColor: '#e74c3c'
    },
    
    navTabHover: {
      backgroundColor: '#2c3e50',
      borderBottomColor: '#e74c3c'
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
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
    <div style={styles.managerDashboard}>
      <header style={styles.dashboardHeader}>
        <h1 style={styles.headerTitle}>Manager Dashboard</h1>
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
            style={getTabStyle('manage')}
            onMouseEnter={() => setHoveredTab('manage')}
            onMouseLeave={() => setHoveredTab(null)}
            onClick={() => handleTabClick('manage')}
          >
            Manage
          </button>
          
          <button 
            style={getTabStyle('review')}
            onMouseEnter={() => setHoveredTab('review')}
            onMouseLeave={() => setHoveredTab(null)}
            onClick={() => handleTabClick('review')}
          >
            Review
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

export default ManagerDashboard;
