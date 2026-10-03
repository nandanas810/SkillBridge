
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import "../styles/Peers.css";


// =========================================
// STAR RATING
// =========================================

const Stars = ({ rating }) => (
  <span className="peers-rating">
    ★{" "}
    {Number(rating || 0).toFixed(1)}
  </span>
);

// =========================================
// PEERS PAGE
// =========================================

function Peers() {
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
        sessionStorage.getItem(
          "token"
        );

      const res =
        await axios.get(
          `http://localhost:5000/api/peers?skill=${encodeURIComponent(
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
    <div className="peers-page">

      {/* =================================
          NAVBAR
      ================================= */}

      <nav className="peers-navbar">

        <div className="peers-logo">
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

      <main className="peers-content">

        {/* =================================
            HERO
        ================================= */}

        <section className="peers-hero">

          <span className="peers-label">
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

        <div className="peers-search-wrapper">

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
            className="peers-search-button"
            onClick={searchNow}
          >
            Search
          </button>

        </div>

        {/* =================================
            LOADING
        ================================= */}

        {loading ? (

          <div className="peers-state">
            Finding skill partners...
          </div>

        ) : error ? (

          <div className="peers-error">
            {error}
          </div>

        ) : (

          <>

            {/* =============================
                RESULTS HEADING
            ============================= */}

           <div className="peers-results-heading">

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
                PEER GRID
            ============================= */}

            <section className="peers-grid">

              {filtered.map(
                (peer) => (

                  <article
                    className="peers-card"
                    key={peer._id}
                  >

                    {/* =======================
                        CARD TOP
                    ======================= */}

                    <div className="peers-card-top">

                      <div className="peers-avatar">
                        {peer.name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </div>

                      <span className="peers-match-badge">
                        {peer.badges?.[0] ||
                          "Active Peer"}
                      </span>

                    </div>

                    {/* =======================
                        INFO
                    ======================= */}

                    <div className="peers-info">

                      <h2>
                        {peer.name}
                      </h2>

                      <div className="peers-meta">

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

                      <p className="peers-bio">
                        {peer.bio ||
                          "Ready to exchange skills with fellow students."}
                      </p>

                    </div>

                    {/* =======================
                        SKILLS
                    ======================= */}

                    <div className="peers-skill-block">

                      {/* CAN TEACH */}

                      <div>

                        <small>
                          CAN TEACH
                        </small>

                        <div className="peers-skills">

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

                        <div className="peers-skills">

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

<div className="peers-match-line">
  🎯{" "}
  {peer.matchLabel || "No direct skill match"}
  {Number.isFinite(Number(peer.matchScore)) &&
    ` · ${Number(peer.matchScore)}% match`}
</div>


                    {/* =======================
                        PROFILE BUTTON
                    ======================= */}

                    <button
                      className="peers-profile-button"
                      onClick={() =>
                        navigate(
                          "/peer-profile",
                          {
                            state: {
                              peer:
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

              <div className="empty-peers">

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

export default Peers;














