import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import './Profile.css';

const US_STATES = [
  { code: 'TX', name: 'Texas' },
  { code: 'CA', name: 'California' },
  { code: 'NY', name: 'New York' },
  { code: 'FL', name: 'Florida' },
  { code: 'IL', name: 'Illinois' },
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      console.log('Admin profile submitted:', form);
      localStorage.setItem('isProfileComplete', 'true');
      navigate('/event-management');
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
