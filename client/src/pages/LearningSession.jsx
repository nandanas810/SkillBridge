
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

  // =====================================================
  // CURRENT USER
  // =====================================================

  const storedUser = localStorage.getItem("user");

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
  // FIND OTHER PEER
  // =====================================================

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
      peer =
        session.receiver ||
        session.sender;
    }
  }

  const peerName =
    peer?.name || "Your Peer";

  // =====================================================
  // CREATE SAME JITSI ROOM NAME
  // =====================================================

  const getRoomName = () => {
    if (!session) return "";

    if (session.meetingUrl) {
      const parts =
        session.meetingUrl.split("/");

      return (
        parts[parts.length - 1] ||
        `SkillBridge-${session._id}`
      );
    }

    return `SkillBridge-${session._id}`;
  };

  // =====================================================
  // LOAD JITSI EXTERNAL API
  // =====================================================

  const loadJitsiScript = () => {
    return new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) {
        resolve();
        return;
      }

      const existingScript =
        document.querySelector(
          'script[src="https://meet.jit.si/external_api.js"]'
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          resolve
        );

        existingScript.addEventListener(
          "error",
          reject
        );

        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://meet.jit.si/external_api.js";

      script.async = true;

      script.onload = resolve;
      script.onerror = reject;

      document.body.appendChild(script);
    });
  };

  // =====================================================
  // START MEETING
  // =====================================================

  const startMeeting = async () => {
    try {
      setError("");
      setMeetingEnded(false);
      setLoadingMeeting(true);

      await loadJitsiScript();

      if (!window.JitsiMeetExternalAPI) {
        throw new Error(
          "Jitsi could not be loaded."
        );
      }

      // Remove old meeting instance if it exists
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }

      if (jitsiContainerRef.current) {
        jitsiContainerRef.current.innerHTML =
          "";
      }

      const roomName = getRoomName();

      const api =
        new window.JitsiMeetExternalAPI(
          "meet.jit.si",
          {
            roomName,

            parentNode:
              jitsiContainerRef.current,

            width: "100%",
            height: 600,

            userInfo: {
              displayName:
                currentUser?.name ||
                "SkillBridge Student",
            },

            configOverwrite: {
              prejoinConfig: {
                enabled: true,
              },
            },
          }
        );

      jitsiApiRef.current = api;

      // Meeting iframe is now inside SkillBridge
      setMeetingStarted(true);
      setLoadingMeeting(false);

      // =================================================
      // USER LEAVES / HANGS UP
      // =================================================

      api.addListener(
        "videoConferenceLeft",
        () => {
          console.log(
            "User left the Jitsi meeting"
          );

          setMeetingStarted(false);
          setMeetingEnded(true);

          if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
          }
        }
      );

      // Jitsi can also tell the parent that it is ready
      // to close after hang-up.
      api.addListener(
        "readyToClose",
        () => {
          console.log(
            "Jitsi is ready to close"
          );

          setMeetingStarted(false);
          setMeetingEnded(true);

          if (jitsiApiRef.current) {
            jitsiApiRef.current.dispose();
            jitsiApiRef.current = null;
          }
        }
      );

    } catch (err) {
      console.error(
        "JITSI START ERROR:",
        err
      );

      setLoadingMeeting(false);
      setMeetingStarted(false);

      setError(
        "Could not start the meeting. Please check your internet connection and try again."
      );
    }
  };

  // =====================================================
  // LEAVE MEETING FROM SKILLBRIDGE
  // =====================================================

  const leaveMeeting = () => {
    try {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.executeCommand(
          "hangup"
        );
      } else {
        setMeetingStarted(false);
        setMeetingEnded(true);
      }
    } catch (err) {
      console.error(
        "LEAVE MEETING ERROR:",
        err
      );

      setMeetingStarted(false);
      setMeetingEnded(true);
    }
  };

  // =====================================================
  // CLEAN JITSI WHEN PAGE CLOSES
  // =====================================================

  useEffect(() => {
    return () => {
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (err) {
          console.error(
            "JITSI CLEANUP ERROR:",
            err
          );
        }

        jitsiApiRef.current = null;
      }
    };
  }, []);

  // =====================================================
  // MARK COMPLETED
  // =====================================================

  const markCompleted = async () => {
    if (!session) return;

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
  // SESSION NOT FOUND
  // =====================================================

  if (!session) {
    return (
      <div className="learning-page">

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

        <main className="learning-content">

          <div className="learning-empty">

            <h2>
              Session not found
            </h2>

            <p>
              Please open the learning
              session from your My Sessions
              page.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/student-sessions"
                )
              }
            >
              Go to My Sessions →
            </button>

          </div>

        </main>

      </div>
    );
  }

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

          {/* ERROR */}

          {error && (
            <div className="learning-error">
              {error}
            </div>
          )}

          {/* BEFORE MEETING */}

          {!meetingStarted &&
            !meetingEnded && (

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
                to start your
                peer-learning session.
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
                You and your peer will
                join the same SkillBridge
                meeting room.
              </p>

            </div>
          )}

          {/* JITSI MEETING */}

          {meetingStarted && (

            <div
              style={{
                marginTop: "25px",
              }}
            >

              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >

                <div>
                  <span className="small-label">
                    LIVE SESSION
                  </span>

                  <h2
                    style={{
                      marginTop: "5px",
                    }}
                  >
                    Learning with{" "}
                    {peerName}
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

          {/* IMPORTANT:
              Jitsi needs this element to
              stay mounted while it runs.
          */}

          <div
            ref={jitsiContainerRef}
            style={{
              width: "100%",
              marginTop:
                meetingStarted
                  ? "10px"
                  : "0",
              overflow: "hidden",
              borderRadius: "16px",
            }}
          />

          {/* AFTER CALL */}

          {meetingEnded && (

            <div className="session-start-area">

              <div className="session-start-icon">
                ✓
              </div>

              <h2>
                You have left the meeting
              </h2>

              <p>
                You are back in
                SkillBridge. If your
                learning session is
                finished, mark it as
                completed.
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
                style={{
                  marginTop: "12px",
                }}
              >
                {loadingMeeting
                  ? "Rejoining..."
                  : "Rejoin Meeting"}
              </button>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default LearningSession;