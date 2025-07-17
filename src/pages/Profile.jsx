import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import './Profile.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { getAuth } from 'firebase/auth';
import { useEffect } from 'react';

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
  

function Profile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    skills: [],
    preferences: '',
    availability: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) return;
  
      try {
        const res = await fetch(`http://localhost:3001/api/profile/${user.uid}`);
        if (!res.ok) {
          console.warn('No profile found for user:', user.uid);
          return;
        }
  
        const profile = await res.json();
  
        setForm({
          fullName: profile.name || '',
          address1: profile.address || '',
          address2: profile.address2 || '',
          city: profile.city || '',
          state: profile.state || '',
          zip: profile.zip || '',
          skills: profile.skills || [],
          preferences: profile.preferences || '',
          availability: profile.availability?.map(d => new Date(d)) || [],
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
  
    fetchProfile();
  }, []);

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
    if (!form.fullName) newErrors.fullName = 'Required';
    if (!form.address1) newErrors.address1 = 'Required';
    if (!form.city) newErrors.city = 'Required';
    if (!form.state) newErrors.state = 'Required';
    if (!form.zip || form.zip.length < 5) newErrors.zip = 'At least 5 digits';
    if (form.skills.length === 0) newErrors.skills = 'Select at least one skill';
    if (form.availability.length === 0) newErrors.availability = 'Pick at least one date';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
  
    if (Object.keys(validationErrors).length > 0) return;
  
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      alert('User not authenticated');
      return;
    }
  
    const profileData = {
      uid: user.uid,
      role: 'volunteer',
      name: form.fullName,
      address: form.address1,
      address2: form.address2,
      city: form.city,
      state: form.state,
      zip: form.zip,
      skills: form.skills,
      preferences: form.preferences,
      availability: form.availability.map(d => d.toISOString().split('T')[0]),

    };
  
    try {
      const res = await fetch('http://localhost:3001/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
  
      if (res.ok) {
        localStorage.setItem('isProfileComplete', 'true');
        navigate('/volunteer-dashboard');
      } else {
        const result = await res.json();
        alert('Failed to save profile: ' + (result.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="page-wrapper profile-scroll">
      <div className="profile-container">
        <h2>User Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              placeholder="Enter full name"
              maxLength="50"
              value={form.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <p className="form-error">{errors.fullName}</p>}
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
            />
            {errors.skills && <p className="form-error">{errors.skills}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="preferences">Preferences</label>
            <textarea
              id="preferences"
              name="preferences"
              placeholder="Optional notes or preferences"
              value={form.preferences}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Availability Dates</label>
            <DatePicker
              selected={null}
              onChange={handleDateChange}
              placeholderText="Click to select a date"
              className="date-picker"
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
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {errors.availability && <p className="form-error">{errors.availability}</p>}
          </div>

          <button type="submit" style={{ marginTop: '1rem' }}>
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
