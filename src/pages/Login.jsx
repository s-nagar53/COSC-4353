import './Login.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();
  
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const tokenResult = await user.getIdTokenResult();
      const role = tokenResult.claims.role;
  
      // Fetch profile
      const res = await fetch(`http://localhost:3001/api/profile/${user.uid}`);
      const profile = res.ok ? await res.json() : null;
  
      const isComplete =
        profile &&
        profile.name &&
        profile.address &&
        profile.city &&
        profile.state &&
        profile.zip &&
        Array.isArray(profile.skills) &&
        profile.skills.length > 0 &&
        Array.isArray(profile.availability) &&
        profile.availability.length > 0;
  
      // Redirect based on role and profile status
      if (role === 'admin') {
        navigate(profile ? '/admin-dashboard' : '/admin-profile');
      } else if (role === 'volunteer') {
        navigate(isComplete ? '/volunteer-dashboard' : '/profile');
      } else {
        setError('No role assigned. Contact support.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
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
