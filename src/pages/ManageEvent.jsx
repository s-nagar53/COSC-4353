import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './Profile.css';
import { auth } from '../firebase'; // Adjust path to your firebase config
import { onAuthStateChanged } from 'firebase/auth';

// Helper function to get all events from backend
const getEvents = async (userToken) => {
  try {
    const response = await fetch('http://localhost:3001/api/event/all', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

// Helper function to get a single event by eid from backend
const getEventById = async (eid, userToken) => {
  try {
    const response = await fetch(`http://localhost:3001/api/event/${eid}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Event not found');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
};

// Helper function to delete an event
const deleteEvent = async (eid, userToken) => {
  try {
    const response = await fetch(`http://localhost:3001/api/event/${eid}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Component to display list of events
export function ManageEvent() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Get user token when user changes
  useEffect(() => {
    const getToken = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setUserToken(token);
        } catch (error) {
          console.error('Error getting token:', error);
          setError('Authentication failed');
        }
      }
    };

    getToken();
  }, [user]);

  // Fetch events when token is available
  useEffect(() => {
    const fetchEvents = async () => {
      if (userToken) {
        try {
          setLoading(true);
          const fetchedEvents = await getEvents(userToken);
          setEvents(fetchedEvents);
          setError(null);
        } catch (error) {
          console.error('Error loading events:', error);
          setError('Failed to load events');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEvents();
  }, [userToken]);

  const handleDeleteEvent = async (eid) => {
    if (!userToken) return;
    
    if (window.confirm('Are you sure you want to delete this event?')) {
      // try {
      //   await deleteEvent(eid, userToken);
      //   // Remove the deleted event from local state
      //   setEvents(events.filter(event => event.eid !== eid));
      // } catch (error) {
      //   console.error('Error deleting event:', error);
      //   alert('Failed to delete event. Please try again.');
      // }
      try {
        const response = await fetch(`http://localhost:3001/api/event/${eid}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete event');
        }

        const data = await response.json();
        console.log(data.message);

        // Re-fetch events to update the list
        const updatedEvents = await getEvents(userToken);
        setEvents(updatedEvents);

      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
      }
    }
  };

  // Show loading while authenticating or fetching data
  if (loading || !user) {
    return (
      <div className="page-wrapper profile-scroll">
        <div className="profile-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if there's an issue
  if (error) {
    return (
      <div className="page-wrapper profile-scroll">
        <div className="profile-container">
          <div style={{ textAlign: 'center' }}>
            <h2>Error</h2>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{ 
                padding: '0.5rem 1rem',
                backgroundColor: '#357189',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <div key={event.eid} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '1.5rem', 
              background: '#133644', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1rem', position: 'relative' }}>
                <h3 style={{ color: 'white', margin: 0, textAlign: 'center' }}>{event.eventname}</h3>
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
                  {getUrgencyName(event.urgency)}
                </span>
              </div>
              
              {event.eventdescription && (
                <p style={{ color: 'white', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  {event.eventdescription.length > 100 
                    ? `${event.eventdescription.substring(0, 100)}...` 
                    : event.eventdescription}
                </p>
              )}
              
              <div style={{ fontSize: '0.9rem', color: 'white' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong>Location:</strong> {event.address}, {event.city}, {getStateName(event.state)} {event.zip}
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
                  <strong>Available Dates:</strong>
                  <div>
                    {event.availability?.map((date, index) => (
                      <div key={index}>
                        {new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC' })}

                      </div>
                    )) || <p>No dates specified</p>}
                  </div>
                </div>
                
                <div>
                  <small>Event ID: {event.eid}</small>
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
                  onClick={() => navigate(`/edit-event/${event.eid}`)}
                  style={{ 
                    background: '#357189', 
                    color: 'white', 
                    border: 'none', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Edit Event
                </button>
                <button 
                  onClick={() => handleDeleteEvent(event.eid)}
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
  const { id } = useParams(); // This is the eid from the URL
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Get user token when user changes
  useEffect(() => {
    const getToken = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setUserToken(token);
        } catch (error) {
          console.error('Error getting token:', error);
          setError('Authentication failed');
        }
      }
    };

    getToken();
  }, [user]);

  // Fetch event when token and id are available
  useEffect(() => {
    const fetchEvent = async () => {
      if (userToken && id) {
        try {
          setLoading(true);
          const foundEvent = await getEventById(id, userToken);
          setEvent(foundEvent);
          setError(null);
        } catch (error) {
          console.error('Error loading event:', error);
          setError('Failed to load event');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEvent();
  }, [userToken, id]);

  if (loading || !user) {
    return (
      <div className="page-wrapper profile-scroll">
        <div className="profile-container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="page-wrapper profile-scroll">
        <div className="profile-container">
          <h2>Event Not Found</h2>
          <p>{error || 'The requested event could not be found.'}</p>
          <button 
            onClick={() => navigate('/manage-event')}
            style={{ 
              padding: '0.5rem 1rem',
              backgroundColor: '#357189',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Back to Events
          </button>
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
              onClick={() => navigate(`/edit-event/${event.eid}`)}
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
            <h1>{event.eventname}</h1>
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
              {getUrgencyName(event.urgency)} Priority
            </span>
          </div>

          {event.eventdescription && (
            <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
              <h3>Description</h3>
              <p>{event.eventdescription}</p>
            </div>
          )}

          <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
            <h3>Location</h3>
            <div>
              <p>{event.address}</p>
              <p>{event.city}, {getStateName(event.state)} {event.zip}</p>
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
              {event.availability?.map((date, index) => (
                <div key={index} style={{ 
                  background: '#f8f9fa', 
                  padding: '0.5rem 1rem', 
                  borderRadius: '4px', 
                  border: '1px solid #dee2e6' 
                }}>
                  {new Date(date + 'T00:00:00Z').toLocaleDateString('en-US', { timeZone: 'UTC' })}

                </div>
              )) || <p>No dates specified</p>}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Event Details</h3>
            <div>
              <p><strong>Event ID:</strong> {event.eid}</p>
              <p><strong>Creator ID:</strong> {event.uid}</p>
              <p><strong>Role:</strong> {event.role || 'N/A'}</p>
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
