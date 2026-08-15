import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/MyExpertise.css";

function MyExpertise() {
  const navigate = useNavigate();

  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMyExpertise = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/mentors/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const mentor = response.data.mentor;

        setSkills(mentor.skills?.join(", ") || "");
        setBio(mentor.bio || "");
        setAvailability(mentor.availability?.join(", ") || "");
      } catch (error) {
        console.log("No mentor profile found yet");
      }
    };

    if (token) {
      fetchMyExpertise();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      await axios.put(
        "http://localhost:5000/api/mentors/me",
        {
          skills: skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),

          bio,

          availability: availability
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Expertise updated successfully!");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update expertise"
      );
    }
  };

  return (
    <div className="expertise-page">

      {/* NAVBAR */}
      <nav className="expertise-navbar">

        <div className="expertise-logo">
          SkillBridge
        </div>

        <button
          className="expertise-back-button"
          onClick={() => navigate("/mentor-dashboard")}
        >
          ← Dashboard
        </button>

      </nav>


      {/* MAIN CONTENT */}
      <main className="expertise-content">

        {/* HERO */}
        <div className="expertise-hero">

          <span className="expertise-label">
            MENTOR PROFILE
          </span>

          <h1>
            My Expertise
          </h1>

          <p>
            Manage the skills you teach, your bio and
            your availability so students can discover you.
          </p>

        </div>


        {/* FORM CARD */}
        <div className="expertise-card">

          <form onSubmit={handleSubmit}>

            {/* SKILLS */}
            <div className="expertise-section">

              <div className="expertise-section-header">

                <div className="expertise-icon">
                  💡
                </div>

                <div>
                  <h2>Skills you can teach</h2>

                  <p>
                    Add the skills you are confident teaching.
                  </p>
                </div>

              </div>


              <div className="expertise-form-group">

                <label>
                  Teaching Skills
                </label>

                <input
                  type="text"
                  placeholder="React, JavaScript, Node.js"
                  value={skills}
                  onChange={(e) =>
                    setSkills(e.target.value)
                  }
                />

                <p className="expertise-helper">
                  Separate skills using commas.
                </p>

              </div>

            </div>


            {/* BIO */}
            <div className="expertise-section">

              <div className="expertise-section-header">

                <div className="expertise-icon">
                  👤
                </div>

                <div>
                  <h2>About you</h2>

                  <p>
                    Tell students about your experience.
                  </p>
                </div>

              </div>


              <div className="expertise-form-group">

                <label>
                  Bio
                </label>

                <textarea
                  placeholder="Tell students about your experience..."
                  value={bio}
                  onChange={(e) =>
                    setBio(e.target.value)
                  }
                  rows="5"
                />

              </div>

            </div>


            {/* AVAILABILITY */}
            <div className="expertise-section">

              <div className="expertise-section-header">

                <div className="expertise-icon">
                  🕐
                </div>

                <div>
                  <h2>Availability</h2>

                  <p>
                    Let students know when you are available.
                  </p>
                </div>

              </div>


              <div className="expertise-form-group">

                <label>
                  Available Times
                </label>

                <input
                  type="text"
                  placeholder="Monday 5 PM, Wednesday 6 PM, Saturday 10 AM"
                  value={availability}
                  onChange={(e) =>
                    setAvailability(e.target.value)
                  }
                />

                <p className="expertise-helper">
                  Separate available times using commas.
                </p>

              </div>

            </div>


            {/* MESSAGES */}
            {message && (
              <div className="expertise-success">
                {message}
              </div>
            )}

            {error && (
              <div className="expertise-error">
                {error}
              </div>
            )}


            {/* ACTIONS */}
            <div className="expertise-actions">

              <button
                type="submit"
                className="expertise-save-button"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="expertise-back-link"
                onClick={() =>
                  navigate("/mentor-dashboard")
                }
              >
                Back to Dashboard
              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default MyExpertise;