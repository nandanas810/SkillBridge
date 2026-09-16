import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/MyExpertise.css";

export default function MyExpertise() {
  const navigate = useNavigate();

  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [teach, setTeach] = useState("");
  const [learn, setLearn] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/mentors/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const profile = response.data.mentor;

        setTeach((profile.skillsToTeach || []).join(", "));
        setLearn((profile.skillsToLearn || []).join(", "));
        setBio(profile.bio || "");
        setAvailability((profile.availability || []).join("\n"));
      } catch (error) {
        console.error("Failed to load peer profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const save = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");

      // Convert each availability line into one array item
      const availabilityList = availability
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

      await axios.put(
        "http://localhost:5000/api/mentors/me",
        {
          skillsToTeach: teach
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),

          skillsToLearn: learn
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean),

          bio,

          availability: availabilityList,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Peer profile updated successfully!");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Could not update profile"
      );
    }
  };

  return (
    <div className="expertise-page">

      <nav className="expertise-navbar">
        <div className="expertise-logo">
          SkillBridge
        </div>

        <button
          className="expertise-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </nav>

      <main className="expertise-content">

        <div className="expertise-hero">
          <span className="expertise-label">
            PEER PROFILE
          </span>

          <h1>My Peer Profile</h1>

          <p>
            Tell other students what you can teach,
            what you want to learn and when you are available.
          </p>
        </div>

        <div className="expertise-card">

          <form onSubmit={save}>

            {/* SKILLS TO TEACH */}
            <div className="expertise-section">

              <div className="expertise-section-header">
                <div className="expertise-icon">
                  🎓
                </div>

                <div>
                  <h2>Skills I can teach</h2>

                  <p>
                    Skills you can share with another student.
                  </p>
                </div>
              </div>

              <input
                value={teach}
                onChange={(e) => setTeach(e.target.value)}
                placeholder="Python, React, JavaScript"
              />

            </div>


            {/* SKILLS TO LEARN */}
            <div className="expertise-section">

              <div className="expertise-section-header">
                <div className="expertise-icon">
                  📚
                </div>

                <div>
                  <h2>Skills I want to learn</h2>

                  <p>
                    Skills you are looking for from peers.
                  </p>
                </div>
              </div>

              <input
                value={learn}
                onChange={(e) => setLearn(e.target.value)}
                placeholder="React, MongoDB"
              />

            </div>


            {/* BIO */}
            <div className="expertise-section">

              <div className="expertise-section-header">
                <div className="expertise-icon">
                  👤
                </div>

                <div>
                  <h2>About me</h2>
                </div>
              </div>

              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows="4"
                placeholder="Tell peers about your learning interests..."
              />

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
                    Add one available time slot per line.
                  </p>
                </div>

              </div>

              <textarea
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                rows="5"
                placeholder={`Monday 6:00 PM - 8:00 PM
Tuesday 6:00 PM - 8:00 PM
Saturday 10:00 AM - 1:00 PM`}
              />

              <small>
                Example: Monday 6:00 PM - 8:00 PM
              </small>

            </div>


            {/* MESSAGES */}
            {message && (
              <p className="success-message">
                {message}
              </p>
            )}

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}


            <button
              className="session-submit-button"
              type="submit"
            >
              Save Peer Profile
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}