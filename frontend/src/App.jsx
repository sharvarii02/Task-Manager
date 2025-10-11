import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import TaskManagerLogin from './pages/Login.jsx';
import TaskManagerRegistration from './pages/Register.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<TaskManagerLogin />} />
      <Route path="/register" element={<TaskManagerRegistration />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
