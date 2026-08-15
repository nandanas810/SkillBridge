import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/MyPortfolio.css";

function MyPortfolio() {
  const navigate = useNavigate();

  const [skillsToTeach, setSkillsToTeach] = useState([]);
  const [skillsToLearn, setSkillsToLearn] = useState([]);

  const [academicProjects, setAcademicProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const [certificateName, setCertificateName] = useState("");
  const [certificateIssuer, setCertificateIssuer] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // LOAD PORTFOLIO
  // =========================

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/users/student-portfolio",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const portfolio = response.data.portfolio;

        setSkillsToTeach(portfolio.skillsToTeach || []);
        setSkillsToLearn(portfolio.skillsToLearn || []);
        setAcademicProjects(portfolio.academicProjects || []);
        setCertificates(portfolio.certificates || []);
      } catch (err) {
        console.error("PORTFOLIO ERROR:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load portfolio."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  // =========================
  // ADD PROJECT
  // =========================

  const addProject = () => {
    if (!projectTitle.trim() || !projectDescription.trim()) {
      setError("Please enter project title and description.");
      setMessage("");
      return;
    }

    setAcademicProjects([
      ...academicProjects,
      {
        title: projectTitle.trim(),
        description: projectDescription.trim(),
      },
    ]);

    setProjectTitle("");
    setProjectDescription("");
    setError("");
    setMessage("");
  };

  // =========================
  // DELETE PROJECT
  // =========================

  const deleteProject = (index) => {
    const updatedProjects = academicProjects.filter(
      (_, i) => i !== index
    );

    setAcademicProjects(updatedProjects);
    setMessage("");
  };

  // =========================
  // ADD CERTIFICATE
  // =========================

  const addCertificate = () => {
    if (
      !certificateName.trim() ||
      !certificateIssuer.trim()
    ) {
      setError("Please enter certificate name and issuer.");
      setMessage("");
      return;
    }

    setCertificates([
      ...certificates,
      {
        name: certificateName.trim(),
        issuer: certificateIssuer.trim(),
      },
    ]);

    setCertificateName("");
    setCertificateIssuer("");
    setError("");
    setMessage("");
  };

  // =========================
  // DELETE CERTIFICATE
  // =========================

  const deleteCertificate = (index) => {
    const updatedCertificates = certificates.filter(
      (_, i) => i !== index
    );

    setCertificates(updatedCertificates);
    setMessage("");
  };

  // =========================
  // SAVE PORTFOLIO
  // =========================

  const savePortfolio = async () => {
    try {
      setMessage("");
      setError("");
      setSaving(true);

      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/api/users/student-portfolio",
        {
          skillsToTeach,
          skillsToLearn,
          academicProjects,
          certificates,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Portfolio updated successfully!");
    } catch (err) {
      console.error("SAVE PORTFOLIO ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update portfolio."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="portfolio-loading">
        <div className="portfolio-loading-card">
          Loading your portfolio...
        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="portfolio-page">

      {/* =========================
          NAVBAR
      ========================= */}

      <nav className="portfolio-navbar">

        <div className="portfolio-logo">
          SkillBridge
        </div>

        <button
          type="button"
          className="portfolio-dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

      </nav>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="portfolio-content">

        {/* HEADER */}

        <section className="portfolio-header">

          <span className="portfolio-label">
            MY PROFILE
          </span>

          <h1>
            My Portfolio
          </h1>

          <p>
            Showcase your academic projects and
            certificates.
          </p>

        </section>


        {/* SUCCESS MESSAGE */}

        {message && (
          <div className="portfolio-message">
            <span>✓</span>
            {message}
          </div>
        )}


        {/* ERROR MESSAGE */}

        {error && (
          <div className="portfolio-error">
            {error}
          </div>
        )}


        {/* =========================
            ACADEMIC PROJECTS
        ========================= */}

        <section className="portfolio-section">

          <div className="portfolio-section-header">

            <div className="portfolio-section-icon">
              🎓
            </div>

            <div>
              <h2>
                Academic Projects
              </h2>

              <p>
                Add projects you have completed as
                part of your academic journey.
              </p>
            </div>

          </div>


          {/* PROJECT FORM */}

          <div className="portfolio-form">

            <input
              className="portfolio-input"
              type="text"
              placeholder="Project title"
              value={projectTitle}
              onChange={(e) =>
                setProjectTitle(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addProject();
                }
              }}
            />

            <textarea
              className="portfolio-textarea"
              placeholder="Describe your project..."
              value={projectDescription}
              onChange={(e) =>
                setProjectDescription(e.target.value)
              }
              rows="4"
            />

            <button
              type="button"
              className="portfolio-add-btn"
              onClick={addProject}
            >
              + Add Project
            </button>

          </div>


          {/* PROJECT LIST */}

          <div className="portfolio-items">

            {academicProjects.length === 0 ? (

              <div className="portfolio-empty">
                <div className="empty-icon">
                  📁
                </div>

                <h3>
                  No academic projects yet
                </h3>

                <p>
                  Add your first academic project
                  using the form above.
                </p>
              </div>

            ) : (

              academicProjects.map((project, index) => (

                <div
                  className="portfolio-item-card"
                  key={index}
                >

                  <div className="portfolio-item-icon">
                    📁
                  </div>

                  <div className="portfolio-item-content">

                    <h3>
                      {project.title}
                    </h3>

                    <p>
                      {project.description}
                    </p>

                  </div>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() =>
                      deleteProject(index)
                    }
                  >
                    Delete
                  </button>

                </div>

              ))

            )}

          </div>

        </section>


        {/* =========================
            CERTIFICATES
        ========================= */}

        <section className="portfolio-section">

          <div className="portfolio-section-header">

            <div className="portfolio-section-icon certificate-icon">
              📜
            </div>

            <div>
              <h2>
                Certificates
              </h2>

              <p>
                Showcase certificates and
                achievements you have earned.
              </p>
            </div>

          </div>


          {/* CERTIFICATE FORM */}

          <div className="portfolio-form">

            <input
              className="portfolio-input"
              type="text"
              placeholder="Certificate name"
              value={certificateName}
              onChange={(e) =>
                setCertificateName(e.target.value)
              }
            />

            <input
              className="portfolio-input"
              type="text"
              placeholder="Issued by"
              value={certificateIssuer}
              onChange={(e) =>
                setCertificateIssuer(e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCertificate();
                }
              }}
            />

            <button
              type="button"
              className="portfolio-add-btn"
              onClick={addCertificate}
            >
              + Add Certificate
            </button>

          </div>


          {/* CERTIFICATE LIST */}

          <div className="portfolio-items">

            {certificates.length === 0 ? (

              <div className="portfolio-empty">

                <div className="empty-icon">
                  📄
                </div>

                <h3>
                  No certificates yet
                </h3>

                <p>
                  Add your certificates and
                  achievements above.
                </p>

              </div>

            ) : (

              certificates.map((certificate, index) => (

                <div
                  className="portfolio-item-card certificate-card"
                  key={index}
                >

                  <div className="portfolio-item-icon">
                    📜
                  </div>

                  <div className="portfolio-item-content">

                    <h3>
                      {certificate.name}
                    </h3>

                    <p>
                      Issued by:{" "}
                      <strong>
                        {certificate.issuer}
                      </strong>
                    </p>

                  </div>

                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() =>
                      deleteCertificate(index)
                    }
                  >
                    Delete
                  </button>

                </div>

              ))

            )}

          </div>

        </section>


        {/* =========================
            SAVE
        ========================= */}

        <div className="portfolio-save-area">

          <button
            type="button"
            className="portfolio-save-btn"
            onClick={savePortfolio}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Portfolio"}
          </button>

        </div>

      </main>

    </div>
  );
}

export default MyPortfolio;