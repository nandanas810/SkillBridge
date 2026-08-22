
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import Mentors from "./pages/Mentors";
import MentorProfile from "./pages/Mentorprofile";

import MySkills from "./pages/MySkills";
import MyPortfolio from "./pages/MyPortfolio";
import StudentSessions from "./pages/StudentSessions";
import LearningSession from "./pages/LearningSession";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =========================
            LANDING
        ========================= */}

        <Route
          path="/"
          element={<Landing />}
        />

        {/* =========================
            AUTHENTICATION
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
            PEER DASHBOARD
        ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* =========================
            FIND PEERS
        ========================= */}

        <Route
          path="/mentors"
          element={<Mentors />}
        />

        {/* Peer-friendly URL */}
        <Route
          path="/peers"
          element={<Mentors />}
        />

        {/* =========================
            PEER PROFILE
        ========================= */}

        <Route
          path="/mentor-profile"
          element={<MentorProfile />}
        />

        {/* =========================
            MY SKILLS
        ========================= */}

        <Route
          path="/my-skills"
          element={<MySkills />}
        />

        {/* =========================
            MY PORTFOLIO
        ========================= */}

        <Route
          path="/my-portfolio"
          element={<MyPortfolio />}
        />

        {/* =========================
            MY LEARNING SESSIONS
        ========================= */}

        <Route
          path="/student-sessions"
          element={<StudentSessions />}
        />

        {/* =========================
            LEARNING SESSION
        ========================= */}

        <Route
          path="/learning-session"
          element={<LearningSession />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;