import React, { useState, useEffect } from 'react';

function VolunteerHistoryPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/profile/volunteer-history')
      .then(res => res.json())
      .then(data => {
        setVolunteers(data);
        setSelectedVolunteer(data[0] || null);
      })
      .catch(err => {
        console.error('Failed to load volunteer history:', err);
      });
  }, []);

  const thStyle = {
    padding: '0.75rem',
    textAlign: 'left',
    borderBottom: '1px solid #dee2e6',
    color: '#000'
  };

  const tdStyle = {
    padding: '0.75rem',
    color: '#000'
  };

  return (
    <div className="page-wrapper profile-scroll">
      <div className="profile-container" style={{ maxWidth: '1200px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', color: '#000' }}>Volunteer & Event History</h2>
        <div style={{ display: 'flex', gap: '2rem', minHeight: '500px' }}>
          {/* Left: Volunteers Table */}
          <div style={{ flex: '1 1 400px', borderRight: '1px solid #eee', paddingRight: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#000' }}>Volunteers</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#000' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                      <th style={thStyle}>Name</th>
                      <th style={thStyle}>Email</th>
                      <th style={thStyle}>Skills</th>
                      <th style={thStyle}>Events</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((vol, idx) => (
                      <tr
                        key={vol.id}
                        style={{
                          borderBottom: '1px solid #dee2e6',
                          backgroundColor:
                            selectedVolunteer?.id === vol.id ? '#e6f0ff' : idx % 2 === 0 ? '#fff' : '#f8f9fa',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => setSelectedVolunteer(vol)}
                      >
                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>{vol.name}</td>
                        <td style={tdStyle}>{vol.email}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {(vol.skills || []).slice(0, 2).map((skill, index) => (
                              <span key={index} style={{
                                background: '#e9ecef',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem'
                              }}>
                                {skill}
                              </span>
                            ))}
                            {vol.skills.length > 2 && (
                              <span style={{
                                background: '#e9ecef',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem'
                              }}>
                                +{vol.skills.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={tdStyle}>{vol.totalEvents}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right: Event History Table */}
          <div style={{ flex: '2 1 0', paddingLeft: '1.5rem' }}>
            {selectedVolunteer && (
              <div className="form-group" style={{ marginTop: 0 }}>
                <h3 style={{ marginBottom: '1rem', color: '#000' }}>Event History for {selectedVolunteer.name}</h3>
                {selectedVolunteer.history.length === 0 ? (
                  <p style={{ color: '#666' }}>No event participation history found for this volunteer.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#000' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                          <th style={thStyle}>Event</th>
                          <th style={thStyle}>Description</th>
                          <th style={thStyle}>Address</th>
                          <th style={thStyle}>City</th>
                          <th style={thStyle}>State</th>
                          <th style={thStyle}>Skills</th>
                          <th style={thStyle}>Date</th>
                          <th style={thStyle}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVolunteer.history.map((event, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                            <td style={tdStyle}>{event.eventname || event.eventName}</td>
                            <td style={tdStyle}>{event.eventDescription || '—'}</td>
                            <td style={tdStyle}>{event.address || event.address1 || '—'}</td>
                            <td style={tdStyle}>{event.city || '—'}</td>
                            <td style={tdStyle}>{event.state || '—'}</td>
                            <td style={tdStyle}>{(event.skills || []).join(', ')}</td>
                            <td style={tdStyle}>
                              {event.eventDate ? new Date(event.eventDate).toLocaleDateString() : '—'}
                            </td>
                            <td style={tdStyle}>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                backgroundColor: event.participationStatus === 'Confirmed' ? '#d4edda' : 
                                                  event.participationStatus === 'Pending' ? '#fff3cd' : '#d1ecf1',
                                color: event.participationStatus === 'Confirmed' ? '#155724' : 
                                       event.participationStatus === 'Pending' ? '#856404' : '#0c5460'
                              }}>
                                {event.participationStatus || '—'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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