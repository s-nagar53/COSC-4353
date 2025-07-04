import React, { useState } from 'react';

// Mock data for volunteers and their event history
const volunteers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@email.com',
    skills: ['Teaching', 'First Aid'],
    totalEvents: 2,
    history: [
      { 
        eventName: 'Community Cleanup', 
        eventDescription: 'Help clean up the local park and surrounding areas',
        address1: '123 Main St',
        address2: '',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        skills: ['Event Setup / Cleanup', 'Physical Labor'],
        urgency: 'Medium',
        availabilityDates: ['2023-11-15', '2023-11-16'],
        participationStatus: 'Confirmed',
        role: 'Team Lead',
        eventDate: '2023-11-15'
      },
      { 
        eventName: 'Youth Mentorship', 
        eventDescription: 'Mentor local youth in various skills and activities',
        address1: '789 Pine St',
        address2: '',
        city: 'Houston',
        state: 'TX',
        zip: '77003',
        skills: ['Teaching / Tutoring', 'Childcare / Youth Engagement'],
        urgency: 'Low',
        availabilityDates: ['2023-11-25'],
        participationStatus: 'Completed',
        role: 'Mentor',
        eventDate: '2023-11-25'
      }
    ],
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    skills: ['Cooking', 'Driving'],
    totalEvents: 1,
    history: [
      { 
        eventName: 'Food Drive', 
        eventDescription: 'Collect and distribute food to local families in need',
        address1: '456 Oak Ave',
        address2: 'Suite 100',
        city: 'Houston',
        state: 'TX',
        zip: '77002',
        skills: ['Driving / Transportation', 'Food Preparation / Serving'],
        urgency: 'High',
        availabilityDates: ['2023-11-20', '2023-11-21'],
        participationStatus: 'Pending',
        role: 'Driver',
        eventDate: '2023-11-20'
      }
    ],
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    skills: ['Construction', 'Painting'],
    totalEvents: 0,
    history: [],
  },
];

function VolunteerHistoryPage() {
  const [selectedVolunteer, setSelectedVolunteer] = useState(volunteers[0]);

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
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  fontSize: '0.9rem',
                  color: '#000'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#000' }}>Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#000' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#000' }}>Skills</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#000' }}>Events</th>
                    </tr>
                  </thead>
                  <tbody>
                    {volunteers.map((vol, idx) => (
                      <tr 
                        key={vol.id} 
                        style={{ 
                          borderBottom: '1px solid #dee2e6', 
                          backgroundColor: selectedVolunteer?.id === vol.id ? '#e6f0ff' : (idx % 2 === 0 ? '#fff' : '#f8f9fa'),
                          cursor: 'pointer',
                          transition: 'background-color 0.2s'
                        }}
                        onClick={() => setSelectedVolunteer(vol)}
                      >
                        <td style={{ padding: '0.75rem', color: '#000', fontWeight: 'bold' }}>
                          {vol.name}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#000' }}>
                          {vol.email}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#000' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {vol.skills.slice(0, 2).map((skill, index) => (
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
                        <td style={{ padding: '0.75rem', color: '#000' }}>
                          {vol.totalEvents}
                        </td>
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
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse', 
                      fontSize: '0.9rem',
                      color: '#000'
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#000' }}>Event</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#000' }}>Location</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#000' }}>Date</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#000' }}>Role</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#000' }}>Status</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #dee2e6', color: '#000' }}>Urgency</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedVolunteer.history.map((event, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #dee2e6', backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                            <td style={{ padding: '0.75rem', color: '#000' }}>
                              <div style={{ fontWeight: 'bold' }}>{event.eventName}</div>
                              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>{event.eventDescription}</div>
                            </td>
                            <td style={{ padding: '0.75rem', color: '#000' }}>
                              <div>{event.address1}</div>
                              {event.address2 && <div>{event.address2}</div>}
                              <div>{event.city}, {event.state} {event.zip}</div>
                            </td>
                            <td style={{ padding: '0.75rem', color: '#000' }}>
                              {new Date(event.eventDate).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '0.75rem', color: '#000' }}>
                              {event.role}
                            </td>
                            <td style={{ padding: '0.75rem', color: '#000' }}>
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
                                {event.participationStatus}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem', color: '#000' }}>
                              <span style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                backgroundColor: event.urgency === 'High' ? '#f8d7da' : 
                                               event.urgency === 'Medium' ? '#fff3cd' : '#d4edda',
                                color: event.urgency === 'High' ? '#721c24' : 
                                       event.urgency === 'Medium' ? '#856404' : '#155724'
                              }}>
                                {event.urgency}
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