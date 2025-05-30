import React, { useState, useEffect } from 'react';
import CatalogProjects from './catalogProjects';

const Catalog = () => {
  const [courses, setCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [completingModule, setCompletingModule] = useState(null);
  
  // Filter and sort states
  const [nameFilter, setNameFilter] = useState('');
  const [skillsFilter, setSkillsFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt' or 'enrolledCount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  // Get user ID from localStorage
  const getUserId = () => {
    return localStorage.getItem('id');
  };

  // Fetch courses and user data
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

        // Fetch courses
        const coursesResponse = await fetch('http://localhost:4000/api/course/getAllCourses', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Fetch user data
        const userResponse = await fetch(`http://localhost:4000/api/user/getProfile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (coursesResponse.ok && userResponse.ok) {
          const coursesData = await coursesResponse.json();
          const userData = await userResponse.json();
          
          setCourses(coursesData);
          setUserData(userData);
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

  // Check enrollment status for a course
  const getEnrollmentStatus = (courseName) => {
    if (!userData || !userData.performanceMetrics) return null;

    for (const metric of userData.performanceMetrics) {
      if (metric.goals) {
        const goal = metric.goals.find(
          g => g.title === courseName && g.mode === 'Training'
        );
        if (goal) {
          return goal.status; // 'pending', 'in-progress', 'completed'
        }
      }
    }
    return null;
  };

  // Handle course enrollment
  const handleEnrollCourse = async (courseId) => {
    setEnrolling(true);
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();

      const response = await fetch(`http://localhost:4000/api/course/enrollCourse/${userId}/${courseId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Successfully enrolled in the course!');
        // Refresh user data to update enrollment status
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert(`Enrollment failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Error enrolling in course. Please try again.');
    } finally {
      setEnrolling(false);
    }
  };

  // Handle module completion
  const handleCompleteModule = async (courseId, contentId) => {
    setCompletingModule(contentId);
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();
      console.log(userId);
      console.log(courseId);
      console.log(contentId);

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
        // Refresh data to update completion status
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

  // Check if user has completed a specific module
  const isModuleCompleted = (courseId, contentId) => {
    if (!selectedCourse || !selectedCourse.enrolledUsers) return false;
    
    const userId = getUserId();
    const userProgress = selectedCourse.enrolledUsers.find(
      user => user.userId === userId
    );
    
    return userProgress && userProgress.completedModules.includes(contentId);
  };

  // Filter and sort courses
  const getFilteredAndSortedCourses = () => {
    let filtered = courses.filter(course => {
      const nameMatch = course.name.toLowerCase().includes(nameFilter.toLowerCase());
      const skillsMatch = skillsFilter === '' || 
        course.skillsGained.some(skill => 
          skill.toLowerCase().includes(skillsFilter.toLowerCase())
        );
      return nameMatch && skillsMatch;
    });

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'createdAt') {
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
      } else if (sortBy === 'enrolledCount') {
        aValue = a.enrolledUsers.length;
        bValue = b.enrolledUsers.length;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get enrollment button text and style
  const getEnrollmentButton = (course) => {
    const status = getEnrollmentStatus(course.name);
    
    if (!status) {
      return {
        text: 'Enroll',
        style: styles.enrollButton,
        onClick: () => handleEnrollCourse(course._id),
        disabled: enrolling
      };
    }

    switch (status) {
      case 'in-progress':
        return {
          text: 'In Progress',
          style: styles.inProgressButton,
          onClick: null,
          disabled: true
        };
      case 'completed':
        return {
          text: 'Completed',
          style: styles.completedButton,
          onClick: null,
          disabled: true
        };
      default:
        return {
          text: 'Enroll',
          style: styles.enrollButton,
          onClick: () => handleEnrollCourse(course._id),
          disabled: enrolling
        };
    }
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
      marginBottom: '1rem'
    },
    filtersContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      marginBottom: '1rem'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    filterLabel: {
      fontSize: '0.9rem',
      fontWeight: 'bold',
      color: '#34495e',
      marginBottom: '0.5rem'
    },
    filterInput: {
      padding: '0.5rem',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '1rem'
    },
    filterSelect: {
      padding: '0.5rem',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '1rem',
      backgroundColor: 'white'
    },
    coursesGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    },
    courseCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '1.5rem',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease'
    },
    courseCardHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
    },
    courseName: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#2c3e50',
      marginBottom: '0.5rem'
    },
    courseDescription: {
      color: '#7f8c8d',
      marginBottom: '1rem',
      lineHeight: '1.5'
    },
    courseStats: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.5rem',
      marginBottom: '1rem',
      fontSize: '0.9rem'
    },
    statItem: {
      color: '#34495e'
    },
    statLabel: {
      fontWeight: 'bold'
    },
    enrollButton: {
      backgroundColor: '#3498db',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1rem',
      width: '100%'
    },
    inProgressButton: {
      backgroundColor: '#f39c12',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '5px',
      cursor: 'not-allowed',
      fontSize: '1rem',
      width: '100%'
    },
    completedButton: {
      backgroundColor: '#27ae60',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '5px',
      cursor: 'not-allowed',
      fontSize: '1rem',
      width: '100%'
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
    courseDetails: {
      marginBottom: '2rem'
    },
    detailSection: {
      marginBottom: '1.5rem'
    },
    detailTitle: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#2c3e50',
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
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
      fontSize: '0.85rem'
    },
    contentList: {
      marginTop: '1rem'
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
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2>Loading courses...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with filters */}
      <div style={styles.header}>
        <h1 style={styles.title}>Course Catalog</h1>
        
        {/* Filters and Sorting */}
        <div style={styles.filtersContainer}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Search by Course Name:</label>
            <input
              type="text"
              style={styles.filterInput}
              placeholder="Enter course name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Filter by Skills:</label>
            <input
              type="text"
              style={styles.filterInput}
              placeholder="Enter skill..."
              value={skillsFilter}
              onChange={(e) => setSkillsFilter(e.target.value)}
            />
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Sort by:</label>
            <select
              style={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Date Created</option>
              <option value="enrolledCount">Enrolled Users</option>
            </select>
          </div>
          
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Order:</label>
            <select
              style={styles.filterSelect}
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div style={styles.coursesGrid}>
        {getFilteredAndSortedCourses().map((course) => {
          const enrollmentButton = getEnrollmentButton(course);
          
          return (
            <div
              key={course._id}
              style={styles.courseCard}
              onClick={() => {
                setSelectedCourse(course);
                setShowCourseDetails(true);
              }}
            >
              <h3 style={styles.courseName}>{course.name}</h3>
              <p style={styles.courseDescription}>{course.description}</p>
              
              <div style={styles.courseStats}>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Enrolled: </span>
                  {course.enrolledUsers.length} users
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Created: </span>
                  {formatDate(course.createdAt)}
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>ETA: </span>
                  {course.eta}
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Difficulty: </span>
                  {course.difficulty}
                </div>
              </div>
              
              <button
                style={enrollmentButton.style}
                onClick={(e) => {
                  e.stopPropagation();
                  if (enrollmentButton.onClick) {
                    enrollmentButton.onClick();
                  }
                }}
                disabled={enrollmentButton.disabled}
              >
                {enrollmentButton.text}
              </button>
            </div>
          );
        })}
      </div>

      {/* Projects Section */}
      <CatalogProjects />

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedCourse.name}</h2>
              <button
                style={styles.closeButton}
                onClick={() => setShowCourseDetails(false)}
              >
                Close
              </button>
            </div>

            <div style={styles.courseDetails}>
              <div style={styles.detailSection}>
                <h3 style={styles.detailTitle}>Description</h3>
                <p>{selectedCourse.description}</p>
              </div>

              <div style={styles.detailSection}>
                <h3 style={styles.detailTitle}>Course Information</h3>
                <p><strong>Category:</strong> {selectedCourse.category}</p>
                <p><strong>Difficulty:</strong> {selectedCourse.difficulty}</p>
                <p><strong>ETA:</strong> {selectedCourse.eta}</p>
                <p><strong>Badge Reward:</strong> {selectedCourse.badgeReward}</p>
              </div>

              {selectedCourse.preRequisites && selectedCourse.preRequisites.length > 0 && (
                <div style={styles.detailSection}>
                  <h3 style={styles.detailTitle}>Prerequisites</h3>
                  <ul>
                    {selectedCourse.preRequisites.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedCourse.skillsGained && selectedCourse.skillsGained.length > 0 && (
                <div style={styles.detailSection}>
                  <h3 style={styles.detailTitle}>Skills You'll Gain</h3>
                  <div style={styles.skillsList}>
                    {selectedCourse.skillsGained.map((skill, index) => (
                      <span key={index} style={styles.skillTag}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}

              <div style={styles.detailSection}>
                <h3 style={styles.detailTitle}>Course Content</h3>
                <div style={styles.contentList}>
                  {selectedCourse.content.map((content, index) => {
                    const isCompleted = isModuleCompleted(selectedCourse._id, content._id);
                    const isEnrolled = getEnrollmentStatus(selectedCourse.name);
                    
                    return (
                      <div key={content._id} style={styles.contentItem}>
                        <div style={styles.contentHeader}>
                          <h4 style={styles.contentTitle}>
                            {index + 1}. {content.title}
                          </h4>
                          {isEnrolled && (
                            <button
                              style={isCompleted ? styles.moduleCompletedButton : styles.moduleButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isCompleted) {
                                  handleCompleteModule(selectedCourse._id, content._id);
                                }
                              }}
                              disabled={isCompleted || completingModule === content._id}
                            >
                              {completingModule === content._id ? 'Completing...' : 
                               isCompleted ? 'Completed' : 'Complete Module'}
                            </button>
                          )}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Catalog;