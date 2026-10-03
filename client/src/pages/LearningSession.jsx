import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/LearningSession.css";

function LearningSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = location.state?.session;

  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [loadingMeeting, setLoadingMeeting] = useState(false);

  // CURRENT USER
  const storedUser = sessionStorage.getItem("user");
  let currentUser = null;

  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    currentUser = null;
  }

  const currentUserId = currentUser?._id || currentUser?.id;

  // GET ID SAFELY
  const getId = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (value._id) return value._id.toString();
    if (value.id) return value.id.toString();
    return null;
  };

  // FIND OTHER PEER
  let peer = null;

  if (session) {
    const senderId = getId(session.sender);
    const receiverId = getId(session.receiver);

    if (
      senderId &&
      currentUserId &&
      senderId === currentUserId.toString()
    ) {
      peer = session.receiver;
    } else if (
      receiverId &&
      currentUserId &&
      receiverId === currentUserId.toString()
    ) {
      peer = session.sender;
    } else {
      peer = session.receiver || session.sender;
    }
  }

  const peerName = peer?.name || "Your Peer";

  // CREATE SAME JITSI ROOM NAME
  const getRoomName = () => {
    if (!session) return "";

    if (session.meetingUrl) {
      const parts = session.meetingUrl.split("/");
      return (
        parts[parts.length - 1] ||
        `SkillBridge-${session._id}`
      );
    }

    return `SkillBridge-${session._id}`;
  };

 
  // LOAD JITSI EXTERNAL API
  const loadJitsiScript = () => {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) {
        resolve();
        return;
      }

      const existingScript = document.querySelector(
        'script[src="https://meet.jit.si/external_api.js"]'
      );

      if (existingScript) {
        existingScript.addEventListener("load", resolve);
        existingScript.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  // START JAAS MEETING
  const startMeeting = async () => {
    try {
      setError("");
      setMeetingEnded(false);
      setLoadingMeeting(true);

      const authToken = sessionStorage.getItem("token");

      if (!authToken) {
        throw new Error("Please log in again.");
      }

      if (!session?._id) {
        throw new Error(
          "Session not found. Please reopen it from My Sessions."
        );
      }

      // Request a secure meeting token from the backend
      const response = await axios.post(
        "http://localhost:5000/api/jaas/token",
        { sessionId: session._id },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      const {
        token: jaasToken,
        appId,
        roomName,
      } = response.data;

      if (!jaasToken || !appId || !roomName) {
        throw new Error(
          "Meeting details are missing from the server response."
        );
      }

      // Load the JaaS external API
      await loadJitsiScript(appId);

      if (!window.JitsiMeetExternalAPI) {
        throw new Error("JaaS could not be loaded.");
      }

      // Remove any previous meeting
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }

      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.innerHTML = "";
      }

      // Join the session's shared room
      const api = new window.JitsiMeetExternalAPI("8x8.vc", {
        roomName: `${appId}/${roomName}`,
        jwt: jaasToken,
        parentNode: jitsiContainerRef.current,
        width: "100%",
        height: 600,
        userInfo: {
          displayName:
            currentUser?.name || "SkillBridge Student",
        },
        configOverwrite: {
          prejoinConfig: {
            enabled: true,
          },
        },
      });

      jitsiApiRef.current = api;
      setMeetingStarted(true);

      // Handle leaving or closing the meeting
      const handleMeetingEnded = () => {
        setMeetingStarted(false);
        setMeetingEnded(true);

        if (jitsiApiRef.current) {
          jitsiApiRef.current.dispose();
          jitsiApiRef.current = null;
        }
      };

      api.addListener("videoConferenceLeft", handleMeetingEnded);
      api.addListener("readyToClose", handleMeetingEnded);
    } catch (err) {
      console.error(
        "JAAS START ERROR:",
        err.response?.data || err
      );

      setMeetingStarted(false);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not start the meeting. Please try again."
      );
    } finally {
      setLoadingMeeting(false);
    }
  };

  // LEAVE MEETING FROM SKILLBRIDGE
  const leaveMeeting = () => {
    try {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.executeCommand("hangup");
      } else {
        setMeetingStarted(false);
        setMeetingEnded(true);
      }
    } catch (err) {
      console.error("LEAVE MEETING ERROR:", err);
      setMeetingStarted(false);
      setMeetingEnded(true);
    }
  };

  // CLEAN JITSI WHEN PAGE CLOSES
  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (err) {
          console.error("JITSI CLEANUP ERROR:", err);
        }

        jitsiApiRef.current = null;
      }
    };
  }, []);

  // MARK COMPLETED — UPDATED FUNCTION
  const markCompleted = async () => {
    if (!session?._id) {
      setError(
        "Session not found. Please reopen it from My Sessions."
      );
      return;
    }

    try {
      setCompleting(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        setError("Please log in again.");
        return;
      }

      // Fetch the latest session details from the backend
      const response = await axios.get(
        "http://localhost:5000/api/sessions/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      const allSessions = [
        ...(data.sessions || []),
        ...(data.sent || []),
        ...(data.received || []),
      ];

      // Find the exact session by ID
      const latestSession = allSessions.find(
        (item) => String(item._id) === String(session._id)
      );

      if (!latestSession) {
        setError(
          "Session not found. Please reopen it from My Sessions."
        );
        return;
      }

      const status = latestSession.status?.toLowerCase();

if (status === "completed") {
  navigate("/student-sessions");
  return;
}

if (status !== "accepted") {
  setError(
    `This session cannot be completed. Current status: ${
      latestSession.status || "Unknown"
    }. Please check My Sessions.`
  );
  return;
}
      // Update the session status
      await axios.put(
        `http://localhost:5000/api/sessions/${session._id}/status`,
        { status: "Completed" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/student-sessions");
    } catch (err) {
      console.error(
        "COMPLETE SESSION ERROR:",
        err.response?.data || err
      );

      setError(
        err.response?.data?.message ||
          "Could not complete the session. Please try again."
      );
    } finally {
      setCompleting(false);
    }
  };

  // SESSION NOT FOUND
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
              Please open the learning session from your My
              Sessions page.
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

  // UI
  return (
    <div className="learning-page">
      {/* NAVBAR */}
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

      {/* MAIN */}
      <main className="learning-content">
        {/* HEADER */}
        <div className="learning-header">
          <span>PEER LEARNING SESSION</span>

          <h1>Ready to learn?</h1>

          <p>
            Connect with your peer and exchange your skills.
          </p>
        </div>

        {/* SESSION CARD */}
        <div className="learning-card">
          {/* PEER */}
          <div className="learning-top">
            <div className="learning-avatar">
              {peerName?.charAt(0)?.toUpperCase() || "P"}
            </div>

            <div>
              <span className="small-label">YOUR PEER</span>
              <h2>{peerName}</h2>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="learning-error">{error}</div>
          )}

          {/* BEFORE MEETING */}
          {!meetingStarted && !meetingEnded && (
            <div className="session-start-area">
              <div className="session-start-icon">🤝</div>

              <h2>Start your skill exchange</h2>

              <p>
                Join the meeting with <strong>{peerName}</strong>{" "}
                to start your peer-learning session.
              </p>

              <button
                className="start-session-btn"
                onClick={startMeeting}
                disabled={loadingMeeting}
              >
                {loadingMeeting
                  ? "Starting Meeting..."
                  : "Join Meeting →"}
              </button>

              <p className="session-room-note">
                You and your peer will join the same SkillBridge
                meeting room.
              </p>
            </div>
          )}

          {/* JITSI MEETING */}
          {meetingStarted && (
            <div style={{ marginTop: "25px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <span className="small-label">LIVE SESSION</span>

                  <h2 style={{ marginTop: "5px" }}>
                    Learning with {peerName}
                  </h2>
                </div>

                <button
                  className="complete-session-btn"
                  onClick={leaveMeeting}
                >
                  Leave Meeting
                </button>
              </div>
            </div>
          )}

          {/* IMPORTANT: Jitsi needs this element to stay mounted while it runs. */}
          <div
            ref={jitsiContainerRef}
            style={{
              width: "100%",
              marginTop: meetingStarted ? "10px" : "0",
              overflow: "hidden",
              borderRadius: "16px",
            }}
          />

          {/* AFTER CALL */}
          {meetingEnded && (
            <div className="session-start-area">
              <div className="session-start-icon">✓</div>

              <h2>You have left the meeting</h2>

              <p>
                You are back in SkillBridge. If your learning
                session is finished, mark it as completed.
              </p>

              <button
                className="complete-session-btn"
                onClick={markCompleted}
                disabled={completing}
              >
                {completing
                  ? "Completing..."
                  : "✓ Mark Session Completed"}
              </button>

              <button
                className="start-session-btn"
                onClick={startMeeting}
                disabled={loadingMeeting}
                style={{ marginTop: "12px" }}
              >
                {loadingMeeting ? "Rejoining..." : "Rejoin Meeting"}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default LearningSession;