//THIS IS A PLACEHOLDER PAGE FOR ADMIN DASHBOARD
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './Profile.css';
import { getAuth, signOut } from 'firebase/auth';
import api from '../firebase';


function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (user?.uid) {
      api.get(`/notifications/${user.uid}`)
        .then(res => setNotifications(res.data.notifications))
        .catch(() => setNotifications([]));
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // This won't be called since buttons are type="button"
  };

  const handleManageEvents = () => {
    navigate('/manage-event');
  };

  const handleCreateEvent = () => {
    navigate('/create-event');
  };

  const handleVolunteerMatching = (e) => {
    navigate('/volunteer-matching');
  };

  const handleEditProfile = (e) => {
    navigate('/admin-profile');
  };

  const handleNotifications = () => {
    navigate('/notification');
  };

  const handleHistory = () => {
    navigate('/volunteer-history');
  };

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        navigate('/login');
      })
      .catch((error) => {
        console.error('Logout failed:', error);
        alert('Something went wrong while logging out.');
      });
  };

  return (
    <div className="page-wrapper profile-scroll">
      <div className="profile-container">
        <form onSubmit={handleSubmit}>
          <h1>Welcome to the Admin Dashboard </h1>
          <h2>You have successfully logged in!</h2>
          <button type="button" onClick={handleManageEvents} style={{ marginTop: '1rem' }}>
            Manage Event
          </button>
          <button type="button" onClick={handleCreateEvent} style={{ marginTop: '1rem' }}>
            Create Event
          </button>
          <button type="button" onClick={handleVolunteerMatching} style={{ marginTop: '1rem' }}>
            Volunteer Matching
          </button>
          <button type="button" onClick={handleHistory} style={{ marginTop: '1rem' }}>
            Volunteer and Event History
          </button>
          <button type="button" onClick={handleEditProfile} style={{ marginTop: '1rem' }}>
            Edit Profile
          </button>
          <button type="button" onClick={handleNotifications} style={{ marginTop: '1rem' }}>
            View Notifications
          </button>
          <button type="button" onClick={handleLogout} style={{ marginTop: '1rem', backgroundColor: '#d9534f', color: 'white' }}>
            Logout
          </button>
        </form>
        <h2>Notifications</h2>
        <ul>
          {notifications.length === 0 && <li>No notifications</li>}
          {notifications.map((n, i) => (
            <li key={i} style={{ fontWeight: n.read ? 'normal' : 'bold' }}>
              [{n.type}] {n.message} <br />
              <small>{n.timestamp}</small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminDashboard;