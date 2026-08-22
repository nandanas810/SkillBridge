import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "../styles/LearningSession.css";

function LearningSession() {
  const navigate = useNavigate();
  const location = useLocation();

  const session = location.state?.session;

  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // SESSION NOT FOUND
  // =====================================================

  if (!session) {
    return (
      <div className="learning-page">

        <nav className="learning-navbar">

          <button
            className="learning-logo"
            onClick={() => navigate("/dashboard")}
          >
            SkillBridge
          </button>

          <button
            className="back-btn"
            onClick={() => navigate("/student-sessions")}
          >
            ← My Sessions
          </button>

        </nav>

        <main className="learning-content">

          <div className="learning-empty">

            <h2>
              Session not found
            </h2>

            <p>
              Please open the learning session
              from your My Sessions page.
            </p>

            <button
              onClick={() => navigate("/student-sessions")}
            >
              Go to My Sessions →
            </button>

          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // CURRENT USER
  // =====================================================

  const storedUser =
    localStorage.getItem("user");

  let currentUser = null;

  try {
    currentUser = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    currentUser = null;
  }

  const currentUserId =
    currentUser?._id ||
    currentUser?.id;

  // =====================================================
  // GET ID SAFELY
  // =====================================================

  const getId = (value) => {
    if (!value) return null;

    if (typeof value === "string") {
      return value;
    }

    if (value._id) {
      return value._id.toString();
    }

    if (value.id) {
      return value.id.toString();
    }

    return null;
  };

  // =====================================================
  // FIND THE OTHER PERSON
  // =====================================================

  const senderId =
    getId(session.sender);

  const receiverId =
    getId(session.receiver);

  let peer = null;

  if (
    senderId &&
    currentUserId &&
    senderId === currentUserId.toString()
  ) {
    // Logged-in user sent the request
    peer = session.receiver;

  } else if (
    receiverId &&
    currentUserId &&
    receiverId === currentUserId.toString()
  ) {
    // Logged-in user received the request
    peer = session.sender;

  } else {
    // Fallback
    peer =
      session.receiver ||
      session.sender;
  }

  const peerName =
    peer?.name || "Your Peer";

  // =====================================================
  // SAME JITSI ROOM FOR BOTH USERS
  // =====================================================

  const meetingUrl =
    session.meetingUrl ||
    `https://meet.jit.si/SkillBridge-${session._id}`;

  // =====================================================
  // MARK COMPLETED
  // =====================================================

  const markCompleted = async () => {
    try {
      setCompleting(true);
      setError("");

      const token =
        localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/sessions/${session._id}/status`,
        {
          status: "Completed",
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      navigate("/student-sessions");

    } catch (err) {
      console.error(
        "COMPLETE SESSION ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Could not complete the session."
      );

    } finally {
      setCompleting(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="learning-page">

      {/* NAVBAR */}

      <nav className="learning-navbar">

        <button
          className="learning-logo"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          SkillBridge
        </button>

        <button
          className="back-btn"
          onClick={() =>
            navigate("/student-sessions")
          }
        >
          ← My Sessions
        </button>

      </nav>

      {/* MAIN */}

      <main className="learning-content">

        {/* HEADER */}

        <div className="learning-header">

          <span>
            PEER LEARNING SESSION
          </span>

          <h1>
            Ready to learn?
          </h1>

          <p>
            Connect with your peer and
            exchange your skills.
          </p>

        </div>

        {/* SESSION CARD */}

        <div className="learning-card">

          {/* PEER */}

          <div className="learning-top">

            <div className="learning-avatar">
              {peerName
                ?.charAt(0)
                ?.toUpperCase() || "P"}
            </div>

            <div>

              <span className="small-label">
                YOUR PEER
              </span>

              <h2>
                {peerName}
              </h2>

            </div>

          </div>

          {/* JOIN AREA */}

          <div className="session-start-area">

            <div className="session-start-icon">
              🤝
            </div>

            <h2>
              Start your skill exchange
            </h2>

            <p>
              Join the meeting with{" "}
              <strong>
                {peerName}
              </strong>{" "}
              to start your peer-learning
              session.
            </p>

            {error && (
              <div className="learning-error">
                {error}
              </div>
            )}

            {/* JOIN MEETING */}

            <a
              className="start-session-btn"
              href={meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Join Meeting →
            </a>

            <p className="session-room-note">
              You and your peer will join the
              same private SkillBridge meeting room.
            </p>

            {/* COMPLETE */}

            <button
              className="complete-session-btn"
              onClick={markCompleted}
              disabled={completing}
            >
              {completing
                ? "Completing..."
                : "✓ Mark Session Completed"}
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default LearningSession;