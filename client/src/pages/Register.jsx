import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/Register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) return setError("Please fill in all fields.");
    if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
    if (formData.password.length < 6) return setError("Password must be at least 6 characters.");
    try {
      setLoading(true);
      await axios.post("http://localhost:5000/api/users/register", { name: formData.name, email: formData.email, password: formData.password, role: "student" });
      navigate("/login");
    } catch (err) { setError(err.response?.data?.message || "Registration failed. Please try again."); }
    finally { setLoading(false); }
  };
  return <div className="register-page"><div className="register-left"><div className="register-brand">Skill<span>Bridge</span></div><div className="register-hero"><p className="register-label">LEARN • SHARE • GROW</p><h1>Exchange skills.<br/><span>Grow together.</span></h1><p className="register-description">Join a peer-learning community where every student can teach what they know and learn what they need.</p><div className="register-points"><div><span>✓</span>Teach skills you already know</div><div><span>✓</span>Find students who can teach you</div><div><span>✓</span>Exchange skills through peer sessions</div></div></div></div><div className="register-right"><div className="register-card"><div className="register-card-header"><h2>Create your account</h2><p>Everyone is a peer on SkillBridge.</p></div><form onSubmit={handleSubmit}><div className="form-group"><label>Full Name</label><input name="name" placeholder="Enter your name" value={formData.name} onChange={handleChange}/></div><div className="form-group"><label>Email Address</label><input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange}/></div><div className="form-group"><label>Password</label><input type="password" name="password" placeholder="Enter your password" value={formData.password} onChange={handleChange}/></div><div className="form-group"><label>Confirm Password</label><input type="password" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange}/></div>{error && <div className="register-error">{error}</div>}<button type="submit" className="register-submit" disabled={loading}>{loading ? "Creating account..." : "Create Peer Account →"}</button></form><div className="register-login">Already have an account? <Link to="/login">Sign in</Link></div></div></div></div>;
}
export default Register;
