import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "../styles/MentorProfile.css";

function MentorProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const mentor = location.state?.mentor;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!mentor) {
    return (
      <div className="mentor-profile-page">
        <div className="mentor-profile-card">
          <h2>Mentor not found</h2>
          <button
            className="session-submit-button"
            onClick={() => navigate("/mentors")}
          >
            Back to Mentors
          </button>
        </div>
      </div>
    );
  }

  const handleRequest = async (e) => {
    e.preventDefault();

    setSuccess("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/sessions",
        {
          mentor: mentor._id,
          date: date,
          time: time,
          message: message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Session request sent successfully!");

      setDate("");
      setTime("");
      setMessage("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send session request"
      );
    }
  };

  return (
    <div className="mentor-profile-page">
      {/* NAVBAR */}
      <nav className="dashboard-navbar">
        <div className="dashboard-logo">SkillBridge</div>
        <button
          className="logout-button"
          onClick={() => navigate("/mentors")}
        >
          Back to Mentors
        </button>
      </nav>

      {/* MAIN */}
      <main className="mentor-profile-content">
        <div className="mentor-profile-card">
          {/* AVATAR */}
          <div className="mentor-avatar">👨‍🏫</div>

          {/* NAME */}
          <h1>{mentor.name}</h1>

          {/* EMAIL */}
          <p className="mentor-email">{mentor.email}</p>

          {/* ABOUT */}
          <div className="mentor-section">
            <h2>About the Mentor</h2>
            <p>
              {mentor.bio ||
                "Ready to share knowledge and help other students grow."}
            </p>
          </div>

          {/* SKILLS */}
          <div className="mentor-section">
            <h2>Skills</h2>
            <div className="skills-list">
              {mentor.skills && mentor.skills.length > 0 ? (
                mentor.skills.map((skill, index) => (
                  <span className="skill-tag" key={index}>
                    {skill}
                  </span>
                ))
              ) : (
                <p>No skills added yet.</p>
              )}
            </div>
          </div>

          {/* AVAILABILITY */}
          <div className="mentor-section">
            <h2>Available Sessions</h2>
            <div className="availability-list">
              {mentor.availability && mentor.availability.length > 0 ? (
                mentor.availability.map((slot, index) => (
                  <div className="availability-item" key={index}>
                    📅 {slot}
                  </div>
                ))
              ) : (
                <p>No availability added yet.</p>
              )}
            </div>
          </div>

          {/* REQUEST SESSION */}
          <div className="mentor-section">
            <h2>Request a Session</h2>

            <form onSubmit={handleRequest}>
              {/* DATE */}
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              {/* TIME */}
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>

              {/* MESSAGE */}
              <div className="form-group">
                <label>Message</label>
                <textarea
                  placeholder="Write a message to the mentor..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {/* SUCCESS */}
              {success && <p className="success-message">{success}</p>}

              {/* ERROR */}
              {error && <p className="error-message">{error}</p>}

              {/* SUBMIT BUTTON */}
              <button type="submit" className="session-submit-button">
                Send Session Request
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MentorProfile;