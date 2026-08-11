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
            className="request-button"
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
          date,
          time,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Session request sent successfully! 🎉");

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

      {/* Navigation */}
      <nav className="dashboard-navbar">
        <div className="dashboard-logo">
          SkillBridge
        </div>

        <button
          className="logout-button"
          onClick={() => navigate("/mentors")}
        >
          Back to Mentors
        </button>
      </nav>

      {/* Profile */}
      <main className="mentor-profile-content">

        <div className="mentor-profile-card">

          {/* Mentor Avatar */}
          <div className="mentor-avatar">
            👨‍🏫
          </div>

          {/* Mentor Name */}
          <h1>
            {mentor.name}
          </h1>

          {/* Email */}
          <p className="mentor-email">
            {mentor.email}
          </p>

          {/* About */}
          <div className="mentor-section">
            <h2>
              About the Mentor
            </h2>

            <p>
              {mentor.bio}
            </p>
          </div>

          {/* Skills */}
          <div className="mentor-section">
            <h2>
              Skills
            </h2>

            <div className="skills-list">

              {mentor.skills?.map(
                (skill, index) => (
                  <span
                    className="skill-tag"
                    key={index}
                  >
                    {skill}
                  </span>
                )
              )}

            </div>
          </div>

          {/* Availability */}
          <div className="mentor-section">
            <h2>
              Available Sessions
            </h2>

            <div className="availability-list">

              {mentor.availability &&
              mentor.availability.length > 0 ? (

                mentor.availability.map(
                  (slot, index) => (
                    <div
                      className="availability-item"
                      key={index}
                    >
                      📅 {slot}
                    </div>
                  )
                )

              ) : (

                <p>
                  No availability added yet.
                </p>

              )}

            </div>
          </div>

          {/* Request Session */}
          <div className="mentor-section">

            <h2>
              Request a Session
            </h2>

            <form onSubmit={handleRequest}>

              {/* Date */}
              <div className="form-group">

                <label>
                  Date
                </label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  required
                />

              </div>

              {/* Time */}
              <div className="form-group">

                <label>
                  Time
                </label>

                <input
                  type="time"
                  value={time}
                  onChange={(e) =>
                    setTime(e.target.value)
                  }
                  required
                />

              </div>

              {/* Message */}
              <div className="form-group">

                <label>
                  Message
                </label>

                <textarea
                  placeholder="Write a message to the mentor..."
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                />

              </div>

              {/* Success */}
              {success && (
                <p className="success-message">
                  {success}
                </p>
              )}

              {/* Error */}
              {error && (
                <p className="error-message">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="request-button"
              >
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