import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/StudentSessions.css";

function StudentSessions() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/sessions/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Student sessions error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load your sessions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="student-sessions-page">

      {/* Navbar */}
      <nav className="student-sessions-navbar">

        <button
          className="sessions-logo"
          onClick={() => navigate("/dashboard")}
        >
          SkillBridge
        </button>

        <button
          className="back-dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </nav>

      {/* Main */}
      <main className="student-sessions-content">

        <div className="sessions-page-header">

          <span>LEARNING ACTIVITY</span>

          <h1>My Learning Sessions</h1>

          <p>
            Track your mentor requests and learning sessions
            in one place.
          </p>

        </div>

        {/* Loading */}
        {loading && (
          <div className="student-session-message">
            Loading your sessions...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="student-session-error">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && sessions.length === 0 && (
          <div className="student-empty-sessions">

            <div className="empty-session-icon">
              📅
            </div>

            <h2>No learning sessions yet</h2>

            <p>
              Find a mentor and send a learning request
              to start your journey.
            </p>

            <button
              onClick={() => navigate("/mentors")}
            >
              Find a Mentor →
            </button>

          </div>
        )}

        {/* Sessions */}
        {!loading && !error && sessions.length > 0 && (
          <div className="student-sessions-list">

            {sessions.map((session) => (

              <div
                className="student-session-card"
                key={session._id}
              >

                {/* Top */}
                <div className="student-session-top">

                  <div className="mentor-avatar">
                    {session.mentor?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "M"}
                  </div>

                  <div>
                    <h2>
                      {session.mentor?.name ||
                        "Mentor"}
                    </h2>

                    <p>
                      Learning Session
                    </p>
                  </div>

                  <span
                    className={`student-session-status ${
                      session.status?.toLowerCase() || ""
                    }`}
                  >
                    {session.status || "Pending"}
                  </span>

                </div>

                {/* Details */}
                <div className="student-session-details">

                  <div>
                    <span>DATE</span>
                    <strong>
                      {session.date || "Not set"}
                    </strong>
                  </div>

                  <div>
                    <span>TIME</span>
                    <strong>
                      {session.time || "Not set"}
                    </strong>
                  </div>

                </div>

                {/* Message */}
                {session.message && (
                  <div className="student-session-message-box">

                    <span>MESSAGE</span>

                    <p>
                      {session.message}
                    </p>

                  </div>
                )}

                {/* Accepted */}
                {session.status?.toLowerCase() ===
                  "accepted" && (

                  <div className="learning-session-box">

                    <div>
                      <span>READY TO LEARN?</span>

                      <h3>
                        Your learning session is confirmed.
                      </h3>
                    </div>

                    
                    
                      <button
  onClick={() =>
    navigate("/learning-session", {
      state: {
        session: session,
      },
    })
  }
>
  Open Session →
</button>

                  </div>
                )}

              </div>

            ))}

          </div>
        )}

      </main>

    </div>
  );
}

export default StudentSessions;