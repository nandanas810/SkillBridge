import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/MySessions.css";

function MySessions() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        "http://localhost:5000/api/sessions/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSessions(response.data.sessions);
    } catch (err) {
      console.error("Fetch sessions error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load your sessions"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "Accepted") {
      return "session-status accepted";
    }

    if (status === "Rejected") {
      return "session-status rejected";
    }

    return "session-status pending";
  };

  return (
    <div className="my-sessions-page">

      <div className="my-sessions-container">

        {/* BACK BUTTON */}
        <button
          className="sessions-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        {/* HEADER */}
        <div className="my-sessions-header">
          <span className="sessions-label">
            MENTORING
          </span>

          <h1>My Sessions</h1>

          <p>
            Track your mentoring session requests and
            their status.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="sessions-loading">
            <span className="sessions-loading-dot"></span>
            Loading your sessions...
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="sessions-error">
            {error}
          </div>
        )}

        {/* NO SESSIONS */}
        {!loading && !error && sessions.length === 0 && (
          <div className="sessions-empty">

            <div className="sessions-empty-icon">
              📅
            </div>

            <h2>No sessions yet</h2>

            <p>
              You haven't requested any mentoring
              sessions yet.
            </p>

          </div>
        )}

        {/* SESSIONS */}
        {!loading && !error && sessions.length > 0 && (
          <div className="sessions-list">

            {sessions.map((session) => (
              <div
                className="session-card"
                key={session._id}
              >

                {/* CARD HEADER */}
                <div className="session-card-header">

                  <div className="session-avatar">
                    {session.mentor?.name
                      ?.charAt(0)
                      ?.toUpperCase() || "M"}
                  </div>

                  <div>
                    <h2>
                      {session.mentor?.name || "Mentor"}
                    </h2>

                    <p>
                      {session.mentor?.email ||
                        "Email not available"}
                    </p>
                  </div>

                </div>

                {/* SESSION DETAILS */}
                <div className="session-details">

                  <div className="session-detail">
                    <span className="session-detail-label">
                      DATE
                    </span>

                    <span className="session-detail-value">
                      📅 {session.date}
                    </span>
                  </div>

                  <div className="session-detail">
                    <span className="session-detail-label">
                      TIME
                    </span>

                    <span className="session-detail-value">
                      🕐 {session.time}
                    </span>
                  </div>

                </div>

                {/* MESSAGE */}
                <div className="session-message">

                  <span className="session-detail-label">
                    MESSAGE
                  </span>

                  <p>
                    {session.message || "No message"}
                  </p>

                </div>

                {/* STATUS */}
                <div className="session-status-row">

                  <span className="session-detail-label">
                    STATUS
                  </span>

                  <span
                    className={getStatusClass(
                      session.status
                    )}
                  >
                    <span className="status-dot"></span>
                    {session.status}
                  </span>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default MySessions;