//THIS IS A PLACEHOLDER PAGE FOR VOLUNTEER DASHBOARD
function VolunteerDashboard() {
  const handleNotifications = () => {
    // Placeholder for notifications navigation
    alert('Notifications page coming soon!');
  };

  const handleEventHistory = () => {
    // Placeholder for event history navigation
    alert('Event History page coming soon!');
  };

  return (
    <div className="page-wrapper">
      <div className="profile-container">
        <h1>Welcome to Your Dashboard</h1>
        <p>You have successfully logged in!</p>
        <button type="button" onClick={handleNotifications} style={{ marginTop: '1rem' }}>
          Notifications
        </button>
        <button type="button" onClick={handleEventHistory} style={{ marginTop: '1rem' }}>
          Event History
        </button>
      </div>
    </div>
  );
}

export default VolunteerDashboard;