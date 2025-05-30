import React, { useState, useEffect } from 'react';

const Catalog = () => {
  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);

  // Fetch courses and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          console.error('No token found');
          setLoading(false);
          return;
        }

        // Fetch courses
        const coursesResponse = await fetch('http://localhost:4000/api/course/getAllCourses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch projects
        const projectsResponse = await fetch('http://localhost:4000/api/project/getAllProjects', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (coursesResponse.ok && projectsResponse.ok) {
          const coursesData = await coursesResponse.json();
          const projectsData = await projectsResponse.json();
          
          setCourses(coursesData);
          setProjects(projectsData.projects || []);
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

  // Handle course click to show details
  const handleCourseClick = (course) => {
    setSelectedCourse(course);
    setShowCourseModal(true);
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

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': '#27ae60',
      'Intermediate': '#f39c12',
      'Advanced': '#e74c3c'
    };
    return colors[difficulty] || '#95a5a6';
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

  // Styles
  const styles = {
    container: {
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    },
    section: {
      backgroundColor: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    },
    sectionTitle: {
      fontSize: '2rem',
      color: '#2c3e50',
      marginBottom: '1.5rem',
      borderBottom: '3px solid #e74c3c',
      paddingBottom: '0.5rem'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '1.5rem'
    },
    card: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '1.5rem',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    cardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1rem'
    },
    cardTitle: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: 0,
      flex: 1
    },
    badge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold'
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
    statusBadge: {
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      textTransform: 'capitalize'
    },
    priorityBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '3px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold',
      textTransform: 'capitalize'
    },
    difficultyBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '3px',
      color: 'white',
      fontSize: '0.8rem',
      fontWeight: 'bold'
    },
    skillsContainer: {
      marginBottom: '1rem'
    },
    skillsTitle: {
      fontSize: '0.9rem',
      fontWeight: 'bold',
      color: '#34495e',
      marginBottom: '0.5rem'
    },
    skillsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    skillTag: {
      backgroundColor: '#3498db',
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '12px',
      fontSize: '0.75rem'
    },
    skillTagRequired: {
      backgroundColor: '#e74c3c'
    },
    skillTagGained: {
      backgroundColor: '#27ae60'
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
    userItemLast: {
      borderBottom: 'none'
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
    contentTitle: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '0.5rem'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '0.75rem',
      marginBottom: '1rem'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2>Loading catalog...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Courses Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Available Courses</h2>
        
        {courses.length === 0 ? (
          <div style={{textAlign: 'center', color: '#7f8c8d', padding: '2rem'}}>
            <p>No courses available</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {courses.map((course) => (
              <div
                key={course._id}
                style={styles.card}
                onClick={() => handleCourseClick(course)}
              >
                {/* Course Header */}
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{course.name}</h3>
                  {course.badgeReward && (
                    <span 
                      style={{
                        ...styles.badge,
                        backgroundColor: getBadgeColor(course.badgeReward)
                      }}
                    >
                      {course.badgeReward}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={styles.description}>{course.description}</p>

                {/* Course Info Grid */}
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Enrolled Users:</div>
                    <div style={styles.infoValue}>{course.enrolledUsers.length}</div>
                  </div>
                  
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Created:</div>
                    <div style={styles.infoValue}>{formatDate(course.createdAt)}</div>
                  </div>
                  
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Difficulty:</div>
                    <span 
                      style={{
                        ...styles.difficultyBadge,
                        backgroundColor: getDifficultyColor(course.difficulty)
                      }}
                    >
                      {course.difficulty}
                    </span>
                  </div>
                  
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>ETA:</div>
                    <div style={styles.infoValue}>{course.eta}</div>
                  </div>
                </div>

                {/* Skills Gained */}
                {course.skillsGained && course.skillsGained.length > 0 && (
                  <div style={styles.skillsContainer}>
                    <div style={styles.skillsTitle}>Skills Gained:</div>
                    <div style={styles.skillsList}>
                      {course.skillsGained.map((skill, index) => (
                        <span key={index} style={{...styles.skillTag, ...styles.skillTagGained}}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Available Projects</h2>
        
        {projects.length === 0 ? (
          <div style={{textAlign: 'center', color: '#7f8c8d', padding: '2rem'}}>
            <p>No projects available</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {projects.map((project) => (
              <div key={project._id} style={styles.card}>
                {/* Project Header */}
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{project.name}</h3>
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

                {/* Project Info Grid */}
                <div style={styles.detailsGrid}>
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
                    <div style={styles.infoLabel}>Created:</div>
                    <div style={styles.infoValue}>{formatDate(project.createdAt)}</div>
                  </div>
                  
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>
                      {project.status === 'completed' ? 'Completed:' : 'Due Date:'}
                    </div>
                    <div style={styles.infoValue}>
                      {project.status === 'completed' 
                        ? formatDate(project.completedAt || project.updatedAt)
                        : formatDate(project.deadline)
                      }
                    </div>
                  </div>
                  
                  <div style={styles.infoItem}>
                    <div style={styles.infoLabel}>Managed By:</div>
                    <div style={styles.infoValue}>
                      {project.managedBy ? project.managedBy.name : 'Not assigned'}
                    </div>
                  </div>
                </div>

                {/* Skills Required */}
                {project.skillsRequired && project.skillsRequired.length > 0 && (
                  <div style={styles.skillsContainer}>
                    <div style={styles.skillsTitle}>Skills Required:</div>
                    <div style={styles.skillsList}>
                      {project.skillsRequired.map((skill, index) => (
                        <span key={index} style={{...styles.skillTag, ...styles.skillTagRequired}}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills Gained */}
                {project.skillsGained && project.skillsGained.length > 0 && (
                  <div style={styles.skillsContainer}>
                    <div style={styles.skillsTitle}>Skills Gained:</div>
                    <div style={styles.skillsList}>
                      {project.skillsGained.map((skill, index) => (
                        <span key={index} style={{...styles.skillTag, ...styles.skillTagGained}}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assigned Users Section */}
                <div style={styles.usersSection}>
                  <div 
                    style={styles.usersHeader}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpandedProject(project._id);
                    }}
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

                  {/* Expanded Users List */}
                  {expandedProject === project._id && (
                    <div style={styles.usersList}>
                      {project.assignedUsers.length === 0 ? (
                        <div style={{textAlign: 'center', color: '#7f8c8d'}}>
                          No users assigned
                        </div>
                      ) : (
                        project.assignedUsers.map((user, index) => (
                          <div 
                            key={user._id} 
                            style={{
                              ...styles.userItem,
                              ...(index === project.assignedUsers.length - 1 ? styles.userItemLast : {})
                            }}
                          >
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      {showCourseModal && selectedCourse && (
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

            {/* Course Details */}
            <div style={{marginBottom: '2rem'}}>
              <div style={styles.infoGrid}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Category: </span>
                  <span style={styles.infoValue}>{selectedCourse.category}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Difficulty: </span>
                  <span 
                    style={{
                      ...styles.difficultyBadge,
                      backgroundColor: getDifficultyColor(selectedCourse.difficulty)
                    }}
                  >
                    {selectedCourse.difficulty}
                  </span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>ETA: </span>
                  <span style={styles.infoValue}>{selectedCourse.eta}</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Badge Reward: </span>
                  {selectedCourse.badgeReward ? (
                    <span 
                      style={{
                        ...styles.badge,
                        backgroundColor: getBadgeColor(selectedCourse.badgeReward)
                      }}
                    >
                      {selectedCourse.badgeReward}
                    </span>
                  ) : (
                    <span style={styles.infoValue}>None</span>
                  )}
                </div>
              </div>

              {/* Prerequisites */}
              {selectedCourse.preRequisites && selectedCourse.preRequisites.length > 0 && (
                <div style={styles.skillsContainer}>
                  <div style={styles.skillsTitle}>Prerequisites:</div>
                  <ul>
                    {selectedCourse.preRequisites.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills Gained */}
              {selectedCourse.skillsGained && selectedCourse.skillsGained.length > 0 && (
                <div style={styles.skillsContainer}>
                  <div style={styles.skillsTitle}>Skills Gained:</div>
                  <div style={styles.skillsList}>
                    {selectedCourse.skillsGained.map((skill, index) => (
                      <span key={index} style={{...styles.skillTag, ...styles.skillTagGained}}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Course Content */}
            <div>
              <h3 style={{color: '#2c3e50', marginBottom: '1rem'}}>Course Content</h3>
              {selectedCourse.content.map((content, index) => (
                <div key={content._id} style={styles.contentItem}>
                  <h4 style={styles.contentTitle}>
                    {index + 1}. {content.title}
                  </h4>
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
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;
