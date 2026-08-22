import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/MySkills.css";

function MySkills() {
  const navigate = useNavigate();

  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);

  const [teachInput, setTeachInput] = useState("");
  const [learnInput, setLearnInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================================
  // GET STUDENT PORTFOLIO
  // =========================================

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          "http://localhost:5000/api/users/student-portfolio",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const portfolio = response.data.portfolio;

        setSkillsToTeach(portfolio?.skillsToTeach || []);
        setSkillsToLearn(portfolio?.skillsToLearn || []);
      } catch (err) {
        console.error("MY SKILLS ERROR:", err);

        setError(
          err.response?.data?.message ||
            "Could not load your skills."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [navigate]);

  // =========================================
  // ADD SKILL TO TEACH
  // =========================================

  const addTeachSkill = () => {
    const skill = teachInput.trim();

    if (!skill) return;

    const alreadyExists = skillsToTeach.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setTeachInput("");
      return;
    }

    setSkillsToTeach((prev) => [...prev, skill]);
    setTeachInput("");
  };

  // =========================================
  // ADD SKILL TO LEARN
  // =========================================

  const addLearnSkill = () => {
    const skill = learnInput.trim();

    if (!skill) return;

    const alreadyExists = skillsToLearn.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (alreadyExists) {
      setLearnInput("");
      return;
    }

    setSkillsToLearn((prev) => [...prev, skill]);
    setLearnInput("");
  };

  // =========================================
  // REMOVE TEACH SKILL
  // =========================================

  const removeTeachSkill = (skill) => {
    setSkillsToTeach((prev) =>
      prev.filter((item) => item !== skill)
    );
  };

  // =========================================
  // REMOVE LEARN SKILL
  // =========================================

  const removeLearnSkill = (skill) => {
    setSkillsToLearn((prev) =>
      prev.filter((item) => item !== skill)
    );
  };

  // =========================================
  // SAVE SKILLS
  // =========================================

  const handleSave = async () => {
    setMessage("");
    setError("");

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    setSaving(true);

    try {
      await axios.put(
        "http://localhost:5000/api/users/student-portfolio",
        {
          skillsToTeach,
          skillsToLearn,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Skills updated successfully!");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("SAVE SKILLS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save your skills."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="my-skills-page">
        <nav className="my-skills-navbar">
          <div className="my-skills-logo">
            SkillBridge
          </div>

          <button
            className="my-skills-dashboard-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Dashboard
          </button>
        </nav>

        <div className="skills-loading">
          <div className="skills-loading-dot"></div>
          <p>Loading your skills...</p>
        </div>
      </div>
    );
  }

  // =========================================
  // MAIN UI
  // =========================================

  return (
    <div className="my-skills-page">

      {/* =====================================
          NAVBAR
      ===================================== */}

      <nav className="my-skills-navbar">

        <div className="my-skills-logo">
          SkillBridge
        </div>

        <button
          className="my-skills-dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </nav>


      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <main className="my-skills-content">


        {/* ===================================
            PAGE HEADER
        =================================== */}

        <section className="my-skills-header">

          <span className="my-skills-label">
            MY PROFILE
          </span>

          <h1>
            My Skills
          </h1>

          <p>
            Tell the SkillBridge community what you
            can teach and what you want to learn.
          </p>

        </section>


        {/* ===================================
            SUCCESS MESSAGE
        =================================== */}

        {message && (
          <div className="skills-message">
            <span className="message-icon">✓</span>
            {message}
          </div>
        )}


        {/* ===================================
            ERROR MESSAGE
        =================================== */}

        {error && (
          <div className="skills-error">
            {error}
          </div>
        )}


        {/* ===================================
            SKILLS I CAN TEACH
        =================================== */}

        <section className="skill-section">

          <div className="skill-section-header">

            <div className="skill-section-icon teach-icon">
              🎓
            </div>

            <div className="skill-section-title">

              <h2>
                Skills I Can Teach
              </h2>

              <p>
                Add skills you already know and can
                help other students with.
              </p>

            </div>

          </div>


          {/* INPUT */}

          <div className="skill-input-row">

            <input
              className="skill-input"
              type="text"
              placeholder="Example: JavaScript, Python, UI/UX Design"
              value={teachInput}
              onChange={(e) =>
                setTeachInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTeachSkill();
                }
              }}
            />

            <button
              type="button"
              className="add-skill-btn"
              onClick={addTeachSkill}
            >
              + Add
            </button>

          </div>


          {/* SKILL TAGS */}

          <div className="skill-tags-container">

            {skillsToTeach.length > 0 ? (

              skillsToTeach.map((skill) => (

                <span
                  className="skill-tag skill-tag-teach"
                  key={skill}
                >

                  {skill}

                  <button
                    type="button"
                    className="remove-skill-btn"
                    onClick={() =>
                      removeTeachSkill(skill)
                    }
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>

                </span>

              ))

            ) : (

              <p className="no-skills-text">
                No teaching skills added yet.
              </p>

            )}

          </div>

        </section>


        {/* ===================================
            SKILLS I WANT TO LEARN
        =================================== */}

        <section className="skill-section">

          <div className="skill-section-header">

            <div className="skill-section-icon learn-icon">
              📚
            </div>

            <div className="skill-section-title">

              <h2>
                Skills I Want to Learn
              </h2>

              <p>
                Add skills you want to learn from
                other students in the peer-learning community.
              </p>

            </div>

          </div>


          {/* INPUT */}

          <div className="skill-input-row">

            <input
              className="skill-input"
              type="text"
              placeholder="Example: React, Node.js, MongoDB"
              value={learnInput}
              onChange={(e) =>
                setLearnInput(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLearnSkill();
                }
              }}
            />

            <button
              type="button"
              className="add-skill-btn"
              onClick={addLearnSkill}
            >
              + Add
            </button>

          </div>


          {/* SKILL TAGS */}

          <div className="skill-tags-container">

            {skillsToLearn.length > 0 ? (

              skillsToLearn.map((skill) => (

                <span
                  className="skill-tag skill-tag-learn"
                  key={skill}
                >

                  {skill}

                  <button
                    type="button"
                    className="remove-skill-btn"
                    onClick={() =>
                      removeLearnSkill(skill)
                    }
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>

                </span>

              ))

            ) : (

              <p className="no-skills-text">
                No learning skills added yet.
              </p>

            )}

          </div>

        </section>


        {/* ===================================
            SAVE BUTTON
        =================================== */}

        <div className="save-skills-area">

          <button
            type="button"
            className="save-skills-btn"
            onClick={handleSave}
            disabled={saving}
          >

            {saving ? (
              <>
                <span className="save-spinner"></span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}

          </button>

        </div>


      </main>

    </div>
  );
}

export default MySkills;