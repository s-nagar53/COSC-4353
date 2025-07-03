//THIS IS A PLACEHOLDER PAGE FOR VOLUNTEER DASHBOARD
import React, { useState } from 'react';

// Mock data for notifications and event history
const notifications = [
  { id: 1, message: 'You have been matched to the "Community Cleanup" event!', date: '2023-11-10' },
  { id: 2, message: 'Event "Food Drive" has been updated.', date: '2023-11-08' },
];

const eventHistory = [
  { eventName: 'Community Cleanup', date: '2023-11-15', role: 'Volunteer' },
  { eventName: 'Food Drive', date: '2023-11-20', role: 'Driver' },
];

function VolunteerDashboard() {
  return (
    <div className="page-wrapper">
      <div className="profile-container" style={{ maxWidth: '900px', width: '100%' }}>
        <h1 style={{ textAlign: 'center' }}>Welcome to Your Dashboard</h1>
        <p style={{ textAlign: 'center' }}>You have successfully logged in!</p>
        <div style={{ display: 'flex', gap: '2rem', minHeight: '300px', marginTop: '2.5rem' }}>
          {/* Notifications Section */}
          <div style={{ flex: '1 1 0', borderRight: '1px solid #eee', paddingRight: '1.5rem' }}>
            <div className="form-group">
              <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Notifications</h2>
              {notifications.length === 0 ? (
                <p style={{ color: '#888' }}>No notifications at this time.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {notifications.map((notif) => (
                    <li key={notif.id} style={{
                      background: '#f0f0f0',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      marginBottom: '0.5rem',
                    }}>
                      <span>{notif.message}</span>
                      <div style={{ fontSize: '0.95em', color: '#357189', marginTop: '0.25rem' }}>{new Date(notif.date).toLocaleDateString()}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Event History Section */}
          <div style={{ flex: '1 1 0', paddingLeft: '1.5rem' }}>
            <div className="form-group">
              <h2 style={{ marginBottom: '1rem', fontSize: '1.3rem' }}>Event History</h2>
              {eventHistory.length === 0 ? (
                <p style={{ color: '#888' }}>No event participation history found.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {eventHistory.map((event, idx) => (
                    <li key={idx} style={{
                      background: '#f0f0f0',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      marginBottom: '0.5rem',
                    }}>
                      <strong>{event.eventName}</strong> <span style={{ color: '#357189', marginLeft: '0.5rem' }}>{new Date(event.date).toLocaleDateString()}</span>
                      <div style={{ fontSize: '0.95em', color: '#555' }}>Role: {event.role}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolunteerDashboard;