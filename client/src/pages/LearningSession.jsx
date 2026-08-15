import { useLocation, useNavigate } from "react-router-dom";
import "../styles/LearningSession.css";

function LearningSession() {
  const navigate = useNavigate();
  const location = useLocation();

  // Session data passed from StudentSessions
  const session = location.state?.session;

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
            <h2>Session not found</h2>

            <p>
              Please open the learning session from your
              My Sessions page.
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

  return (
    <div className="learning-page">

      {/* Navbar */}
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

      {/* Main */}
      <main className="learning-content">

        {/* Header */}
        <div className="learning-header">

          <span>LEARNING SESSION</span>

          <h1>
            Your session is confirmed.
          </h1>

          <p>
            Connect with your mentor and continue your
            learning journey.
          </p>

        </div>

        {/* Main Session Card */}
        <div className="learning-card">

          {/* Mentor */}
          <div className="learning-top">

            <div className="learning-avatar">
              {session.mentor?.name
                ?.charAt(0)
                ?.toUpperCase() || "M"}
            </div>

            <div>
              <span className="small-label">
                YOUR MENTOR
              </span>

              <h2>
                {session.mentor?.name || "Mentor"}
              </h2>
            </div>

            <span className="confirmed-status">
              ● Accepted
            </span>

          </div>

          {/* Details */}
          <div className="learning-details">

            <div className="learning-detail">

              <span>DATE</span>

              <strong>
                {session.date || "Not set"}
              </strong>

            </div>

            <div className="learning-detail">

              <span>TIME</span>

              <strong>
                {session.time || "Not set"}
              </strong>

            </div>

            <div className="learning-detail">

              <span>SESSION TYPE</span>

              <strong>
                Mentoring
              </strong>

            </div>

          </div>

          {/* Message */}
          {session.message && (
            <div className="learning-message">

              <span>YOUR MESSAGE</span>

              <p>
                {session.message}
              </p>

            </div>
          )}

          {/* Session Area */}
          <div className="session-start-area">

            <div className="session-start-icon">
              🎓
            </div>

            <h2>
              Ready to learn?
            </h2>

            <p>
              Your mentor has accepted your request.
              You can start your learning session here.
            </p>

            <button
              className="start-session-btn"
              onClick={() =>
                alert(
                  "Live learning session will be connected here next."
                )
              }
            >
              Start Learning Session →
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default LearningSession;