// manager/manage.js
import React, { useState, useEffect } from 'react';
import UserSelection from './userSelection';


const Manage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedProject, setExpandedProject] = useState(null);
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [selectedProjectForAssignment, setSelectedProjectForAssignment] = useState(null);
  const [completingProject, setCompletingProject] = useState(null);

  // Get user ID from localStorage
  const getUserId = () => {
    return localStorage.getItem('id');
  };

  // Fetch projects managed by this manager
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const managerId = getUserId();

        if (!token || !managerId) {
          console.error('No token or manager ID found');
          setLoading(false);
          return;
        }

        const response = await fetch('http://localhost:4000/api/project/getAllProjects', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Filter projects managed by this manager
          const managedProjects = data.projects.filter(
            project => project.managedBy && project.managedBy._id === managerId
          );
          setProjects(managedProjects);
        } else {
          console.error('Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Handle project completion
  const handleCompleteProject = async (projectId) => {
    setCompletingProject(projectId);
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:4000/api/project/completeProject/${projectId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Project marked as completed successfully!');
        // Refresh projects
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Failed to complete project'}`);
      }
    } catch (error) {
      console.error('Error completing project:', error);
      alert('Error completing project. Please try again.');
    } finally {
      setCompletingProject(null);
    }
  };

  // Handle user assignment
  const handleAssignUsers = (project) => {
    setSelectedProjectForAssignment(project);
    setShowUserSelection(true);
  };

  const handleAssignmentConfirm = () => {
    setShowUserSelection(false);
    setSelectedProjectForAssignment(null);
    // Refresh projects
    window.location.reload();
  };

  // Toggle expanded project users
  const toggleExpandedProject = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  // Get badge color
  const getBadgeColor = (badgeTitle) => {
    const colors = {
      'Green': '#27ae60',
      'Cyan': '#17a2b8',
      'Blue': '#007bff',
      'Purple': '#6f42c1',
      'Red': '#dc3545'
    };
    return colors[badgeTitle] || '#6c757d';
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'planning': '#95a5a6',
      'in-progress': '#f39c12',
      'on-hold': '#e74c3c',
      'completed': '#27ae60'
    };
    return colors[status] || '#95a5a6';
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'low': '#27ae60',
      'medium': '#f39c12',
      'high': '#e74c3c'
    };
    return colors[priority] || '#95a5a6';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return 'Not set';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Group projects by status
  const getGroupedProjects = () => {
    const ongoing = projects.filter(p => p.status === 'in-progress');
    const onHold = projects.filter(p => p.status === 'on-hold');
    const completed = projects.filter(p => p.status === 'completed');
    
    return { ongoing, onHold, completed };
  };

  // Styles
  const styles = {
    container: {
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    },
    header: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem'
    },
    title: {
      fontSize: '2rem',
      color: '#2c3e50',
      marginBottom: '0.5rem'
    },
    subtitle: {
      color: '#7f8c8d',
      fontSize: '1.1rem'
    },
    section: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '1.5rem'
    },
    sectionTitle: {
      fontSize: '1.5rem',
      color: '#2c3e50',
      marginBottom: '1rem',
      borderBottom: '2px solid #e74c3c',
      paddingBottom: '0.5rem'
    },
    projectsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
      gap: '1.5rem'
    },
    projectCard: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '1.5rem',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    projectHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    projectTitle: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: 0,
      flex: 1
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      textTransform: 'capitalize'
    },
    description: {
      color: '#7f8c8d',
      marginBottom: '1rem',
      lineHeight: '1.5'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
      marginBottom: '1rem'
    },
    infoItem: {
      fontSize: '0.9rem'
    },
    infoLabel: {
      fontWeight: 'bold',
      color: '#34495e'
    },
    infoValue: {
      color: '#2c3e50'
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold'
    },
    priorityBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '3px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      textTransform: 'capitalize'
    },
    usersSection: {
      marginTop: '1rem',
      borderTop: '1px solid #dee2e6',
      paddingTop: '1rem'
    },
    usersHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      marginBottom: '0.5rem'
    },
    usersCount: {
      fontSize: '0.9rem',
      fontWeight: 'bold',
      color: '#34495e'
    },
    expandArrow: {
      fontSize: '1.2rem',
      color: '#e74c3c',
      transition: 'transform 0.2s ease'
    },
    expandArrowRotated: {
      transform: 'rotate(90deg)'
    },
    usersList: {
      backgroundColor: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '5px',
      padding: '1rem',
      marginTop: '0.5rem'
    },
    userItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.5rem 0',
      borderBottom: '1px solid #ecf0f1'
    },
    userName: {
      fontWeight: 'bold',
      color: '#2c3e50'
    },
    userEmail: {
      fontSize: '0.8rem',
      color: '#7f8c8d'
    },
    userRole: {
      fontSize: '0.8rem',
      color: '#e74c3c',
      textTransform: 'capitalize'
    },
    actionsContainer: {
      marginTop: '1rem',
      display: 'flex',
      gap: '1rem'
    },
    actionButton: {
      padding: '0.75rem 1rem',
      borderRadius: '5px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: 'bold',
      flex: 1
    },
    completeButton: {
      backgroundColor: '#27ae60',
      color: 'white'
    },
    assignButton: {
      backgroundColor: '#3498db',
      color: 'white'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    noProjects: {
      textAlign: 'center',
      padding: '2rem',
      color: '#7f8c8d'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2>Loading your projects...</h2>
        </div>
      </div>
    );
  }

  const { ongoing, onHold, completed } = getGroupedProjects();

  const renderProject = (project, showActions = false) => (
    <div key={project._id} style={styles.projectCard}>
      {/* Project Header */}
      <div style={styles.projectHeader}>
        <h3 style={styles.projectTitle}>{project.name}</h3>
        <div style={{display: 'flex', gap: '0.5rem', flexDirection: 'column', alignItems: 'flex-end'}}>
          <span 
            style={{
              ...styles.statusBadge,
              backgroundColor: getStatusColor(project.status)
            }}
          >
            {project.status}
          </span>
          {project.badgeReward && (
            <span 
              style={{
                ...styles.badge,
                backgroundColor: getBadgeColor(project.badgeReward)
              }}
            >
              {project.badgeReward}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p style={styles.description}>{project.description}</p>

      {/* Project Info */}
      <div style={styles.infoGrid}>
        <div style={styles.infoItem}>
          <div style={styles.infoLabel}>Priority:</div>
          <span 
            style={{
              ...styles.priorityBadge,
              backgroundColor: getPriorityColor(project.priority)
            }}
          >
            {project.priority}
          </span>
        </div>
        
        <div style={styles.infoItem}>
          <div style={styles.infoLabel}>Budget:</div>
          <div style={styles.infoValue}>{formatCurrency(project.budget)}</div>
        </div>
        
        <div style={styles.infoItem}>
          <div style={styles.infoLabel}>
            {project.status === 'completed' ? 'Completed:' : 'Due Date:'}
          </div>
          <div style={styles.infoValue}>
            {project.status === 'completed' 
              ? formatDate(project.updatedAt)
              : formatDate(project.deadline)
            }
          </div>
        </div>
      </div>

      {/* Assigned Users Section */}
      <div style={styles.usersSection}>
        <div 
          style={styles.usersHeader}
          onClick={() => toggleExpandedProject(project._id)}
        >
          <span style={styles.usersCount}>
            Assigned Users: {project.assignedUsers.length}
          </span>
          <span 
            style={{
              ...styles.expandArrow,
              ...(expandedProject === project._id ? styles.expandArrowRotated : {})
            }}
          >
            ▶
          </span>
        </div>

        {expandedProject === project._id && (
          <div style={styles.usersList}>
            {project.assignedUsers.length === 0 ? (
              <div style={{textAlign: 'center', color: '#7f8c8d'}}>
                No users assigned
              </div>
            ) : (
              project.assignedUsers.map((user, index) => (
                <div key={user._id} style={styles.userItem}>
                  <div>
                    <div style={styles.userName}>{user.name}</div>
                    <div style={styles.userEmail}>{user.email}</div>
                  </div>
                  <div style={styles.userRole}>{user.role}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Action Buttons for ongoing and on-hold projects */}
      {showActions && (
        <div style={styles.actionsContainer}>
          <button
            style={{...styles.actionButton, ...styles.completeButton}}
            onClick={() => handleCompleteProject(project._id)}
            disabled={completingProject === project._id}
          >
            {completingProject === project._id ? 'Completing...' : 'Mark as Complete'}
          </button>
          <button
            style={{...styles.actionButton, ...styles.assignButton}}
            onClick={() => handleAssignUsers(project)}
          >
            Modify Assigned Users
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Project Management</h1>
        <p style={styles.subtitle}>Manage your team's projects and assignments</p>
      </div>

      {/* Ongoing Projects */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Ongoing Projects</h2>
        {ongoing.length === 0 ? (
          <div style={styles.noProjects}>
            <p>No ongoing projects</p>
          </div>
        ) : (
          <div style={styles.projectsGrid}>
            {ongoing.map(project => renderProject(project, true))}
          </div>
        )}
      </div>

      {/* On Hold Projects */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>On Hold Projects</h2>
        {onHold.length === 0 ? (
          <div style={styles.noProjects}>
            <p>No projects on hold</p>
          </div>
        ) : (
          <div style={styles.projectsGrid}>
            {onHold.map(project => renderProject(project, true))}
          </div>
        )}
      </div>

      {/* Completed Projects */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Completed Projects</h2>
        {completed.length === 0 ? (
          <div style={styles.noProjects}>
            <p>No completed projects</p>
          </div>
        ) : (
          <div style={styles.projectsGrid}>
            {completed.map(project => renderProject(project, false))}
          </div>
        )}
      </div>

      {/* User Selection Modal */}
      {showUserSelection && selectedProjectForAssignment && (
        <UserSelection
          projectId={selectedProjectForAssignment._id}
          currentAssignedUsers={selectedProjectForAssignment.assignedUsers}
          onClose={() => setShowUserSelection(false)}
          onConfirm={handleAssignmentConfirm}
        />
      )}
    </div>
  );
};

export default Manage;
