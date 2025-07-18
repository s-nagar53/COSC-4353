import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Login from './pages/Login';
import Register from './pages/Register'; 
import Profile from './pages/Profile';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import CreateEvent from './pages/CreateEvent';
import ManageEvent from './pages/ManageEvent';
import EditEvent from './pages/EditEvent';
import VolunteerMatchingForm from './pages/VolunteerMatchingForm';
import NotificationPage from './pages/NotificationPage';
import VolunteerHistoryPage from './pages/VolunteerHistoryPage';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/volunteer-dashboard" element={<VolunteerDashboard user={user} />} />
        <Route path="/admin-dashboard" element={<AdminDashboard user={user} />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/manage-event" element={<ManageEvent />} />
        <Route path="/edit-event/:eid" element={<EditEvent />} />
        <Route path="/volunteer-matching" element={<VolunteerMatchingForm />} />
        <Route path="/notification" element={<NotificationPage />} />
        <Route path="/volunteer-history" element={<VolunteerHistoryPage />} />
      </Routes>
    </Router>
  );
}

export default App;
