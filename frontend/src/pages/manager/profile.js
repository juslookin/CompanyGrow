import React, { useState, useEffect } from 'react';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Get user ID from localStorage
  const getUserId = () => {
    return localStorage.getItem('id');
  };

  // Fetch user data from backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = getUserId();
        
        if (!userId || !token) {
          console.error('No user ID or token found');
          setError('Authentication required. Please login again.');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:4000/api/user/getProfile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          setEditData(data);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(`Failed to load profile: ${errorData.message}`);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(`Network error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditToggle = () => {
    setShowEditForm(!showEditForm);
    if (!showEditForm) {
      setEditData(userData); // Reset edit data when opening form
    }
  };

  const handleInputChange = (field, value, nestedField = null) => {
    if (nestedField) {
      setEditData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [nestedField]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSkillsChange = (value) => {
    const skillsArray = value.split(',').map(skill => skill.trim()).filter(skill => skill);
    setEditData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();

      // Prepare data for backend (exclude read-only fields)
      const updateData = {
        name: editData.name,
        phone: editData.phone,
        department: editData.department,
        position: editData.position,
        experience: editData.experience,
        skills: editData.skills,
        address: editData.address,
        emergencyContact: editData.emergencyContact
      };

      const response = await fetch(`http://localhost:4000/api/user/modifyProfile/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const responseData = await response.json();
        setUserData(responseData.user);
        setShowEditForm(false);
        alert('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        alert(`Error updating profile: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getBadgeColor = (title) => {
    const colors = {
      'Green': '#27ae60',
      'Cyan': '#17a2b8',
      'Blue': '#007bff',
      'Purple': '#6f42c1',
      'Red': '#dc3545'
    };
    return colors[title] || '#6c757d';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { backgroundColor: '#27ae60', color: 'white' };
      case 'in-progress': return { backgroundColor: '#f39c12', color: 'white' };
      case 'pending': return { backgroundColor: '#95a5a6', color: 'white' };
      default: return { backgroundColor: '#95a5a6', color: 'white' };
    }
  };

  // Styles with manager theme (red accents)
  const styles = {
    container: {
      backgroundColor: '#f8f9fa',
      padding: '1rem',
      minHeight: '100vh'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
      backgroundColor: 'white',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    title: {
      fontSize: '1.8rem',
      color: '#2c3e50',
      margin: 0
    },
    editButton: {
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    editButtonDisabled: {
      backgroundColor: '#95a5a6',
      cursor: 'not-allowed'
    },
    profileContent: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '1.5rem'
    },
    section: {
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
      fontSize: '1.2rem',
      color: '#2c3e50',
      marginBottom: '1rem',
      borderBottom: '2px solid #e74c3c',
      paddingBottom: '0.5rem'
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '0.75rem',
      padding: '0.5rem 0',
      borderBottom: '1px solid #ecf0f1'
    },
    label: {
      fontWeight: 'bold',
      color: '#34495e',
      minWidth: '120px'
    },
    value: {
      color: '#2c3e50',
      flex: 1,
      textAlign: 'right'
    },
    skillsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.5rem',
      justifyContent: 'flex-end'
    },
    skillTag: {
      backgroundColor: '#e74c3c',
      color: 'white',
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
      fontSize: '0.85rem'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '15px',
      color: 'white',
      fontSize: '0.8rem',
      margin: '0.25rem'
    },
    performanceCard: {
      backgroundColor: '#f8f9fa',
      padding: '1rem',
      borderRadius: '5px',
      marginBottom: '1rem',
      border: '1px solid #dee2e6'
    },
    goalItem: {
      backgroundColor: 'white',
      padding: '0.75rem',
      borderRadius: '5px',
      marginBottom: '0.5rem',
      border: '1px solid #dee2e6'
    },
    statusBadge: {
      padding: '0.25rem 0.5rem',
      borderRadius: '3px',
      fontSize: '0.75rem',
      fontWeight: 'bold'
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
      padding: '2rem',
      borderRadius: '8px',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflow: 'auto',
      width: '90%'
    },
    formGroup: {
      marginBottom: '1rem'
    },
    formLabel: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: 'bold',
      color: '#34495e'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #ddd',
      borderRadius: '5px',
      fontSize: '1rem',
      boxSizing: 'border-box'
    },
    formActions: {
      display: 'flex',
      gap: '1rem',
      justifyContent: 'flex-end',
      marginTop: '2rem'
    },
    saveButton: {
      backgroundColor: '#27ae60',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '5px',
      cursor: 'pointer'
    },
    saveButtonDisabled: {
      backgroundColor: '#95a5a6',
      cursor: 'not-allowed'
    },
    cancelButton: {
      backgroundColor: '#95a5a6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '5px',
      cursor: 'pointer'
    },
    loadingContainer: {
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    errorContainer: {
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: '#fff5f5',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      border: '1px solid #fed7d7'
    },
    errorTitle: {
      color: '#e53e3e',
      marginBottom: '1rem'
    },
    errorText: {
      color: '#c53030'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2>Loading profile...</h2>
          <p>Fetching your profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Error Loading Profile</h2>
          <p style={styles.errorText}>{error}</p>
          <button 
            style={styles.editButton}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <h2>Profile not found</h2>
          <p>Unable to load profile data. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Manager Profile</h1>
        <button 
          style={{
            ...styles.editButton,
            ...(saving ? styles.editButtonDisabled : {})
          }}
          onClick={handleEditToggle}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Modify Details'}
        </button>
      </div>

      {/* Profile Content */}
      <div style={styles.profileContent}>
        {/* Basic Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Basic Information</h2>
          <div style={styles.infoRow}>
            <span style={styles.label}>Name:</span>
            <span style={styles.value}>{userData.name}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Email:</span>
            <span style={styles.value}>{userData.email}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Role:</span>
            <span style={styles.value}>{userData.role}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Phone:</span>
            <span style={styles.value}>{userData.phone || 'Not provided'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Status:</span>
            <span style={styles.value}>{userData.isActive ? 'Active' : 'Inactive'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Last Login:</span>
            <span style={styles.value}>{formatDate(userData.lastLogin)}</span>
          </div>
        </div>

        {/* Professional Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Professional Information</h2>
          <div style={styles.infoRow}>
            <span style={styles.label}>Department:</span>
            <span style={styles.value}>{userData.department || 'Not specified'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Position:</span>
            <span style={styles.value}>{userData.position || 'Not specified'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Experience:</span>
            <span style={styles.value}>{userData.experience} years</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Join Date:</span>
            <span style={styles.value}>{formatDate(userData.joinDate)}</span>
          </div>
        </div>

        {/* Skills */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Skills & Competencies</h2>
          <div style={styles.skillsContainer}>
            {userData.skills && userData.skills.length > 0 ? (
              userData.skills.map((skill, index) => (
                <span key={index} style={styles.skillTag}>
                  {skill}
                </span>
              ))
            ) : (
              <span style={styles.value}>No skills listed</span>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Address Information</h2>
          <div style={styles.infoRow}>
            <span style={styles.label}>Street:</span>
            <span style={styles.value}>{userData.address?.street || 'Not provided'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>City:</span>
            <span style={styles.value}>{userData.address?.city || 'Not provided'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>State:</span>
            <span style={styles.value}>{userData.address?.state || 'Not provided'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Zip Code:</span>
            <span style={styles.value}>{userData.address?.zipCode || 'Not provided'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Country:</span>
            <span style={styles.value}>{userData.address?.country || 'Not provided'}</span>
          </div>
        </div>

        {/* Emergency Contact */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Emergency Contact</h2>
          <div style={styles.infoRow}>
            <span style={styles.label}>Name:</span>
            <span style={styles.value}>{userData.emergencyContact?.name || 'Not provided'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Relationship:</span>
            <span style={styles.value}>{userData.emergencyContact?.relationship || 'Not provided'}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.label}>Phone:</span>
            <span style={styles.value}>{userData.emergencyContact?.phone || 'Not provided'}</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {userData.performanceMetrics && userData.performanceMetrics.length > 0 && (
        <div style={{...styles.section, marginTop: '1.5rem'}}>
          <h2 style={styles.sectionTitle}>Project History</h2>
          {userData.performanceMetrics.map((metric, index) => (
            <div key={index} style={styles.performanceCard}>
              <div style={styles.infoRow}>
                <span style={styles.label}>Period:</span>
                <span style={styles.value}>{metric.period}</span>
              </div>
              {/* <div style={styles.infoRow}>
                <span style={styles.label}>Rating:</span>
                <span style={styles.value}>{metric.rating}/5 ⭐</span>
              </div> */}
              {/* <div style={styles.infoRow}>
                <span style={styles.label}>Review Date:</span>
                <span style={styles.value}>{formatDate(metric.reviewDate)}</span>
              </div> */}
              
              {/* Goals */}
              {metric.goals && metric.goals.length > 0 && (
                <div style={{marginTop: '1rem'}}>
                  <h4 style={{color: '#2c3e50', marginBottom: '0.5rem'}}>Projects:</h4>
                  {metric.goals.map((goal, goalIndex) => (
                    <div key={goalIndex} style={styles.goalItem}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <strong>{goal.title}</strong>
                        <span style={{...styles.statusBadge, ...getStatusColor(goal.status)}}>
                          {goal.status}
                        </span>
                      </div>
                      <p style={{margin: '0.5rem 0', color: '#7f8c8d'}}>{goal.description}</p>
                      {/* <small style={{color: '#95a5a6'}}>Mode: {goal.mode}</small>
                      {goal.completedAt && (
                        <small style={{color: '#27ae60', display: 'block'}}>
                          Completed: {formatDate(goal.completedAt)}
                        </small>
                      )} */}
                    </div>
                  ))}
                </div>
              )}

              {/* Badges */}
              {metric.badgesEarned && metric.badgesEarned.length > 0 && (
                <div style={{marginTop: '1rem'}}>
                  <h4 style={{color: '#2c3e50', marginBottom: '0.5rem'}}>Badges Earned:</h4>
                  {metric.badgesEarned.map((badge, badgeIndex) => (
                    <span 
                      key={badgeIndex} 
                      style={{
                        ...styles.badge,
                        backgroundColor: getBadgeColor(badge.title)
                      }}
                      title={`${badge.description} - Earned: ${formatDate(badge.dateEarned)}`}
                    >
                      {badge.title} ({badge.type})
                    </span>
                  ))}
                </div>
              )}

              {/* Feedback */}
              {metric.feedback && (
                <div style={{marginTop: '1rem'}}>
                  <h4 style={{color: '#2c3e50', marginBottom: '0.5rem'}}>Feedback:</h4>
                  <p style={{color: '#7f8c8d', fontStyle: 'italic'}}>{metric.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{marginBottom: '1.5rem', color: '#2c3e50'}}>Edit Profile</h2>
            
            {/* Basic Information Form */}
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Name:</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Phone:</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Department:</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Position:</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.position || ''}
                onChange={(e) => handleInputChange('position', e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Experience (years):</label>
              <input
                type="number"
                style={styles.formInput}
                value={editData.experience || 0}
                onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Skills (comma-separated):</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.skills ? editData.skills.join(', ') : ''}
                onChange={(e) => handleSkillsChange(e.target.value)}
              />
            </div>

            {/* Address Information */}
            <h3 style={{color: '#2c3e50', marginTop: '1.5rem', marginBottom: '1rem'}}>Address</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Street:</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.address?.street || ''}
                onChange={(e) => handleInputChange('address', e.target.value, 'street')}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>City:</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.address?.city || ''}
                onChange={(e) => handleInputChange('address', e.target.value, 'city')}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>State:</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.address?.state || ''}
                onChange={(e) => handleInputChange('address', e.target.value, 'state')}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Zip Code:</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.address?.zipCode || ''}
                onChange={(e) => handleInputChange('address', e.target.value, 'zipCode')}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Country:</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.address?.country || ''}
                onChange={(e) => handleInputChange('address', e.target.value, 'country')}
              />
            </div>

            {/* Emergency Contact */}
            <h3 style={{color: '#2c3e50', marginTop: '1.5rem', marginBottom: '1rem'}}>Emergency Contact</h3>
            
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Name:</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.emergencyContact?.name || ''}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value, 'name')}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Relationship:</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.emergencyContact?.relationship || ''}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value, 'relationship')}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Phone:</label>
              <input
                type="text"
                style={styles.formInput}
                value={editData.emergencyContact?.phone || ''}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value, 'phone')}
              />
            </div>

            {/* Form Actions */}
            <div style={styles.formActions}>
              <button 
                style={styles.cancelButton}
                onClick={handleEditToggle}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                style={{
                  ...styles.saveButton,
                  ...(saving ? styles.saveButtonDisabled : {})
                }}
                onClick={handleSaveChanges}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
