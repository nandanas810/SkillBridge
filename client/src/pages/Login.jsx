import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post(
                "http://localhost:5000/api/users/login",
                {
                    email,
                    password
                }
            );

            localStorage.setItem("token", response.data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

           if (response.data.user.role === "mentor") {
    navigate("/mentor-dashboard");
} else {
    navigate("/dashboard");
}

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Login failed. Please try again."
            );
        }
    };

    return (
        <div className="login-page">

            {/* LEFT BRANDING SECTION */}
            <div className="login-left">

                <div className="login-brand">
                    Skill<span>Bridge</span>
                </div>

                <div className="login-hero">

                    <div className="login-label">
                        LEARN • SHARE • GROW
                    </div>

                    <h1>
                        Welcome<br />
                        <span>back.</span>
                    </h1>

                    <p className="login-description">
                        Continue your learning journey and connect
                        with students and mentors who help you grow.
                    </p>

                    <div className="login-points">

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

                <div className="login-footer">
                    © 2026 SkillBridge
                </div>

            </div>


            {/* RIGHT LOGIN SECTION */}
            <div className="login-right">

                <div className="login-card">

                    <div className="login-heading">

                        <div className="login-small-title">
                            WELCOME BACK
                        </div>

                        <h2>
                            Sign in to SkillBridge
                        </h2>

                        <p>
                            Continue where you left off.
                        </p>

                    </div>


                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}


                    <form onSubmit={handleSubmit}>

                        <div className="form-group">

                            <label>Email Address</label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                        </div>


                        <button
                            type="submit"
                            className="login-button"
                        >
                            Sign In →
                        </button>

                    </form>


                    <p className="login-register">

                        Don't have an account?

                        <Link to="/register">
                            Create an account
                        </Link>

                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;