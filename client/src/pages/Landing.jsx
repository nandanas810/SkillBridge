import Navbar from "../components/Navbar";
import "../styles/Landing.css";

function Landing() {
  return (
    <>
      <Navbar />

      <section className="hero">

        <div className="hero-content">

          <span className="tagline">
            🚀 India's Student Skill Sharing Platform
          </span>

          <h1>
            Learn Together.
            <br />
            Grow Faster.
          </h1>

          <p>
            SkillBridge connects students who want to learn with students
            who can teach. Find mentors, share your knowledge, build your
            skills, and grow together.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-btn"
              onClick={() => (window.location.href = "/register")}
            >
              Get Started →
            </button>

            <button
              className="secondary-btn"
              onClick={() => (window.location.href = "/mentors")}
            >
              Browse Mentors →
            </button>

          </div>


          <div className="stats">

            <div className="stat-card">
              <h3>500+</h3>
              <p>Students</p>
            </div>

            <div className="stat-card">
              <h3>100+</h3>
              <p>Mentors</p>
            </div>

            <div className="stat-card">
              <h3>4.9 ★</h3>
              <p>Average Rating</p>
            </div>

          </div>

        </div>

      </section>

    </>
  );
}

export default Landing;