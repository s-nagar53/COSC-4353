import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './Profile.css';
import Select from 'react-select';

function VolunteerMatchingForm() {
  
  const navigate = useNavigate();
  
  // state for events and volunteers
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [matches, setMatches] = useState([]);
  
  // form state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingVolunteers, setIsLoadingVolunteers] = useState(false);

  // load events and existing matches on component mount
  useEffect(() => {
    fetchEvents();
    fetchExistingMatches();
  }, []);

  // fetch volunteers when an event is selected
  useEffect(() => {
    if (selectedEvent) {
      fetchMatchingVolunteers(selectedEvent.value);
    } else {
      setVolunteers([]);
    }
    setSelectedVolunteer(null); // Reset volunteer selection when event changes
  }, [selectedEvent]);


  // fetch all events for the event dropdown
  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/matching/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      setEvents(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setErrors({ fetch: 'Failed to load events. Please try again.' });
      setIsLoading(false);
    }
  };


  // fetch volunteers that match the selected event's requirements
  const fetchMatchingVolunteers = async (eventId) => {
    console.log('🔍 Fetching volunteers for event ID:', eventId);
    setIsLoadingVolunteers(true);
    try {
      const response = await fetch(`http://localhost:3001/api/matching/volunteers/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to fetch matching volunteers');
      }
      
      const data = await response.json();

      console.log('📊 Response data:', data);
      console.log('👥 Volunteers found:', data.data.volunteers.length);
    
      setVolunteers(data.data.volunteers);
      setIsLoadingVolunteers(false);
    } catch (error) {
      console.error('Error fetching matching volunteers:', error);
      setErrors({ volunteers: 'Failed to load matching volunteers. Please try again.' });
      setIsLoadingVolunteers(false);
    }
  };


  // fetch existing matches
  const fetchExistingMatches = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/matching/matches', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch existing matches');
      }
      
      const data = await response.json();
      setMatches(data.data);
    } catch (error) {
      console.error('Error fetching existing matches:', error);
      setErrors({ matches: 'Failed to load existing matches.' });
    }
  };


  // handle form submission to create a new match
  const handleMatch = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!selectedEvent) newErrors.event = 'Please select an event';
    if (!selectedVolunteer) newErrors.volunteer = 'Please select a volunteer';
    
    setErrors(newErrors);

    if (selectedEvent && selectedVolunteer) {
      try {
        const response = await fetch('http://localhost:3001/api/matching/matches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            volunteerId: selectedVolunteer.value,
            eventId: selectedEvent.value
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create match');
        }
        
        // refresh matches and reset form
        await fetchExistingMatches();
        setSelectedEvent(null);
        setSelectedVolunteer(null);
        setVolunteers([]);
        setErrors({});
        
        // show success message
        alert('Match created successfully!');
      } catch (error) {
        console.error('Error creating match:', error);
        setErrors({ submit: error.message });
      }
    }
  };

  
   //handle removing a match
  const handleUnmatch = async (matchId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/matching/matches/${matchId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete match');
      }
      
      // refresh matches after successful deletion
      await fetchExistingMatches();
      alert('Match removed successfully!');
    } catch (error) {
      console.error('Error deleting match:', error);
      setErrors({ submit: 'Failed to remove match. Please try again.' });
    }
  };

  const urgencyColors = {
    '1': '#28a745', // Green for Low
    '2': '#ffc107', // Yellow for Medium
    '3': '#fd7e14', // Orange for High
    '4': '#dc3545', // Red for Critical
  };

  // format events for dropdown
  const eventOptions = events.map(event => ({
    value: event.id,
    label: `${event.name} - ${event.city}, ${event.state} (${event.date})`,
    urgency: event.urgency,
    urgencyName: event.urgencyName,
  }));

  // format volunteers for dropdown
  const volunteerOptions = volunteers.map(volunteer => ({
    value: volunteer.id,
    label: `${volunteer.name} - ${volunteer.city}, ${volunteer.state} (Skills: ${volunteer.matchingSkills.join(', ')})
    (Available: ${volunteer.availability ? volunteer.availability.map(date => {
      const d = new Date(date);
      // Format as MM/DD/YYYY without time
      return `${(d.getUTCMonth() + 1).toString().padStart(2, '0')}/${d.getUTCDate().toString().padStart(2, '0')}/${d.getUTCFullYear()}`;
    }).join(', ') : 'Not specified'})`
  }));

  if (isLoading) {
    return (
      <div className="page-wrapper">
        <div className="profile-container">
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" > 
      <div className="profile-container" > 
        <h2>Volunteer Matching</h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          First select an event, then choose from volunteers who live in the same city and have matching skills.
        </p>
        
        {errors.fetch && <p className="form-error" style={{ color: 'red' }}>{errors.fetch}</p>}
        {errors.submit && <p className="form-error" style={{ color: 'red' }}>{errors.submit}</p>}
        
        <form onSubmit={handleMatch}>
          {/* event dropdown */}
          <div className="form-group" style={{ zIndex: 2 }}> 
            <label htmlFor="event-select" id="event-label">Select Event *</label>
            <Select
              id="event-select"
              aria-labelledby="event-label"
              inputId="event-input"
              options={eventOptions}
              placeholder="-- Select an event first --"
              className="custom-select-container"
              classNamePrefix="react-select"
              value={selectedEvent}
              onChange={setSelectedEvent}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: base => ({ ...base, zIndex: 9999 }),
                control: (base) => ({
                  ...base,
                  borderRadius: '4px'
                }),
                option: (base, { data }) => ({
                  ...base,
                  color: urgencyColors[data.urgency] || 'inherit',
                  fontWeight: data.urgency >= '3' ? 'bold' : 'normal'
                }),
                singleValue: (base, { data }) => ({
                  ...base,
                  color: urgencyColors[data?.urgency] || 'inherit',
                  fontWeight: data?.urgency >= '3' ? 'bold' : 'normal'
                })
              }}
              formatOptionLabel={(option) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: urgencyColors[option.urgency],
                    marginRight: '8px'
                  }} />
                  {option.label}
                </div>
              )}
            />
            {errors.event && <p className="form-error">{errors.event}</p>}
          </div>

          {/* volunteer dropdown */}
          <div className="form-group" style={{ zIndex: 1 }}>
            <label htmlFor="volunteer-select" id="volunteer-label">Select Volunteer *</label>
            <Select
              id="volunteer-select"
              aria-labelledby="volunteer-label"
              inputId="volunteer-input"
              options={volunteerOptions}
              placeholder={
                !selectedEvent 
                  ? "-- Select an event first --"
                  : isLoadingVolunteers 
                    ? "Loading matching volunteers..."
                    : volunteers.length === 0
                      ? "No matching volunteers found"
                      : "-- Select a volunteer --"
              }
              className="custom-select-container"
              classNamePrefix="react-select"
              value={selectedVolunteer}
              onChange={setSelectedVolunteer}
              isDisabled={!selectedEvent || isLoadingVolunteers}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: base => ({ ...base, zIndex: 9999 }),
                control: (base) => ({
                  ...base,
                  borderRadius: '4px'
                })
              }}
            />
            {errors.volunteer && <p className="form-error">{errors.volunteer}</p>}
            {errors.volunteers && <p className="form-error">{errors.volunteers}</p>}
          </div>

          {/* show matching criteria when event is selected */}
          {selectedEvent && (
            <div className="matching-info" style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '4px',
              margin: '1rem 0',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ color: 'black', marginBottom: '0.5rem' }}>Matching Criteria</h4>
              <p style={{ color: 'black', margin: '0.25rem 0' }}>
                <strong>Event:</strong> {events.find(e => e.id === selectedEvent.value)?.name}
                <span style={{ 
                  color: urgencyColors[events.find(e => e.id === selectedEvent.value)?.urgency],
                  fontWeight: 'bold',
                  marginLeft: '0.5rem'
                }}>
                  [{events.find(e => e.id === selectedEvent.value)?.urgencyName}]
                </span>
              </p>
              <p style={{ color: 'black', margin: '0.25rem 0' }}>
                <strong>Location:</strong> {events.find(e => e.id === selectedEvent.value)?.city}, {events.find(e => e.id === selectedEvent.value)?.state}
              </p>
              <p style={{ color: 'black', margin: '0.25rem 0' }}>
                <strong>Required Skills:</strong> {events.find(e => e.id === selectedEvent.value)?.requiredSkills.join(', ')}
              </p>
              <p style={{ color: 'black', margin: '0.25rem 0' }}>
                <strong>Event Date(s):</strong> {
        events.find(e => e.id === selectedEvent.value)?.availability?.map(date => {
          const d = new Date(date);
          return `${(d.getUTCMonth() + 1).toString().padStart(2, '0')}/${d.getUTCDate().toString().padStart(2, '0')}/${d.getUTCFullYear()}`;
        }).join(', ') || 'Not specified'}
              </p>
              <p style={{ color: 'black', margin: '0.25rem 0' }}>
                <strong>Matching Volunteers Found:</strong> {volunteers.length}
              </p>
            </div>
          )}

          <button 
            type="submit" 
            style={{ marginTop: '1rem' }} 
            disabled={!selectedEvent || !selectedVolunteer}
            aria-label="Match volunteer to event"
          >
            Create Match
          </button>
        </form>

        {/* current matches section */}
        <div className="matches-section" style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'black' }}>Current Matches</h3>
          {errors.matches && <p className="form-error">{errors.matches}</p>}
          
          {matches.length === 0 ? (
            <p style={{ color: 'black' }}>No matches yet. Select an event and volunteer to create a match.</p>
          ) : (
            <ul className="matches-list" style={{ listStyle: 'none', padding: 0 }}>
              {matches.map((match) => (
                <li key={match.id} style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  marginBottom: '0.5rem', 
                  borderRadius: '4px',
                  border: '1px solid #dee2e6',
                  borderLeft: `4px solid ${urgencyColors[match.event.urgency] || '#dee2e6'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'black' }}>{match.volunteer.name}</strong>
                        <span style={{ color: '#666', margin: '0 0.5rem' }}>→</span> 
                        <strong style={{ color: 'black' }}>{match.event.name}</strong>
                      </div>
                      
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      <div>
                        <strong>Urgency:</strong> 
                        <span style={{ 
                          color: urgencyColors[match.event.urgency],
                          fontWeight: 'bold',
                          marginLeft: '0.5rem'
                        }}>
                          {match.event.urgencyName}
                        </span>
                      </div>
                        <div>
                          <strong>Location:</strong> {match.event.city} | 
                          <strong> Date:</strong> {match.event.date}
                        </div>
                        <div>
                          <strong>Matching Skills:</strong> {match.matchedSkills.join(', ') || 'None'}
                        </div>
                        <div>
                          <strong>Created:</strong> {new Date(match.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => handleUnmatch(match.id)}
                      style={{
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginLeft: '1rem'
                      }}
                      aria-label={`Remove match between ${match.volunteer.name} and ${match.event.name}`}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Back button */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
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
        </div>
      </div>
    </div>
  );
}

export default VolunteerMatchingForm;