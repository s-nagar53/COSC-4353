/*
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
         // { Notifications Section }
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
          { Event History Section }
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
*/
/*function VolunteerDashboard() {
  return (
    <div className="page-wrapper">
      <h1>Welcome to Your Dashboard</h1>
      <p>You have successfully logged in!</p>
    </div>
  );
}

export default VolunteerDashboard;
*/


import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import "./Dashboard.css"; // Optional CSS file

// 🔧 Dummy data functions – replace with real API/Firestore calls later
const fetchNotifications = async () => [
  {
    id: 1,
    message: "🎉 You have been assigned to Beach Cleanup!",
    date: "2025-07-02 09:15",
    type: "assignment",
  },
  {
    id: 2,
    message: "⏰ Reminder: Food Bank Shift starts tomorrow at 08:00 AM.",
    date: "2025-07-01 18:00",
    type: "reminder",
  },
];

const fetchHistory = async () => [
  {
    id: 101,
    eventName: "Beach Cleanup",
    eventDescription:
      "Help keep the shoreline clean by picking up trash and sorting recyclables.",
    location: "Galveston, TX",
    requiredSkills: ["Event Setup / Cleanup"],
    urgency: "Medium",
    eventDate: "2025-06-15",
    status: "Attended",
  },
  {
    id: 102,
    eventName: "Food Bank Shift",
    eventDescription:
      "Pack and distribute food boxes for local families in need.",
    location: "Houston Food Bank, TX",
    requiredSkills: ["Food Preparation / Serving"],
    urgency: "High",
    eventDate: "2025-05-30",
    status: "Missed",
  },
];
const MAX_NOTIFICATIONS = 10;

function VolunteerDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);

  const navigate = useNavigate();
  useEffect(() => {
    (async () => {
      setNotifications(await fetchNotifications());
      setHistory(await fetchHistory());
    })();
  }, []);

  const displayedNotifications = [...notifications]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, MAX_NOTIFICATIONS);
    
  const handleLogout = () => {
      // If you store auth tokens, clear them here
      localStorage.clear();
      navigate("/login");
    };

  return (
    <div className="page-wrapper">
      <div className="top-right-buttons">
  <button className="edit-btn" onClick={() => navigate("/profile")}>
    Edit Profile
  </button>
  <button className="logout-btn" onClick={handleLogout}>
    Logout
  </button>
</div>

<header className="dashboard-header">
      <h1>Volunteer Dashboard</h1>
      <p>Welcome back! Here’s what’s new and your volunteer history.</p>
    </header>

      {/* Notifications Section */}
     <section className="notifications">
  <h2>🔔 Notifications</h2>
  {displayedNotifications.length === 0 ? (
    <p>No new notifications 🎉</p>
  ) : (
    <ul className="notif-list">
      {displayedNotifications.map((n) => (
        <li key={n.id}>
          <p>✔️ {n.message}</p>
          <time>{n.date}</time>
        </li>
      ))}
    </ul>
  )}
</section>

      {/* Volunteer History Section */}
      <section className="history">
        <h2>📋 Volunteer History</h2>
        {history.length === 0 ? (
          <p>You haven’t participated in any events yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Description</th>
                <th>Location</th>
                <th>Skills</th>
                <th>Urgency</th>
                <th>Event Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((e, idx) => (
                <tr key={e.id}>
                  <td>{e.eventName}</td>
                  <td title={e.eventDescription}>
                    {e.eventDescription.length > 50
                      ? e.eventDescription.slice(0, 50) + "..."
                      : e.eventDescription}
                  </td>
                  <td>{e.location}</td>
                  <td>{e.requiredSkills.join(", ")}</td>
                  <td>{e.urgency}</td>
                  <td>{e.eventDate}</td>
                  <td className={`status-${e.status}`}>{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default VolunteerDashboard;