//THIS IS A PLACEHOLDER PAGE FOR VOLUNTEER DASHBOARD
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../firebase';

const urgencyMap = {
  '1': { label: 'Low', bg: '#d4edda', color: '#155724' },       // green
  '2': { label: 'Medium', bg: '#fff3cd', color: '#856404' },    // yellow
  '3': { label: 'High', bg: '#f8d7da', color: '#721c24' },       // red
  '4': { label: 'Critical', bg: '#f5c6cb', color: '#721c24' }    // darker red
};

const formatDate = (ts) => {
  if (!ts) return '';
  try {
    // Check if it's a Firestore timestamp object in raw form
    if (ts._seconds) {
      const date = new Date(ts._seconds * 1000); // Convert seconds to ms
      return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
    }

    // Try fallback
    const date = new Date(ts);
    return isNaN(date.getTime()) ? '' : date.toLocaleDateString();
  } catch (err) {
    console.error('❌ Error parsing timestamp:', err);
    return '';
  }
};



function VolunteerDashboard({ user }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [eventHistory, setEventHistory] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNotifications = () => {
    if (user?.uid) {
      return api.get(`/notifications/${user.uid}`)
        .then(res => {
          console.log('📬 Notifications fetched:', res.data.notifications); 
          setNotifications(res.data.notifications);
        })
        .catch(() => setNotifications([]));
    }
  };

  const fetchEventHistory = () => {
    if (user?.uid) {
      return api.get(`/matching/volunteer-history/${user.uid}`)
        .then(res => setEventHistory(res.data.data || []))
        .catch(() => setEventHistory([]));
    }
  };

  useEffect(() => {
    if (user?.uid) {
      fetchNotifications();
      fetchEventHistory();
    }
  }, [user]);

  const handleRefreshNotifications = async () => {
    setIsRefreshing(true);
    try {
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClearNotification = async (notification) => {
    try {
      // Call the backend API to delete the notification from Firestore
      await api.delete(`/notifications/${notification.id}`);
      
      // Remove the notification from the local state
      const updatedNotifications = notifications.filter(notif => notif.id !== notification.id);
      setNotifications(updatedNotifications);
      
      console.log('✅ Notification deleted successfully');
    } catch (error) {
      console.error('Failed to clear notification:', error);
      // Optionally show an error message to the user
    }
  };

  const handleEditProfile = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    // Clear any stored data and redirect to login
    localStorage.clear();
    navigate('/login');
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'assignment':
        return '✅';
      case 'event_update':
        return 'ℹ️';
      case 'event_cancelled':
        return '❌';
      case 'reminder':
        return '⏰';
      case 'removed':
        return '🚫';
      default:
        return '📢';
    }
  };

  // Sort notifications by timestamp descending (most recent first)
  const sortedNotifications = [...notifications].sort((a, b) => {
    const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return tB - tA;
  });

  return (
    <div className="page-wrapper" style={{ 
      background: 'url("/images/background.jpg") no-repeat center center / cover',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      {/* Header with buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2rem 2rem 1rem 2rem',
        borderBottom: '2px solid #f0f0f0',
        background: 'rgba(255,255,255,0.7)',
        borderRadius: '20px',
        maxWidth: '1200px',
        margin: '0 auto 2rem auto',
        boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(6px)'
      }}>
        <div>
          <h1 style={{ 
            textAlign: 'left', 
            color: '#000',
            margin: 0,
            fontSize: '2.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome to Your Dashboard
          </h1>
          <p style={{ 
            textAlign: 'left', 
            color: '#666',
            margin: '0.5rem 0 0 0',
            fontSize: '1.1rem'
          }}>
            You have successfully logged in!
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={handleEditProfile}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#357189',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(53, 113, 137, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(53, 113, 137, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(53, 113, 137, 0.3)';
            }}
          >
            ✏️ Edit Profile
          </button>
          <button 
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', minHeight: '400px', maxWidth: '1200px', margin: '0 auto', marginTop: '2rem' }}>
        {/* Notifications Section */}
        <div style={{ 
          flex: '1 1 0', 
          borderRight: 'none',
          paddingRight: '0',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(10px)',
          padding: '2rem',
          marginRight: '1rem',
          minWidth: '350px',
          maxWidth: '500px',
          flexGrow: 1
        }}>
          <div className="form-group">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem',
              gap: '1rem'
            }}>
              <h2 style={{ 
                fontSize: '1.5rem', 
                color: '#000',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: 0,
                flex: 1
              }}>
                📢 Notifications
              </h2>
              <button 
                onClick={handleRefreshNotifications}
                style={{
                  padding: '0.5rem',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  flexShrink: 0
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(79, 70, 229, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(79, 70, 229, 0.3)';
                }}
                disabled={isRefreshing}
                title="Refresh notifications"
              >
                <span style={{ 
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                  fontSize: '1.2rem'
                }}>
                  🔄
                </span>
              </button>
            </div>
            {sortedNotifications.length === 0 ? (
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                padding: '2rem',
                borderRadius: '15px',
                textAlign: 'center',
                border: '2px dashed #dee2e6'
              }}>
                <p style={{ color: '#666', margin: 0, fontSize: '1.1rem' }}>No notifications at this time.</p>
              </div>
            ) : (
              <div style={{
  maxHeight: '400px', // or adjust as needed
  overflowY: 'auto',
  paddingRight: '0.5rem' // avoids scrollbar overlapping content
}}>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {sortedNotifications.map((notif, idx) => (
                  <li key={idx} style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    borderRadius: '15px',
                    padding: '1.25rem',
                    marginBottom: '1rem',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.08)';
                  }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getNotificationIcon(notif.type)}</span>
                      <div style={{ flex: 1 }}>
                        <span style={{ color: '#000', fontSize: '1rem', lineHeight: '1.4' }}>{notif.message}</span>
                        <div style={{ fontSize: '0.9em', color: '#357189', marginTop: '0.5rem', fontWeight: '500' }}>
                          {formatDate(notif.timestamp)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleClearNotification(notif)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#999',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: '50%',
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          marginLeft: '0.5rem'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = '#f8d7da';
                          e.target.style.color = '#dc3545';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = '#999';
                        }}
                        title="Clear notification"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              </div>
            )}
          </div>
        </div>
        {/* Event History Section */}
        <div style={{ 
          flex: '1 1 0', 
          paddingLeft: '0',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '20px',
          boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(10px)',
          minWidth: '350px',
          maxWidth: '700px',
          flexGrow: 2,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'flex-start',
          alignItems: 'stretch',
          padding: '2rem 1rem',
        }}>
          <div className="form-group" style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ 
              marginBottom: '1.5rem', 
              fontSize: '1.5rem', 
              color: '#000',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📊 Event History
            </h2>
            {eventHistory.length === 0 ? (
              <div style={{
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                padding: '2rem',
                borderRadius: '15px',
                textAlign: 'center',
                border: '2px dashed #dee2e6',
                flex: 1
              }}>
                <p style={{ color: '#666', margin: 0, fontSize: '1.1rem' }}>No event participation history found.</p>
              </div>
            ) : (
              <div style={{ 
                flex: 1,
                overflow: 'auto',
                borderRadius: '15px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
                border: '1px solid #f0f0f0',
                background: '#fff',
                maxWidth: '100%',
                margin: 0,
                boxSizing: 'border-box',
                height: '100%',
                minHeight: 0
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                  fontSize: '0.95rem',
                  color: '#000',
                  background: 'white',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                  minWidth: 0,
                  maxWidth: '100%'
                }}>
                  <thead>
                    <tr style={{ 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', borderTopLeftRadius: '12px' }}>Event</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Location</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Date</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Skills</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', borderTopRightRadius: '12px' }}>Urgency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventHistory.map((event, idx) => (
                      <tr key={idx} style={{ 
                        borderBottom: '1px solid #f0f0f0', 
                        backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa',
                        transition: 'background-color 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.parentElement.style.backgroundColor = '#e6f0ff';
                      }}
                      onMouseOut={(e) => {
                        e.target.parentElement.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#f8f9fa';
                      }}
                      >
                        <td style={{ padding: '0.75rem', color: '#000', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{event.eventName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>{event.eventDescription}</div>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#000', verticalAlign: 'top' }}>
                          <div>{event.address1}</div>
                          {event.address2 && <div>{event.address2}</div>}
                          <div>{event.city}, {event.state} {event.zip}</div>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#000', verticalAlign: 'top' }}>
                          {event.eventDate ? event.eventDate.split('T')[0] : '—'}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#000', verticalAlign: 'top' }}>
                          <span style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            backgroundColor: '#e9ecef',
                            color: '#495057'
                          }}>
                            {event.skills && event.skills.length > 0 ? event.skills.join(', ') : 'N/A'}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#000', verticalAlign: 'top' }}>
                          <span style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            backgroundColor: event.participationStatus === 'Confirmed' ? '#d4edda' : 
                                           event.participationStatus === 'Pending' ? '#fff3cd' : '#d1ecf1',
                            color: event.participationStatus === 'Confirmed' ? '#155724' : 
                                   event.participationStatus === 'Pending' ? '#856404' : '#0c5460'
                          }}>
                            {event.participationStatus}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#000', verticalAlign: 'top' }}>
                          <span style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            backgroundColor: urgencyMap[event.urgency]?.bg || '#e2e3e5',
                            color: urgencyMap[event.urgency]?.color || '#383d41'
                          }}> 
                            {urgencyMap[event.urgency]?.label || '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolunteerDashboard;