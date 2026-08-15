
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import Mentors from "./pages/Mentors";
import MentorProfile from "./pages/MentorProfile";

import MentorDashboard from "./pages/MentorDashboard";
import MyExpertise from "./pages/MyExpertise";
import StudentRequests from "./pages/StudentRequests";
import MySessions from "./pages/MySessions";
import MySkills from "./pages/MySkills";
import MyPortfolio from "./pages/MyPortfolio";
import StudentSessions from "./pages/StudentSessions";
import LearningSession from "./pages/LearningSession";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            Landing
        ========================= */}
        <Route
          path="/"
          element={<Landing />}
        />

        {/* =========================
            Authentication
        ========================= */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* =========================
            Student Dashboard
        ========================= */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* =========================
            Student - Browse Mentors
        ========================= */}
        <Route
          path="/mentors"
          element={<Mentors />}
        />

        {/* =========================
            Student - Mentor Profile
        ========================= */}
        <Route
          path="/mentor-profile"
          element={<MentorProfile />}
        />

        {/* =========================
            Mentor Dashboard
        ========================= */}
        <Route
          path="/mentor-dashboard"
          element={<MentorDashboard />}
        />

        {/* =========================
            Mentor - My Expertise
        ========================= */}
        <Route
          path="/my-expertise"
          element={<MyExpertise />}
        />



{/* Student - Manage Skills */}
<Route
  path="/my-skills"
  element={<MySkills />}
/>




<Route
  path="/my-portfolio"
  element={<MyPortfolio />}
/>



        {/* =========================
            Mentor - Student Requests
        ========================= */}
        <Route
          path="/student-requests"
          element={<StudentRequests />}
        />

        {/* =========================
            Mentor - My Sessions
        ========================= */}
        <Route
          path="/my-sessions"
          element={<MySessions />}
        />


<Route
  path="/student-sessions"
  element={<StudentSessions />}
/>


<Route
  path="/learning-session"
  element={<LearningSession />}
/>



      </Routes>
    </BrowserRouter>
  );
}

export default App;