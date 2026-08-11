import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";

function MentorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.7-3.2 2.5-5 5.5-5s4.8 1.8 5.5 5" />
      <path d="M16 11a3 3 0 1 0 0-6" />
      <path d="M16 14c2.7 0 4.3 1.7 4.8 4" />
    </svg>
  );
}

function SkillsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
      <path d="M4 5.5v16" />
      <path d="M8 7h8" />
      <path d="M8 11h7" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
      <path d="M8 14h3" />
      <path d="M8 17h5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h11" />
      <path d="m11 6 4 4-4 4" />
    </svg>
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionError, setSessionError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      setSessionError("");

      const token = localStorage.getItem("token");

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
      setSessionError(
        error.response?.data?.message ||
          "Failed to load sessions"
      );
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="dashboard-page">

      {/* Navbar */}
      <nav className="dashboard-navbar">

        <div className="dashboard-logo">
          SkillBridge
        </div>

        <div className="dashboard-nav-right">
          <span className="dashboard-user-name">
            {user?.name || "Student"}
          </span>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

      </nav>


      <main className="dashboard-content">

        {/* Hero */}
        <section className="dashboard-hero">

          <div className="hero-content">

            <span className="hero-label">
              STUDENT DASHBOARD
            </span>

            <h1>
              Welcome back,{" "}
              <span>{user?.name || "Student"}</span>
            </h1>

            <p>
              Discover mentors, build your skills and
              make meaningful learning connections.
            </p>

          </div>

          <div className="hero-decoration">
            <div className="hero-orbit orbit-one"></div>
            <div className="hero-orbit orbit-two"></div>

            <div className="hero-center">
              SB
            </div>
          </div>

        </section>


        {/* Quick Actions */}
        <section className="quick-section">

          <div className="section-heading">
            <div>
              <span className="section-label">
                EXPLORE
              </span>

              <h2>
                What would you like to do?
              </h2>
            </div>
          </div>


          <div className="dashboard-cards">

            {/* Find Mentors */}
            <div className="dashboard-card">

              <div className="card-top">

                <div className="card-icon mentor-icon">
                  <MentorIcon />
                </div>

                <span className="card-number">
                  01
                </span>

              </div>

              <h3>
                Find Mentors
              </h3>

              <p>
                Connect with students and mentors who
                can help you develop the skills you want.
              </p>

              <button
                className="card-action"
                onClick={() => navigate("/mentors")}
              >
                <span>
                  Browse mentors
                </span>

                <ArrowIcon />
              </button>

            </div>


            {/* My Skills */}
            <div className="dashboard-card">

              <div className="card-top">

                <div className="card-icon skills-icon">
                  <SkillsIcon />
                </div>

                <span className="card-number">
                  02
                </span>

              </div>

              <h3>
                My Skills
              </h3>

              <p>
                Manage the skills you know and share your
                knowledge with other students.
              </p>

              <button className="card-action">
                <span>
                  Manage skills
                </span>

                <ArrowIcon />
              </button>

            </div>


            {/* My Sessions */}
            <div className="dashboard-card">

              <div className="card-top">

                <div className="card-icon session-icon">
                  <CalendarIcon />
                </div>

                <span className="card-number">
                  03
                </span>

              </div>

              <h3>
                My Sessions
              </h3>

              <p>
                Keep track of your learning and mentoring
                sessions in one place.
              </p>

              <button
                className="card-action"
                onClick={fetchSessions}
              >
                <span>
                  View sessions
                </span>

                <ArrowIcon />
              </button>

            </div>

          </div>

        </section>


        {/* Sessions */}
        <section className="sessions-section">

          <div className="sessions-header">

            <div>
              <span className="section-label">
                ACTIVITY
              </span>

              <h2>
                My Sessions
              </h2>

              <p>
                Your recent mentoring requests and sessions.
              </p>
            </div>

            <button
              className="refresh-button"
              onClick={fetchSessions}
            >
              Refresh
            </button>

          </div>


          {/* Loading */}
          {loadingSessions && (
            <div className="session-state">
              <div className="loading-dot"></div>

              <p>
                Loading your sessions...
              </p>
            </div>
          )}


          {/* Error */}
          {sessionError && (
            <div className="session-error">
              {sessionError}
            </div>
          )}


          {/* No Sessions */}
          {!loadingSessions &&
            !sessionError &&
            sessions.length === 0 && (

              <div className="no-sessions">

                <div className="empty-icon">
                  <CalendarIcon />
                </div>

                <h3>
                  No sessions yet
                </h3>

                <p>
                  Start your learning journey by finding
                  a mentor.
                </p>

                <button
                  onClick={() => navigate("/mentors")}
                >
                  Find a mentor
                  <ArrowIcon />
                </button>

              </div>
            )}


          {/* Sessions List */}
          {!loadingSessions &&
            sessions.length > 0 && (

              <div className="sessions-list">

                {sessions.map((session) => (

                  <div
                    className="session-card"
                    key={session._id}
                  >

                    <div className="session-main">

                      <div className="session-avatar">
                        {session.mentor?.name
                          ?.charAt(0)
                          ?.toUpperCase() || "M"}
                      </div>

                      <div className="session-info">

                        <h3>
                          {session.mentor?.name ||
                            "Mentor Session"}
                        </h3>

                        <p>
                          Mentoring session
                        </p>

                      </div>

                    </div>


                    <div className="session-meta">

                      <div className="meta-item">

                        <span className="meta-label">
                          DATE
                        </span>

                        <span>
                          {session.date}
                        </span>

                      </div>


                      <div className="meta-item">

                        <span className="meta-label">
                          TIME
                        </span>

                        <span>
                          {session.time}
                        </span>

                      </div>

                    </div>


                    <span
                      className={`session-status ${
                        session.status?.toLowerCase()
                      }`}
                    >
                      {session.status}
                    </span>


                    {session.message && (
                      <div className="session-message-box">

                        <span>
                          Message
                        </span>

                        <p>
                          {session.message}
                        </p>

                      </div>
                    )}

                  </div>

                ))}

              </div>
            )}

        </section>

      </main>

    </div>
  );
}

export default Dashboard;