import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import './Profile.css';
import { getAuth } from 'firebase/auth';
import { useEffect } from 'react';

const US_STATES = [
  { code: 'AL', name: 'Alabama', region: 'South' },
  { code: 'AK', name: 'Alaska', region: 'West' },
  { code: 'AZ', name: 'Arizona', region: 'West' },
  { code: 'AR', name: 'Arkansas', region: 'South' },
  { code: 'CA', name: 'California', region: 'West' },
  { code: 'CO', name: 'Colorado', region: 'West' },
  { code: 'CT', name: 'Connecticut', region: 'Northeast' },
  { code: 'DE', name: 'Delaware', region: 'South' },
  { code: 'FL', name: 'Florida', region: 'South' },
  { code: 'GA', name: 'Georgia', region: 'South' },
  { code: 'HI', name: 'Hawaii', region: 'West' },
  { code: 'ID', name: 'Idaho', region: 'West' },
  { code: 'IL', name: 'Illinois', region: 'Midwest' },
  { code: 'IN', name: 'Indiana', region: 'Midwest' },
  { code: 'IA', name: 'Iowa', region: 'Midwest' },
  { code: 'KS', name: 'Kansas', region: 'Midwest' },
  { code: 'KY', name: 'Kentucky', region: 'South' },
  { code: 'LA', name: 'Louisiana', region: 'South' },
  { code: 'ME', name: 'Maine', region: 'Northeast' },
  { code: 'MD', name: 'Maryland', region: 'South' },
  { code: 'MA', name: 'Massachusetts', region: 'Northeast' },
  { code: 'MI', name: 'Michigan', region: 'Midwest' },
  { code: 'MN', name: 'Minnesota', region: 'Midwest' },
  { code: 'MS', name: 'Mississippi', region: 'South' },
  { code: 'MO', name: 'Missouri', region: 'Midwest' },
  { code: 'MT', name: 'Montana', region: 'West' },
  { code: 'NE', name: 'Nebraska', region: 'Midwest' },
  { code: 'NV', name: 'Nevada', region: 'West' },
  { code: 'NH', name: 'New Hampshire', region: 'Northeast' },
  { code: 'NJ', name: 'New Jersey', region: 'Northeast' },
  { code: 'NM', name: 'New Mexico', region: 'West' },
  { code: 'NY', name: 'New York', region: 'Northeast' },
  { code: 'NC', name: 'North Carolina', region: 'South' },
  { code: 'ND', name: 'North Dakota', region: 'Midwest' },
  { code: 'OH', name: 'Ohio', region: 'Midwest' },
  { code: 'OK', name: 'Oklahoma', region: 'South' },
  { code: 'OR', name: 'Oregon', region: 'West' },
  { code: 'PA', name: 'Pennsylvania', region: 'Northeast' },
  { code: 'RI', name: 'Rhode Island', region: 'Northeast' },
  { code: 'SC', name: 'South Carolina', region: 'South' },
  { code: 'SD', name: 'South Dakota', region: 'Midwest' },
  { code: 'TN', name: 'Tennessee', region: 'South' },
  { code: 'TX', name: 'Texas', region: 'South' },
  { code: 'UT', name: 'Utah', region: 'West' },
  { code: 'VT', name: 'Vermont', region: 'Northeast' },
  { code: 'VA', name: 'Virginia', region: 'South' },
  { code: 'WA', name: 'Washington', region: 'West' },
  { code: 'WV', name: 'West Virginia', region: 'South' },
  { code: 'WI', name: 'Wisconsin', region: 'Midwest' },
  { code: 'WY', name: 'Wyoming', region: 'West' },
  // US Territories (optional)
  { code: 'DC', name: 'District of Columbia', region: 'South' },
  { code: 'PR', name: 'Puerto Rico', region: 'Territory' },
  { code: 'VI', name: 'US Virgin Islands', region: 'Territory' },
  { code: 'AS', name: 'American Samoa', region: 'Territory' },
  { code: 'GU', name: 'Guam', region: 'Territory' },
  { code: 'MP', name: 'Northern Mariana Islands', region: 'Territory' }
];

function AdminProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    verificationKey: '',
  });

  const [errors, setErrors] = useState({});
  const VALID_KEY = 'secure-admin-2025'; // Update this key securely in production

  useEffect(() => {
    const fetchProfile = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (!user) return;
  
      try {
        const res = await fetch(`http://localhost:3001/api/profile/${user.uid}`);
        if (!res.ok) {
          console.warn('No profile found for admin:', user.uid);
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
          verificationKey: '', // don't pre-fill this for security
        });
      } catch (err) {
        console.error('Failed to load admin profile:', err);
      }
    };
  
    fetchProfile();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = 'Required';
    if (!form.address1) newErrors.address1 = 'Required';
    if (!form.city) newErrors.city = 'Required';
    if (!form.state) newErrors.state = 'Required';
    if (!form.zip || form.zip.length < 5) newErrors.zip = 'At least 5 digits';
    if (!form.verificationKey || form.verificationKey !== VALID_KEY)
      newErrors.verificationKey = 'Invalid or missing verification key';
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
      role: 'admin',
      name: form.fullName,
      address: form.address1,
      address2: form.address2,
      city: form.city,
      state: form.state,
      zip: form.zip,
    };
  
    try {
      const res = await fetch('http://localhost:3001/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
  
      if (res.ok) {
        localStorage.setItem('isProfileComplete', 'true');
        navigate('/admin-dashboard');
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
        <h2>Admin Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              placeholder="Enter full name"
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
            <label htmlFor="verificationKey">Admin Verification Key</label>
            <input
              id="verificationKey"
              name="verificationKey"
              placeholder="Enter your admin key"
              value={form.verificationKey}
              onChange={handleChange}
            />
            {errors.verificationKey && (
              <p className="form-error">{errors.verificationKey}</p>
            )}
          </div>

          <button type="submit" style={{ marginTop: '1rem' }}>
            Save Admin Profile
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminProfile;
