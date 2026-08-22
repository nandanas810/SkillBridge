import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "../styles/Mentorprofile.css";

function MentorProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  // This page is now a PEER profile.
  // The old route/state name "mentor" is kept only
  // so the existing navigation continues to work.
  const peer = location.state?.mentor;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  if (!peer) {
    return (
      <div className="mentor-profile-page">
        <div className="mentor-profile-card not-found">
          <div className="not-found-icon">🔍</div>

          <h2>Peer not found</h2>

          <p>
            The peer profile could not be loaded.
          </p>

          <button
            className="back-button"
            onClick={() => navigate("/mentors")}
          >
            ← Back to Peers
          </button>
        </div>
      </div>
    );
  }

  const teachSkills =
    peer.skillsToTeach ||
    peer.skills ||
    [];

  const learnSkills =
    peer.skillsToLearn || [];

  const availability =
    peer.availability || [];

  const reviews =
    peer.reviews || [];

  const badges =
    peer.badges || [];

  const ratingValue =
    Number(peer.rating || 0);

  const reviewCount =
    peer.reviewCount || 0;

  const matchScore =
    peer.matchScore || 0;

  // =====================================================
  // SEND PEER REQUEST
  // =====================================================

  const requestSession = async (e) => {
    e.preventDefault();

    setNotice("");
    setError("");

    try {
      const token =
        localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      // IMPORTANT:
      // The backend now expects receiver = USER ID.
      //
      // peer.userId is the actual User ID.
      //
      // Do NOT send peer._id here because that
      // can be the old profile ID.

      if (!peer.userId) {
        setError(
          "Peer user ID is missing. Please refresh the peer list."
        );
        return;
      }

      await axios.post(
        "http://localhost:5000/api/sessions",
        {
          receiver: peer.userId,
          date,
          time,
          message,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setNotice(
        "Peer-learning request sent successfully!"
      );

      setDate("");
      setTime("");
      setMessage("");
    } catch (err) {
      console.error(
        "SEND PEER REQUEST ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Could not send peer-learning request."
      );
    }
  };

  return (
    <div className="mentor-profile-page">

      {/* ================= NAVBAR ================= */}

      <nav className="dashboard-navbar">

        <div className="dashboard-logo">
          SkillBridge
        </div>

        <button
          className="logout-button"
          onClick={() =>
            navigate("/mentors")
          }
        >
          ← Back to Peers
        </button>

      </nav>

      <main className="mentor-profile-content">

        {/* ================= PROFILE HERO ================= */}

        <section className="profile-hero-card">

          <div className="profile-hero-top">

            <div className="large-mentor-avatar">
              {peer.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <div className="profile-main-info">

              <div className="profile-name-row">

                <h1>
                  {peer.name}
                </h1>

                {badges.length > 0 && (
                  <span className="profile-badge">
                    🏅 {badges[0]}
                  </span>
                )}

              </div>

              <p className="profile-email">
                {peer.email}
              </p>

              <div className="profile-rating">

                <span className="rating-number">
                  ★ {ratingValue.toFixed(1)}
                </span>

                <span className="rating-reviews">
                  {reviewCount}{" "}
                  {reviewCount === 1
                    ? "review"
                    : "reviews"}
                </span>

              </div>

              <p className="profile-tagline">
                Peer learner • Skill exchanger • Student
              </p>

            </div>

          </div>

          {/* ================= PROFILE STATS ================= */}

          <div className="profile-stats">

            <div className="profile-stat">
              <strong>
                {teachSkills.length}
              </strong>

              <span>
                Skills to teach
              </span>
            </div>

            <div className="profile-stat">
              <strong>
                {learnSkills.length}
              </strong>

              <span>
                Skills to learn
              </span>
            </div>

            <div className="profile-stat">
              <strong>
                {reviewCount}
              </strong>

              <span>
                Reviews
              </span>
            </div>

            <div className="profile-stat">
              <strong>
                {matchScore > 0
                  ? `${matchScore}%`
                  : "—"}
              </strong>

              <span>
                Skill match
              </span>
            </div>

          </div>

        </section>

        {/* ================= MATCH BANNER ================= */}

        {matchScore > 0 && (
          <section className="skill-match-banner">

            <div className="match-icon">
              🎯
            </div>

            <div>

              <h3>
                {matchScore >= 70
                  ? "Excellent skill match"
                  : matchScore >= 35
                  ? "Good skill match"
                  : "Potential skill match"}
              </h3>

              <p>
                This peer is recommended based
                on your learning and teaching
                skills.
              </p>

            </div>

          </section>
        )}

        {/* ================= TWO COLUMN ================= */}

        <div className="profile-grid">

          {/* ================= LEFT ================= */}

          <div>

            {/* ABOUT */}

            <section className="profile-section">

              <div className="section-heading">

                <span>👋</span>

                <div>

                  <h2>
                    About this peer
                  </h2>

                  <p>
                    Get to know your potential
                    learning partner
                  </p>

                </div>

              </div>

              <p className="about-text">
                {peer.bio ||
                  "This student is ready to learn, teach and exchange skills with other students through SkillBridge."}
              </p>

            </section>

            {/* CAN TEACH */}

            <section className="profile-section">

              <div className="section-heading">

                <span>📚</span>

                <div>

                  <h2>
                    Skills they can teach
                  </h2>

                  <p>
                    Knowledge this peer can
                    share with you
                  </p>

                </div>

              </div>

              {teachSkills.length > 0 ? (

                <div className="profile-skills">

                  {teachSkills.map(
                    (skill, index) => (
                      <span
                        className="profile-teach-tag"
                        key={`${skill}-${index}`}
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              ) : (

                <p className="empty-text">
                  No teaching skills added yet.
                </p>

              )}

            </section>

            {/* WANTS TO LEARN */}

            <section className="profile-section">

              <div className="section-heading">

                <span>🎯</span>

                <div>

                  <h2>
                    Skills they want to learn
                  </h2>

                  <p>
                    Skills this peer is
                    currently interested in
                  </p>

                </div>

              </div>

              {learnSkills.length > 0 ? (

                <div className="profile-skills">

                  {learnSkills.map(
                    (skill, index) => (
                      <span
                        className="profile-learn-tag"
                        key={`${skill}-${index}`}
                      >
                        {skill}
                      </span>
                    )
                  )}

                </div>

              ) : (

                <p className="empty-text">
                  No learning interests added yet.
                </p>

              )}

            </section>

            {/* AVAILABILITY */}

            <section className="profile-section">

              <div className="section-heading">

                <span>🕐</span>

                <div>

                  <h2>
                    Availability
                  </h2>

                  <p>
                    Preferred times for
                    peer-learning sessions
                  </p>

                </div>

              </div>

              {availability.length > 0 ? (

                <div className="availability-list">

                  {availability.map(
                    (slot, index) => (
                      <div
                        className="availability-item"
                        key={index}
                      >
                        <span>✓</span>
                        <p>{slot}</p>
                      </div>
                    )
                  )}

                </div>

              ) : (

                <div className="availability-item">
                  <span>✓</span>

                  <p>
                    Availability can be
                    discussed through a
                    session request.
                  </p>
                </div>

              )}

            </section>

            {/* REVIEWS */}

            <section className="profile-section">

              <div className="section-heading">

                <span>⭐</span>

                <div>

                  <h2>
                    Student reviews
                  </h2>

                  <p>
                    What other students say
                    about this peer
                  </p>

                </div>

              </div>

              {reviews.length > 0 ? (

                <div className="reviews-list">

                  {reviews.map(
                    (r, index) => (
                      <div
                        className="review-card"
                        key={index}
                      >

                        <div className="review-top">

                          <div className="reviewer-avatar">
                            {r.reviewerName
                              ?.charAt(0)
                              ?.toUpperCase() ||
                              "S"}
                          </div>

                          <div>

                            <strong>
                              {r.reviewerName ||
                                "Student"}
                            </strong>

                            <div className="review-stars">
                              {"★".repeat(
                                Number(
                                  r.rating || 5
                                )
                              )}
                            </div>

                          </div>

                        </div>

                        <p>
                          {r.comment ||
                            "Great peer-learning experience."}
                        </p>

                      </div>
                    )
                  )}

                </div>

              ) : (

                <div className="no-reviews">

                  <span>💬</span>

                  <p>
                    No reviews yet. Reviews
                    can be submitted after a
                    completed learning session.
                  </p>

                </div>

              )}

            </section>

          </div>

          {/* ================= RIGHT ================= */}

          <div className="profile-sidebar">

            {/* REQUEST SESSION */}

            <section className="request-card">

              <div className="request-card-header">

                <span>🤝</span>

                <div>

                  <h2>
                    Learn with{" "}
                    {peer.name
                      ?.split(" ")[0]}
                  </h2>

                  <p>
                    Send a peer-learning
                    request
                  </p>

                </div>

              </div>

              {notice && (
                <div className="success-message">
                  ✓ {notice}
                </div>
              )}

              {error && (
                <div className="error-message">
                  ⚠ {error}
                </div>
              )}

              <form
                onSubmit={requestSession}
              >

                <div className="form-group">

                  <label>
                    Date
                  </label>

                  <input
                    type="date"
                    value={date}
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    onChange={(e) =>
                      setDate(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Time
                  </label>

                  <input
                    type="time"
                    value={time}
                    onChange={(e) =>
                      setTime(
                        e.target.value
                      )
                    }
                    required
                  />

                </div>

                <div className="form-group">

                  <label>
                    Message
                  </label>

                  <textarea
                    placeholder={`Hi ${
                      peer.name?.split(" ")[0]
                    }, I would like to learn ${
                      teachSkills[0] ||
                      "this skill"
                    } from you...`}
                    value={message}
                    onChange={(e) =>
                      setMessage(
                        e.target.value
                      )
                    }
                    rows="5"
                  />

                </div>

                <button
                  type="submit"
                  className="session-submit-button"
                >
                  Send Peer Request →
                </button>

              </form>

              <div className="request-note">
                💡 Once the request is
                accepted, you can join the
                online learning session.
              </div>

            </section>

            {/* SKILL EXCHANGE */}

            <section className="exchange-card">

              <h3>
                🔄 Skill Exchange
              </h3>

              <p>
                SkillBridge works both ways.
                You can learn from this peer
                while also sharing your own
                knowledge.
              </p>

              {peer.matchedTeachSkills
                ?.length > 0 && (

                <div className="match-detail">

                  <span>
                    They can teach you
                  </span>

                  <strong>
                    {peer.matchedTeachSkills.join(
                      ", "
                    )}
                  </strong>

                </div>
              )}

              {peer.matchedLearnSkills
                ?.length > 0 && (

                <div className="match-detail">

                  <span>
                    You can teach them
                  </span>

                  <strong>
                    {peer.matchedLearnSkills.join(
                      ", "
                    )}
                  </strong>

                </div>
              )}

            </section>

          </div>

        </div>

      </main>

    </div>
  );
}

export default MentorProfile;