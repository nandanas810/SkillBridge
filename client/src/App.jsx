import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Mentors from "./pages/Mentors";
import MentorProfile from "./pages/MentorProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/mentors"
          element={<Mentors />}
        />

        <Route
          path="/mentor-profile"
          element={<MentorProfile />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;