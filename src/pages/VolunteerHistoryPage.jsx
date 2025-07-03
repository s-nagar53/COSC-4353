import React, { useState } from 'react';

// Mock data for volunteers and their event history
const volunteers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@email.com',
    skills: ['Teaching', 'First Aid'],
    history: [
      { eventName: 'Community Cleanup', date: '2023-11-15', role: 'Team Lead' },
      { eventName: 'Youth Mentorship', date: '2023-11-25', role: 'Mentor' },
    ],
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    skills: ['Cooking', 'Driving'],
    history: [
      { eventName: 'Food Drive', date: '2023-11-20', role: 'Driver' },
    ],
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    skills: ['Construction', 'Painting'],
    history: [],
  },
];

function VolunteerHistoryPage() {
  const [selectedVolunteer, setSelectedVolunteer] = useState(volunteers[0]);

  return (
    <div className="page-wrapper profile-scroll">
      <div className="profile-container" style={{ maxWidth: '900px', width: '100%' }}>
        <h2 style={{ textAlign: 'center' }}>Volunteer & Event History</h2>
        <div style={{ display: 'flex', gap: '2rem', minHeight: '400px' }}>
          {/* Left: Volunteer List */}
          <div style={{ flex: '1 1 250px', borderRight: '1px solid #eee', paddingRight: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="volunteer-list">Volunteers</label>
              <ul id="volunteer-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {volunteers.map((vol) => (
                  <li key={vol.id} style={{ marginBottom: '0.5rem' }}>
                    <button
                      type="button"
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        border: selectedVolunteer?.id === vol.id ? '2px solid #357189' : '1px solid #357189',
                        background: selectedVolunteer?.id === vol.id ? '#e6f0ff' : '#f8f9fa',
                        color: '#333',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'background 0.2s, border 0.2s',
                      }}
                      onClick={() => setSelectedVolunteer(vol)}
                    >
                      {vol.name} <span style={{ color: '#888', fontWeight: 400, fontSize: '0.95em' }}>({vol.email})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Right: Event History */}
          <div style={{ flex: '2 1 0', paddingLeft: '1.5rem' }}>
            {selectedVolunteer && (
              <div className="form-group" style={{ marginTop: 0 }}>
                <h3 style={{ marginBottom: '1rem' }}>Event History for {selectedVolunteer.name}</h3>
                {selectedVolunteer.history.length === 0 ? (
                  <p style={{ color: '#888' }}>No event participation history found for this volunteer.</p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {selectedVolunteer.history.map((event, idx) => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VolunteerHistoryPage; 