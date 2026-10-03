import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../styles/Peerprofile.css";


function Peerprofile() {
  const navigate = useNavigate();
  const location = useLocation();

  const peer = location.state?.peer;
console.log("Received peer:", peer);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Custom time dropdown
  const [timeDropdownOpen, setTimeDropdownOpen] =
    useState(false);

  const timeDropdownRef = useRef(null);

  // =========================================
  // CLOSE TIME DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(event.target)
      ) {
        setTimeDropdownOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  if (!peer) {
    return (
      <div className="peer-profile-page">
        <div className="peer-profile-card not-found">
          <div className="not-found-icon">
            🔍
          </div>

          <h2>
            Peer not found
          </h2>

          <p>
            The peer profile could not be loaded.
          </p>

          <button
            className="back-button"
            onClick={() => navigate("/peers")}
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
    Number.isFinite(Number(peer.matchScore)) &&
    peer.matchScore !== null &&
    peer.matchScore !== undefined
      ? Number(peer.matchScore)
      : null;

  // =====================================================
  // GENERATE TIME OPTIONS WITH AM / PM
  // =====================================================

  const generateTimeOptions = () => {
    const options = [];

    for (
      let hour = 0;
      hour < 24;
      hour++
    ) {
      for (
        let minute = 0;
        minute < 60;
        minute += 30
      ) {
        const period =
          hour >= 12 ? "PM" : "AM";

        let displayHour =
          hour % 12;

        if (displayHour === 0) {
          displayHour = 12;
        }

        const displayMinute =
          String(minute).padStart(
            2,
            "0"
          );

        options.push(
          `${String(displayHour).padStart(
            2,
            "0"
          )}:${displayMinute} ${period}`
        );
      }
    }

    return options;
  };

  const timeOptions =
    generateTimeOptions();

  // =====================================================
  // FRONTEND AVAILABILITY HELPERS
  // =====================================================

  const getDayName = (dateString) => {
    if (!dateString) {
      return null;
    }

    const [year, month, day] =
      dateString
        .split("-")
        .map(Number);

    const selectedDate =
      new Date(
        Date.UTC(
          year,
          month - 1,
          day
        )
      );

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return days[
      selectedDate.getUTCDay()
    ];
  };

const parseTimeToMinutes = (timeText) => {
  if (!timeText) {
    return null;
  }

  const text = String(timeText)
    .trim()
    .toUpperCase()
    .replace(/\./g, "");

  
const twelveHourMatch = text.match(
  /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/
);


  if (twelveHourMatch) {
    let hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2] || 0);
    const period = twelveHourMatch[3];

    if (
      hour < 1 ||
      hour > 12 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    if (period === "AM" && hour === 12) {
      hour = 0;
    }

    if (period === "PM" && hour !== 12) {
      hour += 12;
    }

    return hour * 60 + minute;
  }

  // 24-hour format: 18:00
  const twentyFourHourMatch = text.match(
    /^(\d{1,2}):(\d{2})$/
  );

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);

    if (
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    return hour * 60 + minute;
  }

  return null;
};


  const availabilityMatchesDay = (
    availabilityText,
    selectedDay
  ) => {
    const text = String(
      availabilityText
    )
      .trim()
      .toLowerCase();

    const day =
      selectedDay.toLowerCase();

    if (text.includes(day)) {
      return true;
    }

    // Weekdays = Monday-Friday
    if (
      text.includes("weekday") &&
      [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
      ].includes(day)
    ) {
      return true;
    }

    // Weekends = Saturday-Sunday
    if (
      text.includes("weekend") &&
      [
        "saturday",
        "sunday",
      ].includes(day)
    ) {
      return true;
    }

    return false;
  };

 
const getAvailabilityRange = (availabilityText) => {
  const text = String(availabilityText || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");

  const rangeMatch = text.match(
    /(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)\s*(?:-|–|—|TO)\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM)?)/i
  );

  if (rangeMatch) {
    let startText = rangeMatch[1].trim();
    const endText = rangeMatch[2].trim();

    const period = endText.match(/(AM|PM)$/i);

    if (period && !/(AM|PM)$/i.test(startText)) {
      startText += ` ${period[1]}`;
    }

    const start = parseTimeToMinutes(startText);
    const end = parseTimeToMinutes(endText);

    if (start !== null && end !== null && start < end) {
      return { start, end };
    }
  }

  const singleMatch = text.match(
    /(?:^|\s)(\d{1,2}(?::\d{2})?\s*(?:AM|PM))\s*$/i
  );

  if (singleMatch) {
    const start = parseTimeToMinutes(singleMatch[1]);

    if (start !== null) {
      return { start, end: start };
    }
  }

  if (text.includes("MORNING")) {
    return { start: 6 * 60, end: 12 * 60 };
  }

  if (text.includes("AFTERNOON")) {
    return { start: 12 * 60, end: 17 * 60 };
  }

  if (text.includes("EVENING")) {
    return { start: 17 * 60, end: 22 * 60 };
  }

  if (text.includes("NIGHT")) {
    return { start: 18 * 60, end: 23 * 60 };
  }

  return null;
};


  const checkPeerAvailability = () => {
    if (
      !Array.isArray(
        availability
      ) ||
      availability.length === 0
    ) {
      return {
        available: false,
        reason:
          "This peer has not added any availability yet.",
      };
    }

    if (!date || !time) {
      return {
        available: false,
        reason:
          "Please select a date and time.",
      };
    }

    const selectedDay =
      getDayName(date);

    const selectedMinutes =
      parseTimeToMinutes(time);

    if (!selectedDay) {
      return {
        available: false,
        reason:
          "Invalid session date.",
      };
    }

    if (
      selectedMinutes === null
    ) {
      return {
        available: false,
        reason:
          "Invalid session time.",
      };
    }

    for (
      const slot of availability
    ) {
      if (
        !availabilityMatchesDay(
          slot,
          selectedDay
        )
      ) {
        continue;
      }

      const range =
        getAvailabilityRange(
          slot
        );

      if (!range) {
        continue;
      }

      
      if (
        range.start === range.end
          ? selectedMinutes === range.start
          : selectedMinutes >= range.start &&
            selectedMinutes <= range.end
      ) {
        return {
          available: true,
        };
      }

    }

    return {
      available: false,
      reason:
        `The peer is not available on ${selectedDay} at ${time}. Please choose a time within the peer's available slots.`,
    };
  };

  // =====================================================
  // SEND PEER REQUEST
  // =====================================================

  const requestSession = async (
    e
  ) => {
    e.preventDefault();

    setNotice("");
    setError("");

    try {
      const token =
        sessionStorage.getItem(
          "token"
        );

      if (!token) {
        navigate("/login");
        return;
      }

      // Check frontend availability
      const availabilityCheck =
        checkPeerAvailability();

      if (
        !availabilityCheck.available
      ) {
        setError(
          availabilityCheck.reason
        );
        return;
      }

      // Check user ID
      if (!peer.userId) {
        setError(
          "Peer user ID is missing. Please refresh the peer list."
        );
        return;
      }

      // Send request to backend
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
    <div className="peer-profile-page">

      {/* ================= NAVBAR ================= */}

      <nav className="dashboard-navbar">

        <div className="dashboard-logo">
          SkillBridge
        </div>

        <button
          className="logout-button"
          onClick={() =>
            navigate("/peers")
          }
        >
          ← Back to Peers
        </button>

      </nav>

      <main className="peer-profile-content">

        {/* ================= PROFILE HERO ================= */}

        <section className="profile-hero-card">

          <div className="profile-hero-top">

            <div className="large-peer-avatar">
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
                {matchScore !== null
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

        {matchScore !== null && (
          <section className="skill-match-banner">

            <div className="match-icon">
              🎯
            </div>

            <div>

              <h3>
                {peer.matchLabel ||
                  (peer.matchedTeachSkills?.length > 0 &&
                  peer.matchedLearnSkills?.length > 0
                    ? matchScore >= 100
                      ? "Perfect two-way skill match"
                      : "Good skill match"
                    : peer.matchedTeachSkills?.length > 0 ||
                      peer.matchedLearnSkills?.length > 0
                    ? "Potential learning partner"
                    : "No direct skill match")}
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
                        <p>
                          {slot}
                        </p>
                      </div>
                    )
                  )}

                </div>

              ) : (

                <div className="availability-item">
                  <span>✓</span>

                  <p>
                    This peer has not added
                    any availability yet.
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

                {/* DATE */}

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
                    onChange={(e) => {
                      setDate(
                        e.target.value
                      );
                      setError("");
                    }}
                    required
                  />

                </div>

                {/* =================================
                    TIME - CUSTOM AM / PM DROPDOWN
                ================================= */}

                <div className="form-group">

                  <label>
                    Time
                  </label>

                  <div
                    className="custom-time-picker"
                    ref={timeDropdownRef}
                  >

                    <button
                      type="button"
                      className={`custom-time-button ${
                        timeDropdownOpen
                          ? "active"
                          : ""
                      }`}
                      onClick={() => {
                        setTimeDropdownOpen(
                          (previous) =>
                            !previous
                        );
                        setError("");
                      }}
                    >

                      <span
                        className={
                          time
                            ? "selected-time"
                            : "time-placeholder"
                        }
                      >
                        {time ||
                          "Select time"}
                      </span>

                      <span
                        className={`time-arrow ${
                          timeDropdownOpen
                            ? "open"
                            : ""
                        }`}
                      >
                        ▾
                      </span>

                    </button>

                    {timeDropdownOpen && (
                      <div className="custom-time-menu">

                        {timeOptions.map(
                          (option) => (
                            <button
                              type="button"
                              key={option}
                              className={`custom-time-option ${
                                time === option
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() => {
                                setTime(
                                  option
                                );

                                setTimeDropdownOpen(
                                  false
                                );

                                setError("");
                              }}
                            >
                              {option}
                            </button>
                          )
                        )}

                      </div>
                    )}

                  </div>

                </div>

                {/* MESSAGE */}

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
                💡 Select a date and time
                that falls within this
                peer's availability.
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

export default Peerprofile;



