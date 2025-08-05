import './Login.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust if needed



function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  /*
  const handleRegister = async (e) => {
    e.preventDefault();
  
    if (!email || !password) {
      setError('Email and password are required.');
      setSuccess('');
      return;
    }
  
    if (password !== confirm) {
      setError('Passwords do not match.');
      setSuccess('');
      return;
    }
  
    try {
      // 1. Register user with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // 2. Assign role via backend
      const role = isAdmin ? 'admin' : 'volunteer';
      console.log('Assigning role:', role, 'for UID:', user.uid);

      const idToken = await user.getIdToken();

    await fetch('/api/set-role', {
      method: 'POST',
      headers: {
    'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ role }),
    });
  
      // 3. Set profile completion status and redirect
      localStorage.setItem('isProfileComplete', 'false');
      setSuccess(
        `Registration successful! Redirecting to ${isAdmin ? 'Admin Profile' : 'Login'}...`
      );
      setError('');
  
      setTimeout(() => {
        navigate(isAdmin ? '/admin-profile' : '/login');

      }, 2000);
    } catch (error) {
      setError(error.message);
      setSuccess('');
    }
  };
*/
const handleRegister = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    setError('Email and password are required.');
    setSuccess('');
    return;
  }

  if (password !== confirm) {
    setError('Passwords do not match.');
    setSuccess('');
    return;
  }

  try {
    // 1. Register user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Assign role
    const role = isAdmin ? 'admin' : 'volunteer';
    console.log('Assigning role:', role, 'for UID:', user.uid);

    const idToken = await user.getIdToken();

    await fetch('http://localhost:3001/set-role', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ role }),
    });

    // ✅ 3. Save to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email: user.email,
      role,
      createdAt: new Date().toISOString(),
      history: []
    });

    // 4. Set localStorage + redirect
    localStorage.setItem('isProfileComplete', 'false');
    setSuccess(
      `Registration successful! Redirecting to ${isAdmin ? 'Admin Profile' : 'Login'}...`
    );
    setError('');

    setTimeout(() => {
      navigate(isAdmin ? '/admin-profile' : '/login');
    }, 2000);
  } catch (error) {
    setError(error.message);
    setSuccess('');
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
