import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Mentor.css";

function MentorIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="25"
      height="25"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19c.7-3.2 2.5-5 5.5-5s4.8 1.8 5.5 5" />
      <path d="M16 11a3 3 0 1 0 0-6" />
      <path d="M16 14c2.7 0 4.3 1.7 4.8 4" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h11" />
      <path d="m11 6 4 4-4 4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function Mentors() {
  const navigate = useNavigate();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          "http://localhost:5000/api/mentors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMentors(response.data.mentors || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to load mentors"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter((mentor) => {
    const searchText = search.toLowerCase();

    const name = mentor.name?.toLowerCase() || "";
    const bio = mentor.bio?.toLowerCase() || "";
    const skills =
      mentor.skills?.join(" ").toLowerCase() || "";

    return (
      name.includes(searchText) ||
      bio.includes(searchText) ||
      skills.includes(searchText)
    );
  });

  return (
    <div className="mentors-page">

      {/* Navbar */}
      <nav className="mentors-navbar">

        <div className="mentors-logo">
          SkillBridge
        </div>

        <button
          className="back-dashboard-button"
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>

      </nav>


      {/* Main Content */}
      <main className="mentors-content">

        {/* Header */}
        <section className="mentors-hero">

          <span className="mentors-label">
            LEARNING COMMUNITY
          </span>

          <h1>
            Find the right mentor
            <span> for you.</span>
          </h1>

          <p>
            Learn from students and mentors who have
            experience in the skills you want to develop.
          </p>

        </section>


        {/* Search */}
        <div className="mentor-search-wrapper">

          <SearchIcon />

          <input
            type="text"
            placeholder="Search by mentor name, skill or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>


        {/* Loading */}
        {loading && (
          <div className="mentors-state">

            <div className="mentor-loading-dot"></div>

            <p>
              Finding mentors...
            </p>

          </div>
        )}


        {/* Error */}
        {error && (
          <div className="mentor-error">
            {error}
          </div>
        )}


        {/* No mentors */}
        {!loading &&
          !error &&
          mentors.length === 0 && (
            <div className="empty-mentors">

              <div className="empty-mentor-icon">
                <MentorIcon />
              </div>

              <h3>
                No mentors available yet
              </h3>

              <p>
                Mentors will appear here once they
                create their profiles.
              </p>

            </div>
          )}


        {/* No search results */}
        {!loading &&
          !error &&
          mentors.length > 0 &&
          filteredMentors.length === 0 && (
            <div className="empty-mentors">

              <h3>
                No mentors found
              </h3>

              <p>
                Try searching for a different skill
                or mentor name.
              </p>

            </div>
          )}


        {/* Mentor Cards */}
        {!loading &&
          !error &&
          filteredMentors.length > 0 && (

            <section className="mentors-grid">

              {filteredMentors.map((mentor) => {

                const firstLetter =
                  mentor.name
                    ?.charAt(0)
                    ?.toUpperCase() || "M";

                return (
                  <article
                    className="mentor-card"
                    key={mentor._id}
                  >

                    {/* Card Top */}
                    <div className="mentor-card-top">

                      <div className="mentor-avatar">
                        {firstLetter}
                      </div>

                      <span className="mentor-badge">
                        Mentor
                      </span>

                    </div>


                    {/* Mentor Information */}
                    <div className="mentor-info">

                      <h2>
                        {mentor.name}
                      </h2>

                      <p className="mentor-bio">
                        {mentor.bio ||
                          "Ready to share knowledge and help other students grow."}
                      </p>

                    </div>


                    {/* Skills */}
                    <div className="mentor-skills">

                      <span className="skills-label">
                        Skills
                      </span>

                      <div className="skill-tags">

                        {mentor.skills
                          ?.slice(0, 5)
                          .map((skill, index) => (
                            <span
                              className="skill-tag"
                              key={index}
                            >
                              {skill}
                            </span>
                          ))}

                      </div>

                    </div>


                    {/* View Profile */}
                    <button
                      className="mentor-profile-button"
                      onClick={() =>
                        navigate(
                          "/mentor-profile",
                          {
                            state: { mentor },
                          }
                        )
                      }
                    >
                      <span>
                        View profile
                      </span>

                      <ArrowIcon />

                    </button>

                  </article>
                );
              })}

            </section>
          )}

      </main>

    </div>
  );
}

export default Mentors;