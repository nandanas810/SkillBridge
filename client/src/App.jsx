
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Peers from "./pages/Peers";
import Peerprofile from "./pages/Peerprofile";

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
  path="/peers"
  element={<Peers />}
/>

        {/* =========================
            PEER PROFILE
        ========================= */}

      <Route
  path="/peer-profile"
  element={<Peerprofile />}
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