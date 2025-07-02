//THIS IS A PLACEHOLDER PAGE FOR ADMIN DASHBOARD
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import './Profile.css';

function AdminDashboard() {
  const navigate = useNavigate();

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
          <button type="button" onClick={handleEditProfile} style={{ marginTop: '1rem' }}>
            Edit Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;