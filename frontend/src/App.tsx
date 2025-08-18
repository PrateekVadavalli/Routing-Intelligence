import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardSelect from "./pages/DashboardSelect";
import Login from "./pages/Login.tsx";
import AdminDashboard from "./pages/AdminDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import StudentDashboard from "./pages/StudentDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
      </Routes>
    </Router>
  );
}
