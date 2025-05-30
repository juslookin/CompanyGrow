import React, { useState, useEffect } from 'react';

const Develop = () => {
  const [userData, setUserData] = useState(null);
  const [userCourses, setUserCourses] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);
  const [completingModule, setCompletingModule] = useState(null);

  // Get user ID from localStorage
  const getUserId = () => {
    return localStorage.getItem('id');
  };

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = getUserId();

        if (!token || !userId) {
          console.error('No token or user ID found');
          setLoading(false);
          return;
        }

        // Fetch user profile
        const userResponse = await fetch(`http://localhost:4000/api/user/getProfile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch all courses
        const coursesResponse = await fetch('http://localhost:4000/api/course/getAllCourses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch all projects
        const projectsResponse = await fetch('http://localhost:4000/api/project/getAllProjects', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (userResponse.ok && coursesResponse.ok && projectsResponse.ok) {
          const userData = await userResponse.json();
          const coursesData = await coursesResponse.json();
          const projectsData = await projectsResponse.json();

          setUserData(userData);
          setAllCourses(coursesData);
          setAllProjects(projectsData.projects || []);

          // Extract user's enrolled courses and projects from performance metrics
          extractUserActivities(userData, coursesData, projectsData.projects || []);
        } else {
          console.error('Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Extract user's courses and projects from performance metrics
  const extractUserActivities = (userData, allCourses, allProjects) => {
    const userCourses = [];
    const userProjects = [];

    if (userData.performanceMetrics) {
      userData.performanceMetrics.forEach(metric => {
        if (metric.goals) {
          metric.goals.forEach(goal => {
            if (goal.mode === 'Training') {
              const course = allCourses.find(c => c.name === goal.title);
              if (course) {
                const enrolledUser = course.enrolledUsers.find(u => u.userId === userData._id);
                userCourses.push({
                  ...course,
                  goalStatus: goal.status,
                  enrolledAt: enrolledUser?.enrolledAt,
                  completedAt: goal.completedAt || enrolledUser?.completedAt,
                  progress: enrolledUser?.progress || 0,
                  completedModules: enrolledUser?.completedModules || []
                });
              }
            } else if (goal.mode === 'Project') {
              const project = allProjects.find(p => p.name === goal.title);
              if (project) {
                userProjects.push({
                  ...project,
                  goalStatus: goal.status,
                  completedAt: goal.completedAt
                });
              }
            }
          });
        }
      });
    }

    setUserCourses(userCourses);
    setUserProjects(userProjects);
  };

  // Handle course click to show details
  const handleCourseClick = async (course) => {
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();

      const response = await fetch(`http://localhost:4000/api/user/getCourseStatus/${userId}/${course._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const details = await response.json();
        setSelectedCourse(course);
        setCourseDetails(details);
        setShowCourseModal(true);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  // Handle module completion
  const handleCompleteModule = async (courseId, contentId) => {
    setCompletingModule(contentId);
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();

      const response = await fetch(`http://localhost:4000/api/course/completeModule/${userId}/${courseId}/${contentId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Module completed! Progress: ${result.progress}%`);
        // Refresh course details
        handleCourseClick(selectedCourse);
        // Refresh main data
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error completing module:', error);
      alert('Error completing module. Please try again.');
    } finally {
      setCompletingModule(null);
    }
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
      'in-progress': '#f39c12',
      'on-hold': '#e74c3c',
      'completed': '#27ae60',
      'pending': '#95a5a6'
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

  // Group activities by status
  const getGroupedActivities = () => {
    const inProgress = [];
    const onHold = [];
    const completed = [];

    // Add courses
    userCourses.forEach(course => {
      const activity = { ...course, type: 'course' };
      if (course.goalStatus === 'in-progress') {
        inProgress.push(activity);
      } else if (course.goalStatus === 'on-hold') {
        onHold.push(activity);
      } else if (course.goalStatus === 'completed') {
        completed.push(activity);
      }
    });

    // Add projects
    userProjects.forEach(project => {
      const activity = { ...project, type: 'project' };
      if (project.goalStatus === 'in-progress') {
        inProgress.push(activity);
      } else if (project.goalStatus === 'on-hold' || project.status === 'on-hold') {
        onHold.push(activity);
      } else if (project.goalStatus === 'completed' || project.status === 'completed') {
        completed.push(activity);
      }
    });

    return { inProgress, onHold, completed };
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
      borderBottom: '2px solid #3498db',
      paddingBottom: '0.5rem'
    },
    activitiesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1rem'
    },
    activityCard: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '1.5rem',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    activityCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
    },
    activityHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    activityType: {
      backgroundColor: '#3498db',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      textTransform: 'uppercase'
    },
    activityTitle: {
      fontSize: '1.2rem',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: '0.5rem 0'
    },
    activityDescription: {
      color: '#7f8c8d',
      marginBottom: '1rem',
      lineHeight: '1.5'
    },
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      textTransform: 'capitalize'
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.5rem',
      marginBottom: '1rem',
      fontSize: '0.9rem'
    },
    infoItem: {
      display: 'flex',
      justifyContent: 'space-between'
    },
    infoLabel: {
      fontWeight: 'bold',
      color: '#34495e'
    },
    infoValue: {
      color: '#2c3e50'
    },
    badgeReward: {
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      display: 'inline-block'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: '#ecf0f1',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '0.5rem'
    },
    progressFill: {
      height: '100%',
      backgroundColor: '#3498db',
      transition: 'width 0.3s ease'
    },
    progressText: {
      fontSize: '0.8rem',
      color: '#7f8c8d',
      textAlign: 'center'
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
      cursor: 'pointer'
    },
    expandArrow: {
      fontSize: '1rem',
      color: '#3498db',
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
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      maxWidth: '800px',
      maxHeight: '80vh',
      overflow: 'auto',
      width: '90%',
      padding: '2rem'
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      borderBottom: '1px solid #eee',
      paddingBottom: '1rem'
    },
    modalTitle: {
      fontSize: '1.5rem',
      color: '#2c3e50',
      margin: 0
    },
    closeButton: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      cursor: 'pointer'
    },
    contentItem: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '5px',
      padding: '1rem',
      marginBottom: '1rem'
    },
    contentHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem'
    },
    contentTitle: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#2c3e50'
    },
    moduleButton: {
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '0.9rem'
    },
    moduleCompletedButton: {
      backgroundColor: '#27ae60',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '5px',
      cursor: 'not-allowed',
      fontSize: '0.9rem'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    noActivities: {
      textAlign: 'center',
      padding: '2rem',
      color: '#7f8c8d'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2>Loading your development activities...</h2>
        </div>
      </div>
    );
  }

  const { inProgress, onHold, completed } = getGroupedActivities();

  const renderActivity = (activity) => (
    <div
      key={`${activity.type}-${activity._id}`}
      style={styles.activityCard}
      onClick={() => activity.type === 'course' ? handleCourseClick(activity) : null}
    >
      {/* Activity Header */}
      <div style={styles.activityHeader}>
        <span style={styles.activityType}>{activity.type}</span>
        <span 
          style={{
            ...styles.statusBadge,
            backgroundColor: getStatusColor(activity.goalStatus || activity.status)
          }}
        >
          {activity.goalStatus || activity.status}
        </span>
      </div>

      {/* Title and Description */}
      <h3 style={styles.activityTitle}>{activity.name}</h3>
      <p style={styles.activityDescription}>{activity.description}</p>

      {/* Progress Bar for Courses */}
      {activity.type === 'course' && (
        <div>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${activity.progress || 0}%`
              }}
            />
          </div>
          <div style={styles.progressText}>{activity.progress || 0}% Complete</div>
        </div>
      )}

      {/* Info Grid */}
      <div style={styles.infoGrid}>
        {activity.type === 'course' ? (
          <>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Difficulty:</span>
              <span style={styles.infoValue}>{activity.difficulty}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Enrolled:</span>
              <span style={styles.infoValue}>{formatDate(activity.enrolledAt)}</span>
            </div>
          </>
        ) : (
          <>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Budget:</span>
              <span style={styles.infoValue}>{formatCurrency(activity.budget)}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Priority:</span>
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '3px',
                color: 'white',
                fontSize: '0.8rem',
                backgroundColor: getPriorityColor(activity.priority)
              }}>
                {activity.priority}
              </span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Created:</span>
              <span style={styles.infoValue}>{formatDate(activity.createdAt)}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Managed By:</span>
              <span style={styles.infoValue}>
                {activity.managedBy ? activity.managedBy.name : 'Not assigned'}
              </span>
            </div>
          </>
        )}

        {/* Due Date (if not completed) */}
        {activity.type === 'project' && activity.goalStatus !== 'completed' && (
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Due Date:</span>
            <span style={styles.infoValue}>{formatDate(activity.deadline)}</span>
          </div>
        )}

        {/* Completion Date (if completed) */}
        {activity.completedAt && (
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Completed:</span>
            <span style={styles.infoValue}>{formatDate(activity.completedAt)}</span>
          </div>
        )}

        {/* Badge Reward */}
        <div style={styles.infoItem}>
          <span style={styles.infoLabel}>Badge:</span>
          {activity.badgeReward ? (
            <span 
              style={{
                ...styles.badgeReward,
                backgroundColor: getBadgeColor(activity.badgeReward)
              }}
            >
              {activity.badgeReward}
            </span>
          ) : (
            <span style={styles.infoValue}>None</span>
          )}
        </div>
      </div>

      {/* Assigned Users for Projects */}
      {activity.type === 'project' && (
        <div style={styles.usersSection}>
          <div 
            style={styles.usersHeader}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpandedProject(activity._id);
            }}
          >
            <span style={styles.infoLabel}>
              Assigned Users: {activity.assignedUsers.length}
            </span>
            <span 
              style={{
                ...styles.expandArrow,
                ...(expandedProject === activity._id ? styles.expandArrowRotated : {})
              }}
            >
              ▶
            </span>
          </div>

          {expandedProject === activity._id && (
            <div style={styles.usersList}>
              {activity.assignedUsers.length === 0 ? (
                <div style={{textAlign: 'center', color: '#7f8c8d'}}>
                  No users assigned
                </div>
              ) : (
                activity.assignedUsers.map((user, index) => (
                  <div key={user._id} style={styles.userItem}>
                    <div>
                      <div style={styles.userName}>{user.name}</div>
                      <div style={styles.userEmail}>{user.email}</div>
                    </div>
                    <div style={{color: '#3498db', textTransform: 'capitalize'}}>
                      {user.role}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>My Development</h1>
        <p style={styles.subtitle}>Track your learning progress and project involvement</p>
      </div>

      {/* In Progress Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>In Progress</h2>
        {inProgress.length === 0 ? (
          <div style={styles.noActivities}>
            <p>No activities in progress</p>
          </div>
        ) : (
          <div style={styles.activitiesGrid}>
            {inProgress.map(renderActivity)}
          </div>
        )}
      </div>

      {/* On Hold Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>On Hold</h2>
        {onHold.length === 0 ? (
          <div style={styles.noActivities}>
            <p>No activities on hold</p>
          </div>
        ) : (
          <div style={styles.activitiesGrid}>
            {onHold.map(renderActivity)}
          </div>
        )}
      </div>

      {/* Completed Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Completed</h2>
        {completed.length === 0 ? (
          <div style={styles.noActivities}>
            <p>No completed activities</p>
          </div>
        ) : (
          <div style={styles.activitiesGrid}>
            {completed.map(renderActivity)}
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      {showCourseModal && selectedCourse && courseDetails && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedCourse.name}</h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowCourseModal(false)}
              >
                Close
              </button>
            </div>

            {/* Progress Bar */}
            <div style={{marginBottom: '2rem'}}>
              <div style={styles.progressBar}>
                <div 
                  style={{
                    ...styles.progressFill,
                    width: `${courseDetails.progress || 0}%`
                  }}
                />
              </div>
              <div style={styles.progressText}>
                {courseDetails.progress || 0}% Complete
              </div>
            </div>

            {/* Course Content */}
            <div>
              <h3 style={{color: '#2c3e50', marginBottom: '1rem'}}>Course Content</h3>
              {courseDetails.courseContent.map((content, index) => {
                const isCompleted = courseDetails.completedModules.includes(content._id);
                
                return (
                  <div key={content._id} style={styles.contentItem}>
                    <div style={styles.contentHeader}>
                      <h4 style={styles.contentTitle}>
                        {index + 1}. {content.title}
                      </h4>
                      <button
                        style={isCompleted ? styles.moduleCompletedButton : styles.moduleButton}
                        onClick={() => {
                          if (!isCompleted) {
                            handleCompleteModule(selectedCourse._id, content._id);
                          }
                        }}
                        disabled={isCompleted || completingModule === content._id}
                      >
                        {completingModule === content._id ? 'Completing...' : 
                         isCompleted ? 'Completed' : 'Complete Module'}
                      </button>
                    </div>
                    <p>{content.description}</p>
                    
                    {content.videoUrl && content.videoUrl.length > 0 && (
                      <div>
                        <strong>Videos:</strong>
                        <ul>
                          {content.videoUrl.map((url, urlIndex) => (
                            <li key={urlIndex}>
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                Video {urlIndex + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {content.resourceLink && content.resourceLink.length > 0 && (
                      <div>
                        <strong>Resources:</strong>
                        <ul>
                          {content.resourceLink.map((link, linkIndex) => (
                            <li key={linkIndex}>
                              <a href={link} target="_blank" rel="noopener noreferrer">
                                Resource {linkIndex + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Develop;
