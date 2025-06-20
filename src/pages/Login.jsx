import './Login.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Email and password are required.');
    } else {
      setError('');
      console.log('Logging in with:', { email, password });

      const isProfileComplete = localStorage.getItem('isProfileComplete');
      if (isProfileComplete === 'true') {
        navigate('/volunteer-dashboard'); // Redirect if profile is already completed
      } else {
        navigate('/profile'); // Redirect to profile page for first-time users
      }
    }
  };

  return (
    <div className="page-wrapper">
      <div className="login-page">
        <div className="login-left">
          <div className="login-container">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
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
              <button type="submit">Login</button>
              {error && <p className="form-error">{error}</p>}
            </form>
            <p className="signup-prompt">
              Don’t have an account? <Link to="/register">Sign up here</Link>
            </p>
          </div>
        </div>

        <div className="login-right">
          <div className="mission">
            <h1>Our Mission</h1>
            <p>
              We connect volunteers with meaningful opportunities to serve their communities. By making it easy to discover, sign up for, and participate in events, we help create stronger, more compassionate neighborhoods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
