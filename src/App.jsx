import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import VolunteerHistoryPage from './pages/VolunteerHistoryPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/manage-event" element={<ManageEvent />} />
        <Route path="/edit-event/:id" element={<EditEvent />} />
        <Route path="/volunteer-matching" element={<VolunteerMatchingForm />} />
        <Route path="/volunteer-history" element={<VolunteerHistoryPage />} />

      </Routes>
    </Router>
  );
}

export default App;
