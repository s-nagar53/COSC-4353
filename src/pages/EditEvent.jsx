import { useNavigate, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './Profile.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { auth } from '../firebase'; // Adjust path to your firebase config
import { onAuthStateChanged } from 'firebase/auth';

const Urgency_LVL = [
  { code: '1', name: 'Low' },
  { code: '2', name: 'Medium' },
  { code: '3', name: 'High' },
  { code: '4', name: 'Critical' },
];

const US_STATES = [
  { code: 'TX', name: 'Texas' },
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'FL', name: 'Florida' },
  { code: 'IL', name: 'Illinois' },
];

const SKILL_OPTIONS = [
    { value: 'Event Setup / Cleanup', label: 'Event Setup / Cleanup' },
    { value: 'Food Preparation / Serving', label: 'Food Preparation / Serving' },
    { value: 'First Aid / CPR', label: 'First Aid / CPR' },
    { value: 'Childcare / Youth Engagement', label: 'Childcare / Youth Engagement' },
    { value: 'Teaching / Tutoring', label: 'Teaching / Tutoring' },
    { value: 'Public Speaking / Outreach', label: 'Public Speaking / Outreach' },
    { value: 'Fundraising / Donation Drives', label: 'Fundraising / Donation Drives' },
    { value: 'Data Entry / Office Work', label: 'Data Entry / Office Work' },
    { value: 'Driving / Transportation', label: 'Driving / Transportation' },
    { value: 'Photography / Videography', label: 'Photography / Videography' },
    { value: 'Translation / Interpretation', label: 'Translation / Interpretation' },
    { value: 'Social Media / Marketing', label: 'Social Media / Marketing' },
    { value: 'Technical Support / IT Help', label: 'Technical Support / IT Help' },
    { value: 'Elderly Care / Companionship', label: 'Elderly Care / Companionship' },
];

// Helper function to get event by eid from backend
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
    throw error;
  }
};

// Helper function to update event in backend
const updateEvent = async (eventData, userToken) => {
  try {
    const response = await fetch('http://localhost:3001/api/event', {
      method: 'POST', // Your backend uses POST for both create and update
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify(eventData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update event');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

function EditEvent() {
  const navigate = useNavigate();
  const { eid } = useParams(); // Get event ID from URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [originalEvent, setOriginalEvent] = useState(null);
  const [form, setForm] = useState({
    eventName: '',
    eventDescription: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    skills: [],
    urgency: '',
    availability: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

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

  // Get user token and role when user changes
  useEffect(() => {
    const getTokenAndRole = async () => {
      if (user) {
        try {
          const token = await user.getIdToken();
          setUserToken(token);
          
          // Get user role from token claims
          const tokenResult = await user.getIdTokenResult();
          const role = tokenResult.claims.role;
          setUserRole(role);
          
          console.log('User role:', role);
        } catch (error) {
          console.error('Error getting token:', error);
        }
      }
    };

    getTokenAndRole();
  }, [user]);

  // Fetch event data when token and eid are available
  useEffect(() => {
    const fetchEvent = async () => {
      if (userToken && eid) {
        try {
          setLoading(true);
          const eventData = await getEventById(eid, userToken);
          setOriginalEvent(eventData);
          
          // Parse address back into address1 and address2
          const addressParts = eventData.address ? eventData.address.split(' ') : [];
          let address1 = '';
          let address2 = '';
          
          if (addressParts.length > 0) {
            // Simple logic: assume last part might be address2 if it looks like apt/suite
            const lastPart = addressParts[addressParts.length - 1];
            if (lastPart.toLowerCase().includes('apt') || lastPart.toLowerCase().includes('suite') || 
                lastPart.toLowerCase().includes('#') || /^\d+[a-zA-Z]?$/.test(lastPart)) {
              address2 = lastPart;
              address1 = addressParts.slice(0, -1).join(' ');
            } else {
              address1 = eventData.address;
            }
          }
          
          // Populate form with existing data
          setForm({
            eventName: eventData.eventname || '',
            eventDescription: eventData.eventdescription || '',
            address1: address1,
            address2: address2,
            city: eventData.city || '',
            state: eventData.state || '',
            zip: eventData.zip || '',
            skills: eventData.skills || [],
            urgency: eventData.urgency || '',
            availability: eventData.availability ? eventData.availability.map(date => new Date(date)) : [],
          });
          
          setFetchError(null);
        } catch (error) {
          console.error('Error loading event:', error);
          setFetchError('Failed to load event data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEvent();
  }, [userToken, eid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleDateChange = (date) => {
    if (!date) return;
    const exists = form.availability.some(
      (d) => new Date(d).toDateString() === date.toDateString()
    );
    if (!exists) {
      setForm({ ...form, availability: [...form.availability, date] });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.eventName) newErrors.eventName = 'Required';
    if (!form.address1) newErrors.address1 = 'Required';
    if (!form.city) newErrors.city = 'Required';
    if (!form.state) newErrors.state = 'Required';
    if (!form.urgency) newErrors.urgency = 'Required';
    if (!form.zip || form.zip.length < 5) newErrors.zip = 'At least 5 digits';
    if (form.skills.length === 0) newErrors.skills = 'Select at least one skill';
    if (form.availability.length === 0) newErrors.availability = 'Pick at least one date';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0 && user && userToken && originalEvent) {
      setIsSubmitting(true);
      
      try {
        // Map form data to backend expected format
        const eventData = {
          eid: originalEvent.eid, // Keep original eid
          uid: originalEvent.uid, // Keep original uid
          role: userRole,
          eventname: form.eventName,
          eventdescription: form.eventDescription,
          address: form.address1 + (form.address2 ? ` ${form.address2}` : ''),
          city: form.city,
          state: form.state,
          zip: form.zip,
          skills: form.skills,
          urgency: form.urgency,
          availability: form.availability.map(date => date.toISOString().split('T')[0])
,
        };

        console.log('Updating event data:', eventData);

        // Update in backend
        const result = await updateEvent(eventData, userToken);
        console.log('Event updated successfully:', result);
        
        // Navigate back to manage events page
        navigate('/manage-event');
        
      } catch (error) {
        console.error('Failed to update event:', error);
        setErrors({ submit: error.message || 'Failed to update event. Please try again.' });
      } finally {
        setIsSubmitting(false);
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

  // Show error if there's an issue fetching the event
  if (fetchError) {
    return (
      <div className="page-wrapper profile-scroll">
        <div className="profile-container">
          <div style={{ textAlign: 'center' }}>
            <h2>Error Loading Event</h2>
            <p>{fetchError}</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <button 
                onClick={() => navigate('/manage-event')}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Back to Events
              </button>
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
      </div>
    );
  }

  return (
    <div className="page-wrapper profile-scroll">
      <div className="profile-container">
        <h2>Edit Event</h2>
        
        {errors.submit && (
          <div className="form-error" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee', borderRadius: '4px' }}>
            {errors.submit}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="eventName">Event Name</label>
            <input
              id="eventName"
              name="eventName"
              placeholder="Enter Event Name"
              maxLength="50"
              value={form.eventName}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.eventName && <p className="form-error">{errors.eventName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="eventDescription">Event Description</label>
            <textarea
              id="eventDescription"
              name="eventDescription"
              placeholder="Set a description"
              value={form.eventDescription}
              onChange={handleChange}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="address1">Address 1</label>
            <input
              id="address1"
              name="address1"
              placeholder="Street address"
              maxLength="100"
              value={form.address1}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.address1 && <p className="form-error">{errors.address1}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="address2">Address 2</label>
            <input
              id="address2"
              name="address2"
              placeholder="Apt, suite, etc. (optional)"
              maxLength="100"
              value={form.address2}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="inline-group">
            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                placeholder="City"
                maxLength="100"
                value={form.city}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              {errors.city && <p className="form-error">{errors.city}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="state">State</label>
              <select
                id="state"
                name="state"
                value={form.state}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select State</option>
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.state && <p className="form-error">{errors.state}</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="zip">Zip Code</label>
            <input
              id="zip"
              name="zip"
              placeholder="Zip Code"
              maxLength="9"
              value={form.zip}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            {errors.zip && <p className="form-error">{errors.zip}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills</label>
            <Select
              isMulti
              name="skills"
              options={SKILL_OPTIONS}
              placeholder="Select your skills"
              className="custom-select-container"
              classNamePrefix="react-select"
              value={SKILL_OPTIONS.filter((opt) => form.skills.includes(opt.value))}
              onChange={(selectedOptions) =>
                setForm({
                  ...form,
                  skills: selectedOptions ? selectedOptions.map((opt) => opt.value) : [],
                })
              }
              isDisabled={isSubmitting}
            />
            {errors.skills && <p className="form-error">{errors.skills}</p>}
          </div>

          <div className="form-group">
              <label htmlFor="urgency">Urgency Level</label>
              <select
                id="urgency"
                name="urgency"
                value={form.urgency}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="">Select Urgency Level</option>
                {Urgency_LVL.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.urgency && <p className="form-error">{errors.urgency}</p>}
            </div>

          <div className="form-group">
            <label>Date</label>
            <DatePicker
              selected={null}
              onChange={handleDateChange}
              placeholderText="Click to add more dates"
              className="date-picker"
              disabled={isSubmitting}
            />
            {form.availability.length > 0 && (
              <ul className="selected-dates">
                {form.availability.map((d, i) => (
                  <li key={i}>
                    {new Date(d).toLocaleDateString()}
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          availability: form.availability.filter((_, index) => index !== i),
                        })
                      }
                      disabled={isSubmitting}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.availability && <p className="form-error">{errors.availability}</p>}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating Event...' : 'Update Event'}
            </button>
            <button
                type="button"
                onClick={() => navigate('/manage-event')}
                disabled={isSubmitting}
                style={{ 
                  padding: '0.5rem 1rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1
                }}
              >
                Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditEvent;
