
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
      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please log in to view your sessions.");
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

      const fetchedSessions = response.data.sessions || [];

      // Show the newest session requests first.
      const sortedSessions = [...fetchedSessions].sort(
        (a, b) => {
          const dateA = new Date(
            `${a.date || ""} ${a.time || "00:00"}`
          ).getTime();

          const dateB = new Date(
            `${b.date || ""} ${b.time || "00:00"}`
          ).getTime();

          // If session dates are unavailable or equal,
          // preserve the order returned by the backend.
          if (
            !Number.isFinite(dateA) ||
            !Number.isFinite(dateB) ||
            dateA === dateB
          ) {
            return 0;
          }

          // Upcoming session dates first.
          return dateA - dateB;
        }
      );

      setSessions(sortedSessions);
    } catch (err) {
      console.error("Fetch sessions error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load your sessions."
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

    if (status === "Completed") {
      return "session-status completed";
    }

    return "session-status pending";
  };

  return (
    <div className="my-sessions-page">
      <div className="my-sessions-container">

        {/* BACK BUTTON */}
        <button
          type="button"
          className="sessions-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        {/* HEADER */}
        <div className="my-sessions-header">
          <span className="sessions-label">
            PEER LEARNING
          </span>

          <h1>My Sessions</h1>

          <p>
            Track your peer session requests and
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
        {!loading && error && (
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
              You haven't requested any peer sessions yet.
            </p>
          </div>
        )}

        {/* SESSIONS */}
        {!loading && !error && sessions.length > 0 && (
          <div className="sessions-list">
            {sessions.map((session) => {
              // Display the other participant's details.
              const currentUser = JSON.parse(
                sessionStorage.getItem("user") || "{}"
              );

              const currentUserId =
                currentUser._id || currentUser.id;

              const senderId =
                session.sender?._id || session.sender;

              const receiverId =
                session.receiver?._id || session.receiver;

              const isSender =
                String(senderId) === String(currentUserId);

              const peer = isSender
                ? session.receiver
                : session.sender;

              const peerName = peer?.name || "Peer";

              return (
                <div
                  className="session-card"
                  key={session._id}
                >
                  {/* CARD HEADER */}
                  <div className="session-card-header">
                    <div className="session-avatar">
                      {peerName
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <h2>{peerName}</h2>

                      <p>
                        {peer?.email ||
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
                        📅 {session.date || "Not specified"}
                      </span>
                    </div>

                    <div className="session-detail">
                      <span className="session-detail-label">
                        TIME
                      </span>

                      <span className="session-detail-value">
                        🕐 {session.time || "Not specified"}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MySessions;
