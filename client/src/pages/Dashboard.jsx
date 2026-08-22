import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  // =====================================================
  // USER
  // =====================================================

  const stored = localStorage.getItem("user");

  let user = null;

  try {
    user = stored ? JSON.parse(stored) : null;
  } catch {
    user = null;
  }

  const token = localStorage.getItem("token");

  // =====================================================
  // STATES
  // =====================================================

  const [sentSessions, setSentSessions] = useState([]);
  const [receivedSessions, setReceivedSessions] = useState([]);
  const [peers, setPeers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
  // GET MEETING URL
  // =====================================================

  const getMeetingUrl = (session) => {
    return (
      session.meetingUrl ||
      `https://meet.jit.si/SkillBridge-${session._id}`
    );
  };

  // =====================================================
  // OPEN LEARNING SESSION
  // =====================================================

  const openLearningSession = (session) => {
    navigate("/learning-session", {
      state: {
        session: {
          ...session,
          meetingUrl: getMeetingUrl(session),
        },
      },
    });
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        navigate("/login");
        return;
      }

      // =================================================
      // GET MY SESSIONS
      // =================================================

      const sessionResponse = await axios.get(
        "http://localhost:5000/api/sessions/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
        Backend returns:

        sessions = requests SENT by me
        received = requests SENT TO me
      */

      const sent = sessionResponse.data.sessions || [];
      const received = sessionResponse.data.received || [];

      console.log("SENT SESSIONS:", sent);
      console.log("RECEIVED SESSIONS:", received);

      setSentSessions(sent);
      setReceivedSessions(received);

      // =================================================
      // GET PEERS
      // =================================================

      const peerResponse = await axios.get(
        "http://localhost:5000/api/mentors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const peerList =
        peerResponse.data.peers ||
        peerResponse.data.mentors ||
        [];

      // Don't show yourself
      const currentUserId = getId(
        user?._id || user?.id
      );

      const otherPeers = peerList.filter((peer) => {
        const peerUserId = getId(
          peer.userId ||
            peer.user ||
            peer._id
        );

        return peerUserId !== currentUserId;
      });

      setPeers(otherPeers.slice(0, 3));
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Could not load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, []);

  // =====================================================
  // ACCEPT / REJECT REQUEST
  // =====================================================

  const updateRequest = async (
    sessionId,
    status
  ) => {
    try {
      setError("");

      await axios.put(
        `http://localhost:5000/api/sessions/${sessionId}/status`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadDashboard();
    } catch (err) {
      console.error(
        "Update request error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Could not update request"
      );
    }
  };

  // =====================================================
  // MARK COMPLETED
  // =====================================================

  const markCompleted = async (
    sessionId
  ) => {
    try {
      setError("");

      await axios.put(
        `http://localhost:5000/api/sessions/${sessionId}/status`,
        {
          status: "Completed",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await loadDashboard();
    } catch (err) {
      console.error(
        "Complete session error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Could not complete session"
      );
    }
  };

  // =====================================================
  // COUNTS
  // =====================================================

  const pendingReceived =
    receivedSessions.filter(
      (session) =>
        session.status === "Pending"
    );

  const acceptedSent =
    sentSessions.filter(
      (session) =>
        session.status === "Accepted"
    );

  const completedSent =
    sentSessions.filter(
      (session) =>
        session.status === "Completed"
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="dashboard-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="dashboard-navbar">

        <div className="dashboard-logo">
          SkillBridge
        </div>

        <div className="dashboard-nav-right">

          <span className="dashboard-user-name">
            {user?.name || "Peer"}
          </span>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="dashboard-content">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="dashboard-hero">

          <div className="hero-content">

            <span className="hero-label">
              PEER DASHBOARD
            </span>

            <h1>
              Welcome back,{" "}
              <span>
                {user?.name || "Peer"}
              </span>
            </h1>

            <p>
              Teach what you know, learn what you need,
              and build meaningful skill exchanges
              with fellow students.
            </p>

            <div className="dashboard-hero-actions">

              <button
                onClick={() =>
                  navigate("/mentors")
                }
              >
                Find Skill Partners →
              </button>

              <button
                onClick={() =>
                  navigate("/my-skills")
                }
                className="secondary-action"
              >
                Update My Skills
              </button>

            </div>

          </div>

          <div className="hero-decoration">

            <div className="hero-center">
              ↔
            </div>

          </div>

        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="dashboard-error">
            {error}
          </div>
        )}

        {/* =================================================
            QUICK CARDS
        ================================================= */}

        <section className="quick-section">

          <div className="section-heading">

            <div>

              <span className="section-label">
                YOUR PEER NETWORK
              </span>

              <h2>
                Everything in one place
              </h2>

            </div>

          </div>

          <div className="dashboard-cards">

            {/* FIND PEERS */}

            <div className="dashboard-card">

              <div className="card-top">

                <span className="card-icon">
                  🔎
                </span>

                <span className="card-number">
                  01
                </span>

              </div>

              <h3>
                Find Skill Partners
              </h3>

              <p>
                Search by skill and see students
                who can teach it.
              </p>

              <button
                onClick={() =>
                  navigate("/mentors")
                }
              >
                Browse peers <span>→</span>
              </button>

            </div>

            {/* MY SKILLS */}

            <div className="dashboard-card">

              <div className="card-top">

                <span className="card-icon">
                  🔄
                </span>

                <span className="card-number">
                  02
                </span>

              </div>

              <h3>
                My Skill Exchange
              </h3>

              <p>
                Set the skills you can teach and
                the skills you want to learn.
              </p>

              <button
                onClick={() =>
                  navigate("/my-skills")
                }
              >
                Manage skills <span>→</span>
              </button>

            </div>

            {/* PORTFOLIO */}

            <div className="dashboard-card">

              <div className="card-top">

                <span className="card-icon">
                  ⭐
                </span>

                <span className="card-number">
                  03
                </span>

              </div>

              <h3>
                My Portfolio
              </h3>

              <p>
                Show projects and certificates
                that build trust with peers.
              </p>

              <button
                onClick={() =>
                  navigate("/my-portfolio")
                }
              >
                Open portfolio <span>→</span>
              </button>

            </div>

          </div>

        </section>

        {/* =================================================
            STATS
        ================================================= */}

        <section className="dashboard-stats">

          <div>

            <strong>
              {pendingReceived.length}
            </strong>

            <span>
              Requests received
            </span>

          </div>

          <div>

            <strong>
              {acceptedSent.length}
            </strong>

            <span>
              Accepted sessions
            </span>

          </div>

          <div>

            <strong>
              {completedSent.length}
            </strong>

            <span>
              Completed sessions
            </span>

          </div>

        </section>

        {/* =================================================
            RECOMMENDED PEERS
        ================================================= */}

        <section className="dashboard-panel">

          <div className="panel-heading">

            <div>

              <span className="section-label">
                RECOMMENDED
              </span>

              <h2>
                Top peer matches
              </h2>

            </div>

            <button
              onClick={() =>
                navigate("/mentors")
              }
            >
              View all →
            </button>

          </div>

          <div className="mini-peer-grid">

            {peers.length === 0 ? (

              <div className="empty-dashboard">

                <h3>
                  No peer matches yet
                </h3>

                <p>
                  Other students will appear here.
                </p>

              </div>

            ) : (

              peers.map((peer) => (

                <div
                  className="mini-peer"
                  key={peer._id}
                >

                  <div className="mini-avatar">
                    {peer.name?.[0] || "P"}
                  </div>

                  <div>

                    <h3>
                      {peer.name}
                    </h3>

                    <p>
                      ★{" "}
                      {Number(
                        peer.rating || 0
                      ).toFixed(1)}
                      {" · "}
                      {peer.reviewCount || 0}
                      {" reviews"}
                    </p>

                    <small>
                      Teaches:{" "}
                      {(peer.skillsToTeach || [])
                        .slice(0, 2)
                        .join(", ") || "—"}
                    </small>

                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        "/mentor-profile",
                        {
                          state: {
                            mentor: peer,
                          },
                        }
                      )
                    }
                  >
                    View
                  </button>

                </div>

              ))

            )}

          </div>

        </section>

        {/* =================================================
            REQUESTS RECEIVED
        ================================================= */}

        <section className="dashboard-panel">

          <div className="panel-heading">

            <div>

              <span className="section-label">
                REQUESTS RECEIVED
              </span>

              <h2>
                Requests sent to you
              </h2>

            </div>

          </div>

          {loading ? (

            <p>
              Loading requests...
            </p>

          ) : receivedSessions.length === 0 ? (

            <div className="empty-dashboard">

              <h3>
                No requests received
              </h3>

              <p>
                When another student sends you
                a learning request, it will appear here.
              </p>

            </div>

          ) : (

            <div className="session-list">

              {receivedSessions
                .slice(0, 5)
                .map((session) => (

                  <div
                    className="session-row"
                    key={session._id}
                  >

                    <div>

                      <strong>
                        {session.sender?.name ||
                          "Peer"}
                      </strong>

                      <p>
                        {session.date}
                        {" · "}
                        {session.time}
                        {" · "}
                        {session.message ||
                          "Peer-learning request"}
                      </p>

                    </div>

                    <span
                      className={`session-status ${
                        session.status?.toLowerCase() || ""
                      }`}
                    >
                      {session.status}
                    </span>

                    {/* PENDING */}

                    {session.status === "Pending" && (

                      <div className="request-actions">

                        <button
                          onClick={() =>
                            updateRequest(
                              session._id,
                              "Accepted"
                            )
                          }
                        >
                          Accept
                        </button>

                        <button
                          onClick={() =>
                            updateRequest(
                              session._id,
                              "Rejected"
                            )
                          }
                        >
                          Reject
                        </button>

                      </div>

                    )}

                    {/* ACCEPTED */}

                    {session.status === "Accepted" && (

                      <div className="request-actions">

                        <button
                          className="join-session-link"
                          onClick={() =>
                            openLearningSession(
                              session
                            )
                          }
                        >
                          Join Learning Session →
                        </button>

                      </div>

                    )}

                  </div>

                ))}

            </div>

          )}

        </section>

        {/* =================================================
            REQUESTS SENT
        ================================================= */}

        <section className="dashboard-panel">

          <div className="panel-heading">

            <div>

              <span className="section-label">
                MY REQUESTS
              </span>

              <h2>
                Requests you sent
              </h2>

            </div>

            <button
              onClick={() =>
                navigate("/student-sessions")
              }
            >
              Open sessions →
            </button>

          </div>

          {loading ? (

            <p>
              Loading sessions...
            </p>

          ) : sentSessions.length === 0 ? (

            <div className="empty-dashboard">

              <h3>
                No requests sent
              </h3>

              <p>
                Find a peer and start your first
                skill exchange.
              </p>

            </div>

          ) : (

            <div className="session-list">

              {sentSessions
                .slice(0, 5)
                .map((session) => (

                  <div
                    className="session-row"
                    key={session._id}
                  >

                    <div>

                      <strong>
                        {session.receiver?.name ||
                          "Peer"}
                      </strong>

                      <p>
                        {session.date}
                        {" · "}
                        {session.time}
                        {" · "}
                        {session.message ||
                          "Peer-learning request"}
                      </p>

                    </div>

                    <span
                      className={`session-status ${
                        session.status?.toLowerCase() || ""
                      }`}
                    >
                      {session.status}
                    </span>

                    {/* ACCEPTED */}

                    {session.status === "Accepted" && (

                      <div className="request-actions">

                        <button
                          className="join-session-link"
                          onClick={() =>
                            openLearningSession(
                              session
                            )
                          }
                        >
                          Join Learning Session →
                        </button>

                        <button
                          onClick={() =>
                            markCompleted(
                              session._id
                            )
                          }
                        >
                          Mark Completed
                        </button>

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