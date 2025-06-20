import './Login.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and password are required.');
      setSuccess('');
    } else if (password !== confirm) {
      setError('Passwords do not match.');
      setSuccess('');
    } else {
      setError('');
      localStorage.setItem('isProfileComplete', 'false');
      setSuccess('Registration successful! Redirecting to login...');
      console.log('Registering:', { name, email, password });

      // Simulate delay before redirecting to login page
      setTimeout(() => {
        navigate(isAdmin ? '/admin-profile' : '/login');
      }, 2000);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-page">
        <div className="login-left">
          <div className="login-container">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <div className="form-group">
  <label htmlFor="role">Registering as</label>
  <select
    id="role"
    value={isAdmin ? 'admin' : 'volunteer'}
    onChange={(e) => setIsAdmin(e.target.value === 'admin')}
  >
    <option value="volunteer">Volunteer</option>
    <option value="admin">Administrator</option>
  </select>
</div>

              <button type="submit">Sign Up</button>
              {error && <p className="form-error">{error}</p>}
              {success && <p className="form-success">{success}</p>}
            </form>
            <p className="signup-prompt">
              Already have an account? <Link to="/login">Log in here</Link>
            </p>
          </div>
        </div>

        <div className="login-right">
          <div className="mission">
            <h1>Join Our Community</h1>
            <p>
              Become part of a network of volunteers committed to creating positive change. Sign up and start making a difference today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
