import React, { useState } from 'react';

// Updated mock data with `location` instead of `role`
const volunteers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@email.com',
    skills: ['Teaching', 'First Aid'],
    history: [
      { eventName: 'Community Cleanup', date: '2023-11-15', location: 'TX' },
      { eventName: 'Youth Mentorship', date: '2023-11-25', location: 'TX' },
    ],
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    skills: ['Cooking', 'Driving'],
    history: [
      { eventName: 'Food Drive', date: '2023-11-20', location: 'FL' },
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
    <div className="page-wrapper profile-scroll" style={{ fontFamily: 'Segoe UI, sans-serif', padding: '2rem' }}>
      <div className="profile-container" style={{ maxWidth: '950px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.8rem', color: '#333' }}>
          Volunteer & Event History
        </h2>
        <div style={{ display: 'flex', gap: '2rem', minHeight: '400px' }}>
          {/* Volunteer List */}
          <div style={{ flex: '1 1 250px', borderRight: '1px solid #ddd', paddingRight: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: '#444' }}>Volunteers</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {volunteers.map((vol) => (
                <li key={vol.id} style={{ marginBottom: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedVolunteer(vol)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      border: selectedVolunteer?.id === vol.id ? '2px solid #357189' : '1px solid #ccc',
                      backgroundColor: selectedVolunteer?.id === vol.id ? '#e6f0ff' : '#fff',
                      color: '#222',
                      fontWeight: 500,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                      transition: '0.2s ease',
                      cursor: 'pointer',
                    }}
                  >
                    {vol.name}{' '}
                    <span style={{ color: '#666', fontWeight: 400, fontSize: '0.9em' }}>({vol.email})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Event History */}
          <div style={{ flex: '2 1 0', paddingLeft: '1.5rem' }}>
            {selectedVolunteer && (
              <div>
                <h4 style={{ marginBottom: '1rem', color: '#444' }}>
                  Event History for {selectedVolunteer.name}
                </h4>
                {selectedVolunteer.history.length === 0 ? (
                  <p style={{ color: '#999', fontStyle: 'italic' }}>
                    No event participation history found for this volunteer.
                  </p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {selectedVolunteer.history.map((event, idx) => (
                      <li
                        key={idx}
                        style={{
                          backgroundColor: '#f9f9f9',
                          borderRadius: '8px',
                          padding: '1rem',
                          marginBottom: '0.75rem',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                        }}
                      >
                        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#333' }}>
                          {event.eventName}
                          <span style={{ float: 'right', color: '#357189', fontSize: '0.95rem' }}>
                            {new Date(event.date).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.95rem', color: '#444', marginTop: '0.25rem' }}>
                          Location: <strong>{event.location}</strong>
                        </div>
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
