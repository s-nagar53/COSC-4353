import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './Profile.css';

// Helper function to get all events
const getEvents = () => {
  return JSON.parse(localStorage.getItem('events') || '[]');
};

// Helper function to get a single event by ID
const getEventById = (id) => {
  const events = getEvents();
  return events.find(event => event.id === id);
};

// Component to display list of events
export function ManageEvent() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setEvents(getEvents());
  }, []);

  const handleViewEvent = (eventId) => {
    navigate(`/view-event/${eventId}`);
  };

  const handleDeleteEvent = (eventId) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    localStorage.setItem('events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  if (events.length === 0) {
    return (
      <div className="page-wrapper profile-scroll">
        <div className="profile-container">
          <div style={{ textAlign: 'center' }}>
            <h2>No Events Found</h2>
            <p>Create your first event to get started!</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <button 
                onClick={() => navigate('/admin-dashboard')}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
              <button 
                onClick={() => navigate('/create-event')}
                style={{ 
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#357189',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Create New Event
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper profile-scroll">
      <div className="profile-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/admin-dashboard')}
              style={{ 
                padding: '0.5rem 1rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to Dashboard
            </button>
            <h2>Manage Events ({events.length})</h2>
          </div>
          <button 
            onClick={() => navigate('/create-event')}
            style={{ 
              padding: '0.75rem 1.5rem',
              backgroundColor: '#357189',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Create New Event
          </button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
      {events.map((event) => (
        <div key={event.id} style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          background: '#133644', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem', position: 'relative' }}>
            <h3 style={{ color: 'white', margin: 0, textAlign: 'center' }}>{event.eventName}</h3>
            <span style={{ 
              position: 'absolute',
              right: 0,
              padding: '0.25rem 0.75rem', 
              borderRadius: '12px', 
              fontSize: '0.75rem', 
              fontWeight: 'bold',
              backgroundColor: event.urgency === '1' ? '#d4edda' : 
                            event.urgency === '2' ? '#fff3cd' : 
                            event.urgency === '3' ? '#f8d7da' : '#f5c6cb',
              color: event.urgency === '1' ? '#155724' : 
                    event.urgency === '2' ? '#856404' : '#721c24'
            }}>
              {event.urgencyLevel || getUrgencyName(event.urgency)}
            </span>
          </div>
          
          {event.eventDescription && (
            <p style={{ color: 'white', marginBottom: '1rem', fontSize: '0.9rem' }}>
              {event.eventDescription.length > 100 
                ? `${event.eventDescription.substring(0, 100)}...` 
                : event.eventDescription}
            </p>
          )}
          
          <div style={{ fontSize: '0.9rem', color: 'white' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>Location:</strong> {event.address1} {event.address2}, {event.city}, {event.stateName || getStateName(event.state)} {event.zip}
            </div>
            
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>Skills Needed:</strong>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                {event.skills && event.skills.slice(0, 3).map((skill, index) => (
                  <span key={index} style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: 'white'
                  }}>
                    {skill}
                  </span>
                ))}
                {event.skills && event.skills.length > 3 && (
                  <span style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '4px', 
                    fontSize: '0.75rem',
                    color: 'white'
                  }}>
                    +{event.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>
            
            <div style={{ marginBottom: '0.75rem' }}>
            <strong>Available Dates</strong>
            <div>
              {event.availabilityDates?.map((dateObj, index) => (
                <div key={index}>
                  {dateObj.formatted}
                </div>
              )) || event.availability?.map((date, index) => (
                <div key={index}>
                  {new Date(date).toLocaleDateString()}
                </div>
              )) || <p>No dates specified</p>}
            </div>
          </div>
            
            <div>
              <small>Created: {event.createdAt ? new Date(event.createdAt).toLocaleDateString() : 'Unknown'}</small>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            marginTop: '1rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid rgba(255,255,255,0.2)' 
          }}>
            <button 
              onClick={() => navigate(`/edit-event/${event.id}`)}
              style={{ 
                background: '#357189', 
                color: 'white', 
                border: 'none', 
                padding: '0.5rem 1rem', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Edit Event
            </button>
            <button 
              onClick={() => handleDeleteEvent(event.id)}
              style={{ 
                background: '#dc3545', 
                color: 'white', 
                border: 'none', 
                padding: '0.5rem 1rem', 
                borderRadius: '4px', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Delete
            </button>
          </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Component to display detailed view of a single event
export function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const foundEvent = getEventById(id);
    setEvent(foundEvent);
  }, [id]);

  if (!event) {
    return (
      <div className="page-wrapper profile-scroll">
        <div className="profile-container">
          <h2>Event Not Found</h2>
          <button onClick={() => navigate('/manage-event')}>Back to Events</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper profile-scroll">
      <div className="profile-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate('/manage-event')}
            style={{ 
              background: 'none', 
              border: '1px solid #ccc', 
              padding: '0.5rem 1rem', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            ← Back to Events
          </button>
          <div>
            <button 
              onClick={() => navigate(`/events/${event.id}/edit`)}
              style={{ 
                background: '#6c757d', 
                color: 'white', 
                border: 'none', 
                padding: '0.5rem 1rem', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              Edit Event
            </button>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <h1>{event.eventName}</h1>
            <span style={{ 
              padding: '0.5rem 1rem', 
              borderRadius: '12px', 
              fontSize: '0.875rem', 
              fontWeight: 'bold',
              backgroundColor: event.urgency === '1' ? '#d4edda' : 
                             event.urgency === '2' ? '#fff3cd' : 
                             event.urgency === '3' ? '#f8d7da' : '#f5c6cb',
              color: event.urgency === '1' ? '#155724' : 
                     event.urgency === '2' ? '#856404' : '#721c24'
            }}>
              {event.urgencyLevel || getUrgencyName(event.urgency)} Priority
            </span>
          </div>

          {event.eventDescription && (
            <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
              <h3>Description</h3>
              <p>{event.eventDescription}</p>
            </div>
          )}

          <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
            <h3>Location</h3>
            <div>
              <p>{event.address1}</p>
              {event.address2 && <p>{event.address2}</p>}
              <p>{event.city}, {event.stateName || getStateName(event.state)} {event.zip}</p>
            </div>
          </div>

          <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
            <h3>Skills Required</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {event.skills && event.skills.map((skill, index) => (
                <span key={index} style={{ 
                  background: '#e9ecef', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '6px', 
                  fontSize: '0.875rem' 
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
            <h3>Available Dates</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {event.availabilityDates?.map((dateObj, index) => (
                <div key={index} style={{ 
                  background: '#f8f9fa', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px', 
                  border: '1px solid #dee2e6' 
                }}>
                  {dateObj.formatted}
                </div>
              )) || event.availability?.map((date, index) => (
                <div key={index} style={{ 
                  background: '#f8f9fa', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px', 
                  border: '1px solid #dee2e6' 
                }}>
                  {new Date(date).toLocaleDateString()}
                </div>
              )) || <p>No dates specified</p>}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Event Details</h3>
            <div>
              <p><strong>Created:</strong> {event.createdAt ? new Date(event.createdAt).toLocaleString() : 'Unknown'}</p>
              <p><strong>Status:</strong> {event.status || 'Active'}</p>
              <p><strong>Event ID:</strong> {event.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions to convert codes to names
const getUrgencyName = (urgencyCode) => {
  const urgencyMap = {
    '1': 'Low',
    '2': 'Medium', 
    '3': 'High',
    '4': 'Critical'
  };
  return urgencyMap[urgencyCode] || urgencyCode;
};

const getStateName = (stateCode) => {
  const stateMap = {
    'TX': 'Texas',
    'CA': 'California',
    'NY': 'New York',
    'FL': 'Florida',
    'IL': 'Illinois'
  };
  return stateMap[stateCode] || stateCode;
};

export default ManageEvent;
