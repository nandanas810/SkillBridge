import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import "../styles/Mentor.css";

// =========================================
// STAR RATING
// =========================================

const Stars = ({ rating }) => (
  <span className="peer-rating">
    ★{" "}
    {Number(rating || 0).toFixed(1)}
  </span>
);

// =========================================
// MENTORS PAGE
// =========================================

function Mentors() {
  const navigate = useNavigate();

  const [peers, setPeers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =======================================
  // FETCH PEERS
  // =======================================

  const fetchPeers = async (
    skill = ""
  ) => {
    try {
      setLoading(true);

      setError("");

      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await axios.get(
          `http://localhost:5000/api/mentors?skill=${encodeURIComponent(
            skill
          )}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      setPeers(
        res.data.peers ||
          res.data.mentors ||
          []
      );
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          "Could not load peers."
      );
    } finally {
      setLoading(false);
    }
  };

  // =======================================
  // LOAD ALL PEERS
  // =======================================

  useEffect(() => {
    fetchPeers("");
  }, []);

  // =======================================
  // FRONTEND SEARCH FILTER
  //
  // IMPORTANT:
  // Search ONLY checks skillsToTeach.
  // =======================================

  const filtered = useMemo(() => {
    const q =
      search.trim().toLowerCase();

    if (!q) {
      return peers;
    }

    return peers.filter((peer) =>
      (peer.skillsToTeach || []).some(
        (skill) =>
          String(skill)
            .trim()
            .toLowerCase()
            .includes(q)
      )
    );
  }, [peers, search]);

  // =======================================
  // SEARCH BUTTON
  // =======================================

  const searchNow = () => {
    fetchPeers(search);
  };

  // =======================================
  // PAGE
  // =======================================

  return (
    <div className="mentors-page">

      {/* =================================
          NAVBAR
      ================================= */}

      <nav className="mentors-navbar">

        <div className="mentors-logo">
          SkillBridge
        </div>

        <button
          className="back-dashboard-button"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          Dashboard
        </button>

      </nav>

      {/* =================================
          MAIN
      ================================= */}

      <main className="mentors-content">

        {/* =================================
            HERO
        ================================= */}

        <section className="mentors-hero">

          <span className="mentors-label">
            PEER SKILL EXCHANGE
          </span>

          <h1>
            Find your{" "}
            <span>
              perfect skill partner.
            </span>
          </h1>

          <p>
            Every student can teach and
            learn. Search for a skill,
            compare ratings and reviews,
            and connect with peers whose
            skills match yours.
          </p>

        </section>

        {/* =================================
            SEARCH
        ================================= */}

        <div className="mentor-search-wrapper">

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                searchNow();
              }
            }}
            placeholder="Search a skill like React, Python or Java..."
          />

          <button
            className="peer-search-button"
            onClick={searchNow}
          >
            Search
          </button>

        </div>

        {/* =================================
            LOADING
        ================================= */}

        {loading ? (

          <div className="mentors-state">
            Finding skill partners...
          </div>

        ) : error ? (

          <div className="mentor-error">
            {error}
          </div>

        ) : (

          <>

            {/* =============================
                RESULTS HEADING
            ============================= */}

            <div className="peer-results-heading">

              <div>
                <strong>
                  {filtered.length}
                </strong>{" "}
                peer
                {filtered.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </div>

              <span>
                Sorted by skill match,
                rating and reviews
              </span>

            </div>

            {/* =============================
                MENTOR GRID
            ============================= */}

            <section className="mentors-grid">

              {filtered.map(
                (peer) => (

                  <article
                    className="mentor-card"
                    key={peer._id}
                  >

                    {/* =======================
                        CARD TOP
                    ======================= */}

                    <div className="mentor-card-top">

                      <div className="mentor-avatar">
                        {peer.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <span className="peer-match-badge">
                        {peer.badges?.[0] ||
                          "Active Peer"}
                      </span>

                    </div>

                    {/* =======================
                        INFO
                    ======================= */}

                    <div className="mentor-info">

                      <h2>
                        {peer.name}
                      </h2>

                      <div className="peer-meta">

                        <Stars
                          rating={
                            peer.rating
                          }
                        />

                        <span>
                          (
                          {
                            peer.reviewCount ||
                            0
                          }{" "}
                          reviews)
                        </span>

                      </div>

                      <p className="mentor-bio">
                        {peer.bio ||
                          "Ready to exchange skills with fellow students."}
                      </p>

                    </div>

                    {/* =======================
                        SKILLS
                    ======================= */}

                    <div className="peer-skill-block">

                      {/* CAN TEACH */}

                      <div>

                        <small>
                          CAN TEACH
                        </small>

                        <div className="mentor-skills">

                          {(
                            peer.skillsToTeach ||
                            []
                          )
                            .slice(0, 4)
                            .map(
                              (skill) => (
                                <span
                                  className="skill-tag"
                                  key={skill}
                                >
                                  {skill}
                                </span>
                              )
                            )}

                        </div>

                      </div>

                      {/* WANTS TO LEARN */}

                      <div>

                        <small>
                          WANTS TO LEARN
                        </small>

                        <div className="mentor-skills">

                          {(
                            peer.skillsToLearn ||
                            []
                          )
                            .slice(0, 3)
                            .map(
                              (skill) => (
                                <span
                                  className="learn-tag"
                                  key={skill}
                                >
                                  {skill}
                                </span>
                              )
                            )}

                        </div>

                      </div>

                    </div>

                    {/* =======================
                        MATCH MESSAGE
                    ======================= */}

                    <div className="peer-match-line">

                      🎯{" "}

                      {peer.matchScore >=
                      70
                        ? "Perfect two-way skill match"
                        : peer.matchScore >=
                          35
                        ? "Good skill match"
                        : "Potential learning partner"}

                    </div>

                    {/* =======================
                        PROFILE BUTTON
                    ======================= */}

                    <button
                      className="mentor-profile-button"
                      onClick={() =>
                        navigate(
                          "/mentor-profile",
                          {
                            state: {
                              mentor:
                                peer,
                            },
                          }
                        )
                      }
                    >
                      View Peer Profile →
                    </button>

                  </article>

                )
              )}

            </section>

            {/* =============================
                EMPTY
            ============================= */}

            {filtered.length ===
              0 && (

              <div className="empty-mentors">

                <h3>
                  No peers can teach "
                  {search}"
                </h3>

                <p>
                  Try another skill or
                  add more teaching skills
                  to your profile.
                </p>

              </div>

            )}

          </>

        )}

      </main>

    </div>
  );
}

export default Mentors;