// perf.js
import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Perf = () => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const userId = localStorage.getItem('id');
      
      if (!userId || userId === 'null' || userId === 'undefined') {
        setError('User not logged in. Please log in to view performance data.');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:4000/api/user/getUserPerf/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      setPerformanceData(data.performanceMetrics || []);
      setLoading(false);
    } catch (err) {
      setError(`Failed to load performance data: ${err.message}`);
      setLoading(false);
    }
  };

  // Badge difficulty mapping
  const badgeDifficultyMap = {
    'Green': { difficulty: 'Beginner', color: '#27ae60', points: 10 },
    'Cyan': { difficulty: 'Intermediate', color: '#17a2b8', points: 20 },
    'Blue': { difficulty: 'Advanced', color: '#007bff', points: 30 },
    'Purple': { difficulty: 'Expert', color: '#6f42c1', points: 40 },
    'Red': { difficulty: 'Master', color: '#dc3545', points: 50 }
  };

  // Separate data processing for courses and projects
  const processSeparatedData = (metrics) => {
    const courseData = { Green: 0, Cyan: 0, Blue: 0, Purple: 0, Red: 0 };
    const projectData = { Green: 0, Cyan: 0, Blue: 0, Purple: 0, Red: 0 };
    
    let courseStats = {
      totalPoints: 0,
      totalBadges: 0,
      goals: { total: 0, completed: 0, inProgress: 0, pending: 0 },
      timeBasedData: {},
      recentBadges: []
    };
    
    let projectStats = {
      totalPoints: 0,
      totalBadges: 0,
      goals: { total: 0, completed: 0, inProgress: 0, pending: 0 },
      timeBasedData: {},
      recentBadges: []
    };
    
    let ratingTrend = [];

    metrics.forEach(metric => {
      if (selectedPeriod === 'all' || metric.period === selectedPeriod) {
        // Process badges separately
        metric.badgesEarned?.forEach(badge => {
          const badgeInfo = {
            ...badge,
            period: metric.period,
            points: badgeDifficultyMap[badge.title]?.points || 0
          };
          
          const month = new Date(badge.dateEarned).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });

          if (badge.type === 'course') {
            courseData[badge.title]++;
            courseStats.totalPoints += badgeDifficultyMap[badge.title]?.points || 0;
            courseStats.totalBadges++;
            courseStats.recentBadges.push(badgeInfo);
            
            if (!courseStats.timeBasedData[month]) {
              courseStats.timeBasedData[month] = { badges: 0, points: 0 };
            }
            courseStats.timeBasedData[month].badges++;
            courseStats.timeBasedData[month].points += badgeDifficultyMap[badge.title]?.points || 0;
          } else if (badge.type === 'project') {
            projectData[badge.title]++;
            projectStats.totalPoints += badgeDifficultyMap[badge.title]?.points || 0;
            projectStats.totalBadges++;
            projectStats.recentBadges.push(badgeInfo);
            
            if (!projectStats.timeBasedData[month]) {
              projectStats.timeBasedData[month] = { badges: 0, points: 0 };
            }
            projectStats.timeBasedData[month].badges++;
            projectStats.timeBasedData[month].points += badgeDifficultyMap[badge.title]?.points || 0;
          }
        });

        // Process goals separately
        metric.goals?.forEach(goal => {
          if (goal.mode === 'Training') {
            courseStats.goals.total++;
            if (goal.status === 'completed') courseStats.goals.completed++;
            else if (goal.status === 'in-progress') courseStats.goals.inProgress++;
            else courseStats.goals.pending++;
          } else if (goal.mode === 'Project') {
            projectStats.goals.total++;
            if (goal.status === 'completed') projectStats.goals.completed++;
            else if (goal.status === 'in-progress') projectStats.goals.inProgress++;
            else projectStats.goals.pending++;
          }
        });

        // Rating trend (common)
        ratingTrend.push({
          period: metric.period,
          rating: metric.rating || 0,
          date: metric.reviewDate || new Date()
        });
      }
    });

    // Sort recent badges
    courseStats.recentBadges.sort((a, b) => new Date(b.dateEarned) - new Date(a.dateEarned));
    projectStats.recentBadges.sort((a, b) => new Date(b.dateEarned) - new Date(a.dateEarned));
    ratingTrend.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate completion rates
    courseStats.completionRate = courseStats.goals.total > 0 ? 
      ((courseStats.goals.completed / courseStats.goals.total) * 100).toFixed(1) : 0;
    projectStats.completionRate = projectStats.goals.total > 0 ? 
      ((projectStats.goals.completed / projectStats.goals.total) * 100).toFixed(1) : 0;

    return {
      courseData,
      projectData,
      courseStats,
      projectStats,
      ratingTrend
    };
  };

  // Create charts for specific type (course or project)
  const createTypeSpecificChart = (data, type) => ({
    labels: Object.keys(data).map(label => badgeDifficultyMap[label]?.difficulty || label),
    datasets: [{
      label: `${type} Badges Earned`,
      data: Object.values(data),
      backgroundColor: Object.keys(data).map(label => badgeDifficultyMap[label]?.color || '#gray'),
      borderRadius: 8,
    }]
  });

  // Create time-based chart for specific type
  const createTypeTimeChart = (timeBasedData, type) => {
    const sortedMonths = Object.keys(timeBasedData).sort((a, b) => new Date(a) - new Date(b));
    
    return {
      labels: sortedMonths,
      datasets: [
        {
          label: `${type} Badges`,
          data: sortedMonths.map(month => timeBasedData[month].badges),
          borderColor: type === 'Course' ? '#3498db' : '#e74c3c',
          backgroundColor: type === 'Course' ? 'rgba(52, 152, 219, 0.1)' : 'rgba(231, 76, 60, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        },
        {
          label: `${type} Points`,
          data: sortedMonths.map(month => timeBasedData[month].points),
          borderColor: type === 'Course' ? '#2980b9' : '#c0392b',
          backgroundColor: type === 'Course' ? 'rgba(41, 128, 185, 0.1)' : 'rgba(192, 57, 43, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };
  };

  // Goal completion chart for specific type
  const createTypeGoalChart = (goalStats, type) => ({
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      data: [goalStats.completed, goalStats.inProgress, goalStats.pending],
      backgroundColor: type === 'Course' ? 
        ['#27ae60', '#f39c12', '#e74c3c'] : 
        ['#2ecc71', '#e67e22', '#e74c3c'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  });

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }},
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }}}
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true }},
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'top' }},
    scales: {
      x: { display: true, title: { display: true, text: 'Month' }},
      y: { type: 'linear', display: true, position: 'left', title: { display: true, text: 'Badges' }},
      y1: { type: 'linear', display: true, position: 'right', title: { display: true, text: 'Points' }, grid: { drawOnChartArea: false }}
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <h3>Error Loading Performance Data</h3>
        <p>{error}</p>
        <button onClick={fetchPerformanceData} style={styles.retryButton}>Retry</button>
      </div>
    );
  }

  if (!performanceData || performanceData.length === 0) {
    return (
      <div style={styles.noDataContainer}>
        <h3>No Performance Data Available</h3>
        <p>Complete some courses or projects to see your performance metrics.</p>
      </div>
    );
  }

  const processedData = processSeparatedData(performanceData);
  const periods = [...new Set(performanceData.map(metric => metric.period))];

  return (
    <div style={styles.perfContainer}>
      {/* Header with Navigation */}
      <div style={styles.header}>
        <h2 style={styles.title}>Performance Analytics</h2>
        <div style={styles.headerControls}>
          <div style={styles.viewSelector}>
            <button 
              onClick={() => setSelectedView('overview')}
              style={{
                ...styles.viewButton,
                ...(selectedView === 'overview' ? styles.viewButtonActive : {})
              }}
            >
              Overview
            </button>
            <button 
              onClick={() => setSelectedView('courses')}
              style={{
                ...styles.viewButton,
                ...(selectedView === 'courses' ? styles.viewButtonActive : {})
              }}
            >
              Courses Analytics
            </button>
            <button 
              onClick={() => setSelectedView('projects')}
              style={{
                ...styles.viewButton,
                ...(selectedView === 'projects' ? styles.viewButtonActive : {})
              }}
            >
              Projects Analytics
            </button>
            <button 
              onClick={() => setSelectedView('comparison')}
              style={{
                ...styles.viewButton,
                ...(selectedView === 'comparison' ? styles.viewButtonActive : {})
              }}
            >
              Comparison
            </button>
          </div>
          <div style={styles.periodSelector}>
            <label htmlFor="period-select" style={styles.label}>Period: </label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={styles.select}
            >
              <option value="all">All Periods</option>
              {periods.map(period => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Summary Cards */}
      {selectedView === 'overview' && (
        <>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Course Points</h3>
              <p style={styles.summaryValue}>{processedData.courseStats.totalPoints}</p>
              <span style={styles.summarySubtext}>{processedData.courseStats.totalBadges} badges earned</span>
            </div>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Project Points</h3>
              <p style={styles.summaryValue}>{processedData.projectStats.totalPoints}</p>
              <span style={styles.summarySubtext}>{processedData.projectStats.totalBadges} badges earned</span>
            </div>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Course Completion</h3>
              <p style={styles.summaryValue}>{processedData.courseStats.completionRate}%</p>
              <span style={styles.summarySubtext}>{processedData.courseStats.goals.completed} of {processedData.courseStats.goals.total} goals</span>
            </div>
            <div style={styles.summaryCard}>
              <h3 style={styles.summaryTitle}>Project Completion</h3>
              <p style={styles.summaryValue}>{processedData.projectStats.completionRate}%</p>
              <span style={styles.summarySubtext}>{processedData.projectStats.goals.completed} of {processedData.projectStats.goals.total} goals</span>
            </div>
          </div>

          <div style={styles.chartsGrid}>
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Course Badges Overview</h3>
              <div style={styles.chartWrapper}>
                <Bar
                  data={createTypeSpecificChart(processedData.courseData, 'Course')}
                  options={chartOptions}
                />
              </div>
            </div>
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Project Badges Overview</h3>
              <div style={styles.chartWrapper}>
                <Bar
                  data={createTypeSpecificChart(processedData.projectData, 'Project')}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Courses Analytics */}
      {selectedView === 'courses' && (
        <>
          <div style={styles.typeHeader}>
            <h3 style={styles.typeTitle}>📚 Courses Performance Analytics</h3>
            <div style={styles.typeStats}>
              <span>Total Points: <strong>{processedData.courseStats.totalPoints}</strong></span>
              <span>Total Badges: <strong>{processedData.courseStats.totalBadges}</strong></span>
              <span>Completion Rate: <strong>{processedData.courseStats.completionRate}%</strong></span>
            </div>
          </div>

          <div style={styles.chartsGrid}>
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Course Badges by Difficulty</h3>
              <div style={styles.chartWrapper}>
                <Bar
                  data={createTypeSpecificChart(processedData.courseData, 'Course')}
                  options={chartOptions}
                />
              </div>
            </div>
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Course Goal Status</h3>
              <div style={styles.chartWrapper}>
                <Doughnut
                  data={createTypeGoalChart(processedData.courseStats.goals, 'Course')}
                  options={doughnutOptions}
                />
              </div>
            </div>
          </div>

          <div style={styles.fullWidthChart}>
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Course Progress Over Time</h3>
              <div style={styles.chartWrapper}>
                <Line
                  data={createTypeTimeChart(processedData.courseStats.timeBasedData, 'Course')}
                  options={lineChartOptions}
                />
              </div>
            </div>
          </div>

          <div style={styles.recentBadgesSection}>
            <h3 style={styles.sectionTitle}>Recent Course Achievements</h3>
            <div style={styles.badgesGrid}>
              {processedData.courseStats.recentBadges.slice(0, 5).map((badge, index) => (
                <div key={index} style={styles.badgeCard}>
                  <div 
                    style={{
                      ...styles.badgeIcon,
                      backgroundColor: badgeDifficultyMap[badge.title]?.color || '#gray'
                    }}
                  >
                    {badge.title}
                  </div>
                  <div style={styles.badgeInfo}>
                    <h4 style={styles.badgeTitle}>COURSE</h4>
                    <p style={styles.badgeDescription}>{badge.description}</p>
                    <span style={styles.badgeDate}>
                      {new Date(badge.dateEarned).toLocaleDateString()}
                    </span>
                    <span style={styles.badgePoints}>
                      +{badgeDifficultyMap[badge.title]?.points || 0} points
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Projects Analytics */}
      {selectedView === 'projects' && (
        <>
          <div style={styles.typeHeader}>
            <h3 style={styles.typeTitle}>🚀 Projects Performance Analytics</h3>
            <div style={styles.typeStats}>
              <span>Total Points: <strong>{processedData.projectStats.totalPoints}</strong></span>
              <span>Total Badges: <strong>{processedData.projectStats.totalBadges}</strong></span>
              <span>Completion Rate: <strong>{processedData.projectStats.completionRate}%</strong></span>
            </div>
          </div>

          <div style={styles.chartsGrid}>
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Project Badges by Difficulty</h3>
              <div style={styles.chartWrapper}>
                <Bar
                  data={createTypeSpecificChart(processedData.projectData, 'Project')}
                  options={chartOptions}
                />
              </div>
            </div>
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Project Goal Status</h3>
              <div style={styles.chartWrapper}>
                <Doughnut
                  data={createTypeGoalChart(processedData.projectStats.goals, 'Project')}
                  options={doughnutOptions}
                />
              </div>
            </div>
          </div>

          <div style={styles.fullWidthChart}>
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Project Progress Over Time</h3>
              <div style={styles.chartWrapper}>
                <Line
                  data={createTypeTimeChart(processedData.projectStats.timeBasedData, 'Project')}
                  options={lineChartOptions}
                />
              </div>
            </div>
          </div>

          <div style={styles.recentBadgesSection}>
            <h3 style={styles.sectionTitle}>Recent Project Achievements</h3>
            <div style={styles.badgesGrid}>
              {processedData.projectStats.recentBadges.slice(0, 5).map((badge, index) => (
                <div key={index} style={styles.badgeCard}>
                  <div 
                    style={{
                      ...styles.badgeIcon,
                      backgroundColor: badgeDifficultyMap[badge.title]?.color || '#gray'
                    }}
                  >
                    {badge.title}
                  </div>
                  <div style={styles.badgeInfo}>
                    <h4 style={styles.badgeTitle}>PROJECT</h4>
                    <p style={styles.badgeDescription}>{badge.description}</p>
                    <span style={styles.badgeDate}>
                      {new Date(badge.dateEarned).toLocaleDateString()}
                    </span>
                    <span style={styles.badgePoints}>
                      +{badgeDifficultyMap[badge.title]?.points || 0} points
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Comparison View */}
      {selectedView === 'comparison' && (
        <>
          <div style={styles.comparisonHeader}>
            <h3 style={styles.typeTitle}>⚖️ Courses vs Projects Comparison</h3>
          </div>

          <div style={styles.comparisonGrid}>
            <div style={styles.comparisonCard}>
              <h4 style={styles.comparisonTitle}>📚 Courses</h4>
              <div style={styles.comparisonStats}>
                <div style={styles.comparisonStat}>
                  <span style={styles.comparisonLabel}>Total Points</span>
                  <span style={styles.comparisonValue}>{processedData.courseStats.totalPoints}</span>
                </div>
                <div style={styles.comparisonStat}>
                  <span style={styles.comparisonLabel}>Total Badges</span>
                  <span style={styles.comparisonValue}>{processedData.courseStats.totalBadges}</span>
                </div>
                <div style={styles.comparisonStat}>
                  <span style={styles.comparisonLabel}>Completion Rate</span>
                  <span style={styles.comparisonValue}>{processedData.courseStats.completionRate}%</span>
                </div>
                <div style={styles.comparisonStat}>
                  <span style={styles.comparisonLabel}>Active Goals</span>
                  <span style={styles.comparisonValue}>{processedData.courseStats.goals.inProgress}</span>
                </div>
              </div>
            </div>

            <div style={styles.comparisonCard}>
              <h4 style={styles.comparisonTitle}>🚀 Projects</h4>
              <div style={styles.comparisonStats}>
                <div style={styles.comparisonStat}>
                  <span style={styles.comparisonLabel}>Total Points</span>
                  <span style={styles.comparisonValue}>{processedData.projectStats.totalPoints}</span>
                </div>
                <div style={styles.comparisonStat}>
                  <span style={styles.comparisonLabel}>Total Badges</span>
                  <span style={styles.comparisonValue}>{processedData.projectStats.totalBadges}</span>
                </div>
                <div style={styles.comparisonStat}>
                  <span style={styles.comparisonLabel}>Completion Rate</span>
                  <span style={styles.comparisonValue}>{processedData.projectStats.completionRate}%</span>
                </div>
                <div style={styles.comparisonStat}>
                  <span style={styles.comparisonLabel}>Active Goals</span>
                  <span style={styles.comparisonValue}>{processedData.projectStats.goals.inProgress}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.chartsGrid}>
            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Badge Distribution Comparison</h3>
              <div style={styles.chartWrapper}>
                <Bar
                  data={{
                    labels: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'],
                    datasets: [
                      {
                        label: 'Course Badges',
                        data: Object.values(processedData.courseData),
                        backgroundColor: 'rgba(52, 152, 219, 0.8)',
                        borderColor: '#3498db',
                        borderWidth: 1
                      },
                      {
                        label: 'Project Badges',
                        data: Object.values(processedData.projectData),
                        backgroundColor: 'rgba(231, 76, 60, 0.8)',
                        borderColor: '#e74c3c',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: true, position: 'top' }},
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }}}
                  }}
                />
              </div>
            </div>

            <div style={styles.chartContainer}>
              <h3 style={styles.chartTitle}>Points Distribution</h3>
              <div style={styles.chartWrapper}>
                <Doughnut
                  data={{
                    labels: ['Course Points', 'Project Points'],
                    datasets: [{
                      data: [processedData.courseStats.totalPoints, processedData.projectStats.totalPoints],
                      backgroundColor: ['#3498db', '#e74c3c'],
                      borderWidth: 2,
                      borderColor: '#fff'
                    }]
                  }}
                  options={doughnutOptions}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Difficulty Legend */}
      <div style={styles.legendSection}>
        <h4 style={styles.legendTitle}>Difficulty Levels</h4>
        <div style={styles.legendGrid}>
          {Object.entries(badgeDifficultyMap).map(([badge, info]) => (
            <div key={badge} style={styles.legendItem}>
              <div 
                style={{
                  ...styles.legendColor,
                  backgroundColor: info.color
                }}
              ></div>
              <span style={styles.legendText}>
                {info.difficulty} ({info.points} pts)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Styles with new sections
const styles = {
  perfContainer: {
    padding: '0',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh'
  },
  
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  
  title: {
    color: '#2c3e50',
    margin: 0,
    fontSize: '2rem',
    fontWeight: 'bold'
  },
  
  headerControls: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  
  viewSelector: {
    display: 'flex',
    backgroundColor: '#ecf0f1',
    borderRadius: '8px',
    padding: '4px'
  },
  
  viewButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#7f8c8d',
    transition: 'all 0.3s ease'
  },
  
  viewButtonActive: {
    backgroundColor: '#3498db',
    color: 'white',
    boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)'
  },
  
  periodSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  
  label: {
    color: '#7f8c8d',
    fontWeight: '500'
  },
  
  select: {
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    backgroundColor: 'white'
  },
  
  typeHeader: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  },
  
  typeTitle: {
    color: '#2c3e50',
    margin: '0 0 1rem 0',
    fontSize: '1.5rem',
    fontWeight: '600'
  },
  
  typeStats: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  
  comparisonHeader: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  
  comparisonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem'
  },
  
  comparisonCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  
  comparisonTitle: {
    color: '#2c3e50',
    margin: '0 0 1rem 0',
    fontSize: '1.2rem',
    fontWeight: '600',
    textAlign: 'center'
  },
  
  comparisonStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem'
  },
  
  comparisonStat: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #ecf0f1'
  },
  
  comparisonLabel: {
    color: '#7f8c8d',
    fontSize: '0.9rem'
  },
  
  comparisonValue: {
    color: '#2c3e50',
    fontSize: '1.1rem',
    fontWeight: '600'
  },
  
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  
  summaryCard: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
    cursor: 'pointer'
  },
  
  summaryTitle: {
    color: '#7f8c8d',
    fontSize: '0.9rem',
    fontWeight: '500',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  
  summaryValue: {
    color: '#2c3e50',
    fontSize: '2.5rem',
    fontWeight: 'bold',
    margin: '0 0 0.25rem 0'
  },
  
  summarySubtext: {
    color: '#95a5a6',
    fontSize: '0.8rem'
  },
  
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem'
  },
  
  fullWidthChart: {
    marginBottom: '2rem'
  },
  
  chartContainer: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  
  chartTitle: {
    color: '#2c3e50',
    marginBottom: '1rem',
    fontSize: '1.2rem',
    fontWeight: '600'
  },
  
  chartWrapper: {
    height: '300px',
    position: 'relative'
  },
  
  recentBadgesSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  },
  
  sectionTitle: {
    color: '#2c3e50',
    marginBottom: '1rem',
    fontSize: '1.3rem',
    fontWeight: '600'
  },
  
  badgesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem'
  },
  
  badgeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e9ecef'
  },
  
  badgeIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    flexShrink: 0
  },
  
  badgeInfo: {
    flex: 1
  },
  
  badgeTitle: {
    margin: '0 0 0.25rem 0',
    color: '#2c3e50',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  
  badgeDescription: {
    margin: '0 0 0.5rem 0',
    color: '#7f8c8d',
    fontSize: '0.8rem',
    lineHeight: '1.4'
  },
  
  badgeDate: {
    color: '#95a5a6',
    fontSize: '0.75rem',
    marginRight: '1rem'
  },
  
  badgePoints: {
    color: '#27ae60',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  
  legendSection: {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  
  legendTitle: {
    color: '#2c3e50',
    marginBottom: '1rem',
    fontSize: '1.1rem',
    fontWeight: '600'
  },
  
  legendGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.75rem'
  },
  
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  
  legendColor: {
    width: '16px',
    height: '16px',
    borderRadius: '3px'
  },
  
  legendText: {
    color: '#7f8c8d',
    fontSize: '0.9rem'
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    color: '#7f8c8d'
  },
  
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  
  errorContainer: {
    textAlign: 'center',
    padding: '2rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  
  retryButton: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem'
  },
  
  noDataContainer: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    color: '#7f8c8d'
  }
};

export default Perf;