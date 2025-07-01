//THIS IS A PLACEHOLDER PAGE FOR ADMIN DASHBOARD
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import './Profile.css';

function AdminDashboard() 
{
  const navigate = useNavigate();

  // Since this is just navigation, we don't need validation
  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/event-management');
  };

  return (
    <div className="page-wrapper profile-scroll">
      <div className="profile-container">
        <form onSubmit={handleSubmit}>
          <h1>Welcome to Your Dashboard ADMIN</h1>
          <h2>You have successfully logged in!</h2>
          <button type="submit" style={{ marginTop: '1rem' }}>
            Event Management
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;