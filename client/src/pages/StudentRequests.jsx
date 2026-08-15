import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/StudentRequests.css";

function StudentRequests() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ===============================
  // GET STUDENT REQUESTS
  // ===============================
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/sessions/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSessions(response.data.sessions || []);
    } catch (err) {
      console.error("FETCH REQUESTS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load student requests"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
    }
  }, [token]);

  // ===============================
  // ACCEPT / REJECT REQUEST
  // ===============================
  const updateStatus = async (sessionId, status) => {
    try {
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

      // Refresh requests
      fetchRequests();

    } catch (err) {
      console.error("UPDATE STATUS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update request"
      );
    }
  };

  return (
    <div className="student-requests-page">

      <div className="student-requests-container">

        {/* BACK BUTTON */}
        <button
          className="student-requests-back"
          onClick={() => navigate("/mentor-dashboard")}
        >
          ← Back to Mentor Dashboard
        </button>


        {/* HEADER */}
        <div className="student-requests-header">

          <span className="student-requests-label">
            MENTOR ACTIVITY
          </span>

          <h1>Student Requests</h1>

          <p>
            Review and manage session requests from students.
          </p>

        </div>


        {/* ERROR */}
        {error && (
          <div className="student-requests-error">
            {error}
          </div>
        )}


        {/* LOADING */}
        {loading && (
          <div className="student-requests-loading">

            <span className="student-loading-dot"></span>

            <span>
              Loading student requests...
            </span>

          </div>
        )}


        {/* NO REQUESTS */}
        {!loading && !error && sessions.length === 0 && (
          <div className="student-no-requests">

            <div className="student-no-requests-icon">
              📩
            </div>

            <h2>
              No student requests yet
            </h2>

            <p>
              Session requests from students will appear here.
            </p>

          </div>
        )}


        {/* REQUESTS */}
        {!loading && sessions.length > 0 && (
          <div className="student-requests-list">

            {sessions.map((session) => (

              <div
                key={session._id}
                className="student-request-card"
              >

                {/* STUDENT + STATUS */}
                <div className="student-request-top">

                  <div className="student-request-student">

                    <div className="student-request-avatar">
                      👤
                    </div>

                    <div>
                      <h2>
                        {session.student?.name || "Student"}
                      </h2>

                      <span>
                        Session request
                      </span>
                    </div>

                  </div>


                  {/* STATUS */}
                  <span
                    className={`student-request-status ${
                      session.status === "Accepted"
                        ? "accepted"
                        : session.status === "Rejected"
                        ? "rejected"
                        : "pending"
                    }`}
                  >
                    {session.status}
                  </span>

                </div>


                {/* DETAILS */}
                <div className="student-request-details">

                  <div className="student-request-detail">

                    <span className="student-request-detail-label">
                      Email
                    </span>

                    <span className="student-request-detail-value">
                      {session.student?.email ||
                        "Not available"}
                    </span>

                  </div>


                  <div className="student-request-detail">

                    <span className="student-request-detail-label">
                      Date
                    </span>

                    <span className="student-request-detail-value">
                      {session.date}
                    </span>

                  </div>


                  <div className="student-request-detail">

                    <span className="student-request-detail-label">
                      Time
                    </span>

                    <span className="student-request-detail-value">
                      {session.time}
                    </span>

                  </div>


                  <div className="student-request-detail full">

                    <span className="student-request-detail-label">
                      Message
                    </span>

                    <span className="student-request-detail-value message">
                      {session.message ||
                        "No message provided"}
                    </span>

                  </div>

                </div>


                {/* ACTION BUTTONS */}
                {session.status === "Pending" && (

                  <div className="student-request-actions">

                    <button
                      className="student-request-button student-request-accept"
                      onClick={() =>
                        updateStatus(
                          session._id,
                          "Accepted"
                        )
                      }
                    >
                      ✓ Accept
                    </button>


                    <button
                      className="student-request-button student-request-reject"
                      onClick={() =>
                        updateStatus(
                          session._id,
                          "Rejected"
                        )
                      }
                    >
                      ✕ Reject
                    </button>

                  </div>

                )}

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default StudentRequests;