/* src/pages/VolunteerHistoryPage.jsx */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../firebase'; // Assuming 'api' is configured to handle API calls

function VolunteerHistoryPage() {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const response = await api.get('/profile/volunteer-history');
        const fetchedVolunteers = response.data;
        setVolunteers(fetchedVolunteers);

        // Automatically select the first volunteer if available
        if (fetchedVolunteers.length > 0) {
          setSelectedVolunteer(fetchedVolunteers[0]);
        }
      } catch (err) {
        console.error('Failed to load volunteers:', err);
      }
    };
    fetchVolunteers();
  }, []);

  const thStyle = {
    padding: '0.75rem',
    textAlign: 'left',
    borderBottom: '1px solid #dee2e6',
    color: '#000',
  };

  const tdStyle = {
    padding: '0.75rem',
    color: '#000',
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
                    {volunteers.map((vol) => (
                      <tr
                        key={vol.id} // Added the key prop here
                        style={{
                          borderBottom: '1px solid #dee2e6',
                          backgroundColor: selectedVolunteer?.id === vol.id ? '#e6f0ff' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                        onClick={() => setSelectedVolunteer(vol)}
                      >
                        <td style={{ ...tdStyle, fontWeight: 'bold' }}>{vol.name}</td>
                        <td style={tdStyle}>{vol.email}</td>
                        <td style={tdStyle}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {(vol.skills || []).slice(0, 2).map((skill, index) => (
                              <span
                                key={index}
                                style={{
                                  background: '#e9ecef',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {skill}
                              </span>
                            ))}
                            {vol.skills.length > 2 && (
                              <span
                                style={{
                                  background: '#e9ecef',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                }}
                              >
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
                <h3 style={{ marginBottom: '1rem', color: '#000' }}>
                  Event History for {selectedVolunteer.name}
                </h3>
                {selectedVolunteer.history.length === 0 ? (
                  <p style={{ color: '#666' }}>No event participation history found for this volunteer.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', color: '#000' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                          <th style={thStyle}>Event</th>
                          <th style={thStyle}>Date</th>
                          <th style={thStyle}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVolunteer.history.map((event, idx) => (
                          <tr
                            key={event.eventName + idx}
                            style={{
                              borderBottom: '1px solid #dee2e6',
                              backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa',
                            }}
                          >
                            <td style={tdStyle}>{event.eventname || event.eventName}</td>
                            <td style={tdStyle}>
                              {event.eventDate ? event.eventDate.split('T')[0] : '—'}
                            </td>
                            <td style={tdStyle}>
                              <span
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  fontWeight: 'bold',
                                  backgroundColor:
                                  selectedVolunteer.participationStatus === 'Confirmed' || selectedVolunteer.participationStatus === 'Current'
                                      ? '#d4edda'
                                      : selectedVolunteer.participationStatus === 'Pending'
                                      ? '#fff3cd'
                                      : '#d1ecf1',
                                  color:
                                  selectedVolunteer.participationStatus === 'Confirmed' || selectedVolunteer.participationStatus === 'Current'
                                      ? '#155724'
                                      : selectedVolunteer.participationStatus === 'Pending'
                                      ? '#856404'
                                      : '#0c5460',
                                }}
                              >
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
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button
            onClick={() => navigate('/admin-dashboard')}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default VolunteerHistoryPage;