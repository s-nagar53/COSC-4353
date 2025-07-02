// //THIS IS A PLACEHOLDER PAGE FOR ADMIN DASHBOARD
import { useNavigate } from 'react-router-dom';
import React from 'react';
import './Profile.css';

function AdminDashboard() {
  const navigate = useNavigate();

  const handleEventManagement = (e) => {
    e.preventDefault();
    navigate('/event-management');
  };

  const handleVolunteerMatching = (e) => {
    e.preventDefault();
    navigate('/volunteer-matching');
  };

  return (
    <div className="page-wrapper profile-scroll">
      <div className="profile-container">
        <form>
          <h1>Welcome to Your Dashboard ADMIN</h1>
          <h2>You have successfully logged in!</h2>
          <button 
            type="button" 
            onClick={handleEventManagement} 
            style={{ marginTop: '1rem', marginRight: '1rem' }}
          >
            Event Management
          </button>
          <button 
            type="button" 
            onClick={handleVolunteerMatching} 
            style={{ marginTop: '1rem' }}
          >
            Volunteer Matching
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminDashboard;