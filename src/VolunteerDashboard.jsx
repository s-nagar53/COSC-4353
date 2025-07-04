//THIS IS A PLACEHOLDER PAGE FOR VOLUNTEER DASHBOARD
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data for notifications and event history
const notifications = [
  { id: 1, message: 'You have been matched to the "Community Cleanup" event!', date: '2023-11-10', type: 'success' },
  { id: 2, message: 'Event "Food Drive" has been updated.', date: '2023-11-08', type: 'info' },
];

const eventHistory = [
  { 
    eventName: 'Community Cleanup', 
    eventDescription: 'Help clean up the local park and surrounding areas',
    address1: '123 Main St',
    address2: '',
    city: 'Houston',
    state: 'TX',
    zip: '77001',
    skills: ['Event Setup / Cleanup', 'Physical Labor'],
    urgency: 'Medium',
    availabilityDates: ['2023-11-15', '2023-11-16'],
    participationStatus: 'Confirmed',
    role: 'Volunteer',
    eventDate: '2023-11-15'
  },
  { 
    eventName: 'Food Drive', 
    eventDescription: 'Collect and distribute food to local families in need',
    address1: '456 Oak Ave',
    address2: 'Suite 100',
    city: 'Houston',
    state: 'TX',
    zip: '77002',
    skills: ['Driving / Transportation', 'Food Preparation / Serving'],
    urgency: 'High',
    availabilityDates: ['2023-11-20', '2023-11-21'],
    participationStatus: 'Pending',
    role: 'Driver',
    eventDate: '2023-11-20'
  },
  { 
    eventName: 'Youth Mentorship', 
    eventDescription: 'Mentor local youth in various skills and activities',
    address1: '789 Pine St',
    address2: '',
    city: 'Houston',
    state: 'TX',
    zip: '77003',
    skills: ['Teaching / Tutoring', 'Childcare / Youth Engagement'],
    urgency: 'Low',
    availabilityDates: ['2023-11-25'],
    participationStatus: 'Completed',
    role: 'Mentor',
    eventDate: '2023-11-25'
  }
];

function VolunteerDashboard() {
  const navigate = useNavigate();

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
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <div className="page-wrapper" style={{ 
      background: 'url("/images/background.jpg") no-repeat center center / cover',
      minHeight: '100vh',
      padding: '2rem'
    }}>
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
            <h2 style={{ 
              marginBottom: '1.5rem', 
              fontSize: '1.5rem', 
              color: '#000',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📢 Notifications
            </h2>
            {notifications.length === 0 ? (
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
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {notifications.map((notif) => (
                  <li key={notif.id} style={{
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
                          {new Date(notif.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
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
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600' }}>Role</th>
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
                          {new Date(event.eventDate).toLocaleDateString()}
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
                            {event.role}
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
                            backgroundColor: event.urgency === 'High' ? '#f8d7da' : 
                                           event.urgency === 'Medium' ? '#fff3cd' : '#d4edda',
                            color: event.urgency === 'High' ? '#721c24' : 
                                   event.urgency === 'Medium' ? '#856404' : '#155724'
                          }}>
                            {event.urgency}
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