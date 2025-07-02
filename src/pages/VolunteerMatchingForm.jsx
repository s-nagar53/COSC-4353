// // Placeholder page for the volinteer matching form 
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import './Profile.css';
import Select from 'react-select';

function VolunteerMatchingForm() {
  const navigate = useNavigate();
  
  // Placeholder data
  const [volunteers, setVolunteers] = useState([
    { id: 1, name: 'John Doe', skills: ['Teaching', 'First Aid'], availability: 'Weekends' },
    { id: 2, name: 'Jane Smith', skills: ['Cooking', 'Driving'], availability: 'Weekdays' },
    { id: 3, name: 'Mike Johnson', skills: ['Construction', 'Painting'], availability: 'Flexible' },
  ]);

  const [events, setEvents] = useState([
    { id: 1, name: 'Community Cleanup', requiredSkills: ['Physical Labor'], date: '2023-11-15' },
    { id: 2, name: 'Food Drive', requiredSkills: ['Driving', 'Cooking'], date: '2023-11-20' },
    { id: 3, name: 'Youth Mentorship', requiredSkills: ['Teaching'], date: '2023-11-25' },
  ]);

  const [matches, setMatches] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [errors, setErrors] = useState({});

  const volunteerOptions = volunteers.map(v => ({
    value: v.id,
    label: `${v.name} (Skills: ${v.skills.join(', ')})`
  }));

  const eventOptions = events.map(e => ({
    value: e.id,
    label: `${e.name} (Date: ${e.date}, Needs: ${e.requiredSkills.join(', ')})`
  }));

  const handleMatch = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!selectedVolunteer) newErrors.volunteer = 'Please select a volunteer';
    if (!selectedEvent) newErrors.event = 'Please select an event';
    setErrors(newErrors);

    if (selectedVolunteer && selectedEvent) {
      const newMatch = {
        volunteer: volunteers.find(v => v.id === selectedVolunteer.value),
        event: events.find(e => e.id === selectedEvent.value)
      };
      setMatches([...matches, newMatch]);
      setSelectedVolunteer(null);
      setSelectedEvent(null);
    }
  };

  const handleUnmatch = (index) => {
    const newMatches = [...matches];
    newMatches.splice(index, 1);
    setMatches(newMatches);
  };

  return (
    <div className="page-wrapper" style={{ overflow: 'visible' }}> 
      <div className="profile-container" style={{ overflow: 'visible' }}> 
        <h2>Volunteer Matching</h2>
        <form onSubmit={handleMatch}>
          <div className="form-group" style={{ zIndex: 2 }}> 
            <label htmlFor="volunteer">Select Volunteer</label>
            <Select
              id="volunteer"
              options={volunteerOptions}
              placeholder="-- Select a volunteer --"
              className="custom-select-container"
              classNamePrefix="react-select"
              value={selectedVolunteer}
              onChange={setSelectedVolunteer}
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
          </div>

          <div className="form-group" style={{ zIndex: 1 }}>
            <label htmlFor="event">Select Event</label>
            <Select
              id="event"
              options={eventOptions}
              placeholder="-- Select an event --"
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
                })
              }}
            />
            {errors.event && <p className="form-error">{errors.event}</p>}
          </div>

          <button type="submit" style={{ marginTop: '1rem' }}>
            Match Volunteer to Event
          </button>
        </form>

        <div className="matches-section" style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'black' }}>Current Matches</h3>
          {matches.length === 0 ? (
            <p>No matches yet. Select a volunteer and event to create a match.</p>
          ) : (
            <ul className="matches-list" style={{ listStyle: 'none', padding: 0 }}>
              {matches.map((match, index) => (
                <li key={index} style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  marginBottom: '0.5rem', 
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ color: 'black' }}>{match.volunteer.name}</strong>
                    <span style={{ color: 'black', margin: '0 0.5rem' }}>→</span> 
                    <strong style={{ color: 'black' }}>{match.event.name}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'black' }}>
                      Skills matched: {match.volunteer.skills.filter(skill => 
                        match.event.requiredSkills.includes(skill)).join(', ') || 'None'}
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleUnmatch(index)}
                    style={{
                      background: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Unmatch
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Back to Dashboard Button */}
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
        </div>
      </div>
    </div>
  );
}

export default VolunteerMatchingForm;