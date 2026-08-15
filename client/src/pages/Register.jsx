import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://localhost:5000/api/users/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">

      <div className="register-left">
        <div className="register-brand">
          Skill<span>Bridge</span>
        </div>

        <div className="register-hero">
          <p className="register-label">LEARN • SHARE • GROW</p>

          <h1>
            Build skills.
            <br />
            <span>Build connections.</span>
          </h1>

          <p className="register-description">
            Join SkillBridge and connect with students and mentors
            who can help you grow your skills.
          </p>

          <div className="register-points">
            <div>
              <span>✓</span>
              Learn from experienced peers
            </div>

            <div>
              <span>✓</span>
              Share your own skills
            </div>

            <div>
              <span>✓</span>
              Book personalized sessions
            </div>
          </div>
        </div>

        <div className="register-footer">
          © 2026 SkillBridge
        </div>
      </div>

      <div className="register-right">

        <div className="register-card">

          <div className="register-heading">
            <p className="register-small-title">
              CREATE YOUR ACCOUNT
            </p>

            <h2>Join SkillBridge</h2>

            <p>
              Start your learning journey today.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>I want to join as</label>

              <div className="role-selection">

                <button
                  type="button"
                  className={
                    formData.role === "student"
                      ? "role-option active"
                      : "role-option"
                  }
                  onClick={() =>
                    setFormData({
                      ...formData,
                      role: "student",
                    })
                  }
                >
                  <span className="role-icon">🎓</span>

                  <span>
                    <strong>Student</strong>
                    <small>Learn new skills</small>
                  </span>
                </button>

                <button
                  type="button"
                  className={
                    formData.role === "mentor"
                      ? "role-option active"
                      : "role-option"
                  }
                  onClick={() =>
                    setFormData({
                      ...formData,
                      role: "mentor",
                    })
                  }
                >
                  <span className="role-icon">👨‍🏫</span>

                  <span>
                    <strong>Mentor</strong>
                    <small>Share your skills</small>
                  </span>
                </button>

              </div>
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="register-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="register-submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account →"}
            </button>

          </form>

          <div className="register-login">
            Already have an account?

            <Link to="/login">
              Sign in
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Register;