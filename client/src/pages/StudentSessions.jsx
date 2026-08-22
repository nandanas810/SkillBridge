import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/StudentSessions.css";

function StudentSessions() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review states
  const [reviewingSession, setReviewingSession] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  // =====================================================
  // FETCH SESSIONS
  // =====================================================

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

  // =====================================================
  // OPEN REVIEW FORM
  // =====================================================

  const openReviewForm = (session) => {
    setReviewingSession(session);
    setRating(5);
    setComment("");
    setReviewMessage("");
  };

  // =====================================================
  // CLOSE REVIEW FORM
  // =====================================================

  const closeReviewForm = () => {
    setReviewingSession(null);
    setRating(5);
    setComment("");
    setReviewMessage("");
  };

  // =====================================================
  // SUBMIT REVIEW
  // =====================================================

  const submitReview = async () => {
    if (!reviewingSession) return;

    if (!rating) {
      setReviewMessage("Please select a rating.");
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewMessage("");

      const token = localStorage.getItem("token");

      await axios.post(
        `http://localhost:5000/api/sessions/${reviewingSession._id}/review`,
        {
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReviewMessage(
        "✓ Thank you! Your rating and review were submitted."
      );

      // Close after short delay
      setTimeout(() => {
        closeReviewForm();
        fetchSessions();
      }, 1500);
    } catch (error) {
      console.error("REVIEW ERROR:", error);

      setReviewMessage(
        error.response?.data?.message ||
          "Failed to submit review."
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="student-sessions-page">

      {/* =================================================
          NAVBAR
      ================================================= */}

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

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="student-sessions-content">

        <div className="sessions-page-header">

          <span>LEARNING ACTIVITY</span>

          <h1>My Learning Sessions</h1>

          <p>
            Track your peer requests, learning sessions,
            and completed skill exchanges.
          </p>

        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="student-session-message">
            Loading your sessions...
          </div>
        )}

        {/* =================================================
            ERROR
        ================================================= */}

        {!loading && error && (
          <div className="student-session-error">
            {error}
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          sessions.length === 0 && (
            <div className="student-empty-sessions">

              <div className="empty-session-icon">
                📅
              </div>

              <h2>No learning sessions yet</h2>

              <p>
                Find a peer and send a learning request
                to start your journey.
              </p>

              <button
                onClick={() => navigate("/mentors")}
              >
                Find a Mentor →
              </button>

            </div>
          )}

        {/* =================================================
            SESSION LIST
        ================================================= */}

        {!loading &&
          !error &&
          sessions.length > 0 && (

            <div className="student-sessions-list">

              {sessions.map((session) => (

                <div
                  className="student-session-card"
                  key={session._id}
                >

                  {/* =================================================
                      TOP
                  ================================================= */}

                  <div className="student-session-top">

                    <div className="mentor-avatar">
                      {session.mentor?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "M"}
                    </div>

                    <div>
                      <h2>
                        {session.mentor?.name ||
                          "Peer"}
                      </h2>

                      <p>
                        Peer Learning Session
                      </p>
                    </div>

                    <span
                      className={`student-session-status ${
                        session.status?.toLowerCase() ||
                        ""
                      }`}
                    >
                      {session.status ||
                        "Pending"}
                    </span>

                  </div>

                  {/* =================================================
                      DETAILS
                  ================================================= */}

                  <div className="student-session-details">

                    <div>
                      <span>DATE</span>

                      <strong>
                        {session.date ||
                          "Not set"}
                      </strong>
                    </div>

                    <div>
                      <span>TIME</span>

                      <strong>
                        {session.time ||
                          "Not set"}
                      </strong>
                    </div>

                  </div>

                  {/* =================================================
                      MESSAGE
                  ================================================= */}

                  {session.message && (
                    <div className="student-session-message-box">

                      <span>MESSAGE</span>

                      <p>
                        {session.message}
                      </p>

                    </div>
                  )}

                  {/* =================================================
                      ACCEPTED SESSION
                  ================================================= */}

                  {session.status?.toLowerCase() ===
                    "accepted" && (

                    <div className="learning-session-box">

                      <div>
                        <span>
                          READY TO LEARN?
                        </span>

                        <h3>
                          Your learning session
                          is confirmed.
                        </h3>
                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            "/learning-session",
                            {
                              state: {
                                session,
                              },
                            }
                          )
                        }
                      >
                        Open Session →
                      </button>

                    </div>
                  )}

                  {/* =================================================
                      COMPLETED SESSION
                  ================================================= */}

                  {session.status?.toLowerCase() ===
                    "completed" && (

                    <div className="completed-session-box">

                      <div className="completed-session-info">

                        <span>
                          SESSION COMPLETED
                        </span>

                        <h3>
                          How was your learning
                          experience?
                        </h3>

                        <p>
                          Share your experience
                          with {session.mentor?.name ||
                            "your peer"}.
                        </p>

                      </div>

                      <button
                        className="rate-review-button"
                        onClick={() =>
                          openReviewForm(session)
                        }
                      >
                        ⭐ Rate & Review
                      </button>

                    </div>
                  )}

                </div>

              ))}

            </div>
          )}

      </main>

      {/* =====================================================
          REVIEW MODAL
      ===================================================== */}

      {reviewingSession && (

        <div className="review-modal-overlay">

          <div className="review-modal">

            {/* Close */}

            <button
              className="review-close-button"
              onClick={closeReviewForm}
            >
              ×
            </button>

            {/* Header */}

            <div className="review-modal-header">

              <span>
                SESSION FEEDBACK
              </span>

              <h2>
                Rate your session
              </h2>

              <p>
                How was your learning experience
                with{" "}
                <strong>
                  {reviewingSession.mentor?.name ||
                    "your peer"}
                </strong>
                ?
              </p>

            </div>

            {/* =================================================
                STAR RATING
            ================================================= */}

            <div className="rating-section">

              <label>
                Your Rating
              </label>

              <div className="rating-stars">

                {[1, 2, 3, 4, 5].map(
                  (star) => (

                    <button
                      key={star}
                      type="button"
                      className={
                        star <= rating
                          ? "star active"
                          : "star"
                      }
                      onClick={() =>
                        setRating(star)
                      }
                    >
                      ★
                    </button>

                  )
                )}

              </div>

              <p className="rating-text">
                {rating === 5 &&
                  "Excellent!"}

                {rating === 4 &&
                  "Very Good!"}

                {rating === 3 &&
                  "Good"}

                {rating === 2 &&
                  "Could be better"}

                {rating === 1 &&
                  "Needs improvement"}
              </p>

            </div>

            {/* =================================================
                COMMENT
            ================================================= */}

            <div className="review-comment-section">

              <label>
                Your Review
              </label>

              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(e.target.value)
                }
                placeholder="Tell other students about your learning experience..."
                rows="5"
              />

            </div>

            {/* =================================================
                MESSAGE
            ================================================= */}

            {reviewMessage && (

              <div
                className={
                  reviewMessage.startsWith("✓")
                    ? "review-success-message"
                    : "review-error-message"
                }
              >
                {reviewMessage}
              </div>

            )}

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="review-modal-actions">

              <button
                className="review-cancel-button"
                onClick={closeReviewForm}
                disabled={submittingReview}
              >
                Cancel
              </button>

              <button
                className="review-submit-button"
                onClick={submitReview}
                disabled={submittingReview}
              >
                {submittingReview
                  ? "Submitting..."
                  : "Submit Review"}
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default StudentSessions;