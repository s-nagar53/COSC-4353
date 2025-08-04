/*
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import api from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

function VolunteerHistoryPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  useEffect(() => {
    // Set up a real-time listener for the 'matches' collection
    const unsubscribe = onSnapshot(collection(db, 'matches'), snapshot => {
      console.log("Firestore 'matches' collection changed. Re-fetching data...");
      // Re-fetch volunteers and history whenever matches change
      fetchVolunteers(); // This will trigger re-fetching selected volunteer's history via its useEffect
    }, error => {
      console.error("Error listening to matches collection:", error);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedVolunteer) {
      fetchVolunteerHistory(selectedVolunteer.id);
    } else {
      setEventHistory([]); // Clear history if no volunteer is selected
    }
  }, [selectedVolunteer]);

  const fetchVolunteers = async () => {
    try {
      //const response = await api.get('/profile/volunteers');
      const response = await api.get('/profile/volunteer-history');
      setVolunteers(response.data);
      if (response.data.length > 0 && !selectedVolunteer) { // Only set initial selected volunteer if none is chosen
        setSelectedVolunteer(response.data[0]);
      } else if (selectedVolunteer) {
        // If a volunteer was already selected, find them in the updated list
        const updatedSelectedVolunteer = response.data.find(vol => vol.id === selectedVolunteer.id);
        if (updatedSelectedVolunteer) {
          setSelectedVolunteer(updatedSelectedVolunteer);
        } else if (response.data.length > 0) {
          // If the previously selected volunteer is no longer in the list, select the first one
          setSelectedVolunteer(response.data[0]);
        } else {
          setSelectedVolunteer(null); // No volunteers left
        }
      }
    } catch (err) {
      console.error('Failed to load volunteers:', err);
    }
  };

  const fetchVolunteerHistory = async (volunteerId) => {
    try {
      const response = await api.get(`/matching/volunteer-history/${volunteerId}`);
      setEventHistory(response.data.data);
    } catch (err) {
      console.error('Failed to load volunteer history:', err);
      setEventHistory([]);
    }
  };

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
          //{ Left: Volunteers Table }
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

          //{ Right: Event History Table }
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
                              {event.eventDate ? event.eventDate.split('T')[0] : '—'}
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
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
  <button
    onClick={() => navigate('/admin-dashboard')}
    style={{
      padding: '0.6rem 1.4rem',
      backgroundColor: '#357189',
      color: 'white',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: '600',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transition: 'all 0.3s ease'
    }}
    onMouseOver={(e) => {
      e.target.style.transform = 'translateY(-2px)';
      e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
    }}
    onMouseOut={(e) => {
      e.target.style.transform = 'translateY(0)';
      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    }}
  >
    ← Back to Dashboard
  </button>
</div>

    </div>
  );
}


export default VolunteerHistoryPage;
*/
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../firebase'; // axios instance pointing to your Express backend

function VolunteerHistoryPage() {
  const navigate = useNavigate();
  const [volunteers, setVolunteers] = useState([]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [eventHistory, setEventHistory] = useState([]);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  useEffect(() => {
    if (selectedVolunteer) {
      fetchVolunteerHistory(selectedVolunteer.id);
    } else {
      setEventHistory([]);
    }
  }, [selectedVolunteer]);

  const fetchVolunteers = async () => {
    try {
      const response = await api.get('/profile/volunteer-history');
      const volunteers = response.data;

      // Set consistent ID field
      const cleaned = volunteers.map(v => ({
        ...v,
        id: v.id || v.uid // fallback for older data
      }));

      setVolunteers(cleaned);

      const current = selectedVolunteer
        ? cleaned.find(v => v.id === selectedVolunteer.id)
        : cleaned[0];

      setSelectedVolunteer(current || null);
    } catch (err) {
      console.error('Failed to load volunteers:', err);
    }
  };

  const fetchVolunteerHistory = async (volunteerId) => {
    try {
      const response = await api.get(`/matching/volunteer-history/${volunteerId}`);
      const history = response.data.data || [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const enriched = history.map(event => {
        let status = event.participationStatus || 'Unknown';

        if (status === 'Confirmed' && event.availabilityDates?.length) {
          const hasFuture = event.availabilityDates.some(date => {
            const d = new Date(date);
            d.setHours(0, 0, 0, 0);
            return d >= today;
          });
          status = hasFuture ? 'Current' : 'Completed';
        }

        return { ...event, participationStatus: status };
      });

      setEventHistory(enriched);
    } catch (err) {
      console.error('Failed to load volunteer history:', err);
      setEventHistory([]);
    }
  };

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
          {/* Volunteer List */}
          <div style={{ flex: '1 1 400px', borderRight: '1px solid #eee', paddingRight: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', color: '#000' }}>Volunteers</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
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
                        backgroundColor: selectedVolunteer?.id === vol.id ? '#e6f0ff' : idx % 2 === 0 ? '#fff' : '#f8f9fa',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedVolunteer(vol)}
                    >
                      <td style={{ ...tdStyle, fontWeight: 'bold' }}>{vol.name}</td>
                      <td style={tdStyle}>{vol.email}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {(vol.skills || []).slice(0, 2).map((skill, i) => (
                            <span key={i} style={{
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

          {/* Event History */}
          <div style={{ flex: '2 1 0', paddingLeft: '1.5rem' }}>
            {selectedVolunteer && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#000' }}>
                  Event History for {selectedVolunteer.name}
                </h3>
                {eventHistory.length === 0 ? (
                  <p style={{ color: '#666' }}>No event participation history found for this volunteer.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
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
                        {eventHistory.map(event => (
                          <tr key={`${event.eventname}-${event.eventDate}`}>
                            <td style={tdStyle}>{event.eventname || event.eventName}</td>
                            <td style={tdStyle}>{event.eventDescription || '—'}</td>
                            <td style={tdStyle}>{event.address || event.address1 || '—'}</td>
                            <td style={tdStyle}>{event.city || '—'}</td>
                            <td style={tdStyle}>{event.state || '—'}</td>
                            <td style={tdStyle}>{(event.skills || []).join(', ')}</td>
                            <td style={tdStyle}>
                              {event.eventDate ? event.eventDate.split('T')[0] : '—'}
                            </td>
                            <td style={tdStyle}>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                backgroundColor:
                                  event.participationStatus === 'Confirmed' || event.participationStatus === 'Current'
                                    ? '#d4edda'
                                    : event.participationStatus === 'Pending'
                                    ? '#fff3cd'
                                    : '#f8d7da',
                                color:
                                  event.participationStatus === 'Confirmed' || event.participationStatus === 'Current'
                                    ? '#155724'
                                    : event.participationStatus === 'Pending'
                                    ? '#856404'
                                    : '#721c24'
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

      {/* Back Button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <button
          onClick={() => navigate('/admin-dashboard')}
          style={{
            padding: '0.6rem 1.4rem',
            backgroundColor: '#357189',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default VolunteerHistoryPage;
