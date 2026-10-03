
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/users/login",
        { email, password }
      );

      if (response.data.token) {
        sessionStorage.setItem("token", response.data.token);
      }

      if (response.data.user) {
        sessionStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    }
  };

  return (
    <div className="login-page">
      {/* LEFT BRANDING PANEL */}
      <section className="login-left">
        <div className="login-brand">
          Skill<span>Bridge</span>
        </div>

        <div className="login-hero">
          <div className="login-label">LEARN TOGETHER. GROW TOGETHER.</div>

          <h1>
            Your skills.
            <br />
            Your community.
            <br />
            <span>Your future.</span>
          </h1>

          <p className="login-description">
            Connect with fellow learners, exchange skills, and grow
            together through peer-to-peer learning.
          </p>

          <div className="login-points">
            <div>
              <span>✓</span>
              Learn new skills from fellow students
            </div>
            <div>
              <span>✓</span>
              Share what you know with others
            </div>
            <div>
              <span>✓</span>
              Grow through meaningful connections
            </div>
          </div>
        </div>

        <div className="login-footer">
          © 2026 SkillBridge. Learn and grow together.
        </div>
      </section>

      {/* RIGHT LOGIN PANEL */}
      <section className="login-right">
        <div className="login-card">
          <div className="login-heading">
            <div className="login-small-title">WELCOME BACK</div>
            <h2>Sign in to SkillBridge</h2>
            <p>Continue your learning journey.</p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>

              <div className="password-input-wrapper">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                      <path d="M9.9 5.2A11 11 0 0 1 12 5c5 0 9 4.5 10 7a12 12 0 0 1-4 5" />
                      <path d="M6.6 6.6C4.2 8 2.5 10.3 2 12c1 2.5 5 7 10 7a10 10 0 0 0 3-.5" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button">
              Sign In
            </button>
          </form>

          <div className="login-register">
            Don't have an account?
            <Link to="/register">Register</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;

