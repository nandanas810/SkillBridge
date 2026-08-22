import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/MentorDashboard.css";

function MentorDashboard() {
    const navigate = useNavigate();
const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
};
    const user = JSON.parse(localStorage.getItem("user"));

    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileMissing, setProfileMissing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchMentorProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:5000/api/mentors/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setMentor(response.data.mentor);
                setProfileMissing(false);

            } catch (err) {
                if (err.response?.status === 404) {
                    setProfileMissing(true);
                } else {
                    setError(
                        err.response?.data?.message ||
                        "Failed to load mentor profile"
                    );
                }

            } finally {
                setLoading(false);
            }
        };

        fetchMentorProfile();
    }, []);

    return (
        <div className="mentor-dashboard-page">

            {/* NAVBAR */}
            <nav className="mentor-dashboard-navbar">

                <div className="mentor-dashboard-logo">
                    SkillBridge
                </div>

                <button
    className="mentor-logout-button"
    onClick={handleLogout}
>
    Logout
</button>

            </nav>


            {/* MAIN CONTENT */}
            <main className="mentor-dashboard-content">

                {/* HEADER */}
                <div className="mentor-dashboard-header">

                    <span className="mentor-dashboard-label">
                        MENTOR SPACE
                    </span>

                    <h1>
                        Welcome, <span>{user?.name}</span>
                    </h1>

                    <p>
                        Manage your expertise, student requests and
                        learning sessions from one place.
                    </p>

                </div>


                {/* ERROR */}
                {error && (
                    <div className="mentor-dashboard-error">
                        {error}
                    </div>
                )}


                {/* LOADING */}
                {loading && (
                    <div className="mentor-dashboard-loading">

                        <span className="mentor-loading-dot"></span>

                        Loading your mentor profile...

                    </div>
                )}


                {/* PROFILE NOT CREATED */}
                {!loading && profileMissing && (
                    <div className="mentor-setup-card">

                        <div className="mentor-setup-icon">
                            👨‍🏫
                        </div>

                        <h2>
                            Complete Your Mentor Profile
                        </h2>

                        <p>
                            Your mentor account is ready! Add your
                            expertise, skills and availability so
                            students can discover you and request
                            learning sessions.
                        </p>

                        <button
                            className="mentor-primary-button"
                            onClick={() =>
                                navigate("/my-expertise")
                            }
                        >
                            Complete Profile →
                        </button>

                    </div>
                )}


                {/* EXISTING MENTOR PROFILE */}
                {!loading && mentor && (

                    <div className="mentor-profile-overview">

                        {/* PROFILE CARD */}
                        <div className="mentor-dashboard-profile">

                            <div className="mentor-profile-heading">

                                <div className="mentor-dashboard-avatar">
                                    👨‍🏫
                                </div>

                                <div>
                                    <h2>
                                        {mentor.name}
                                    </h2>

                                    <span>
                                        Mentor Profile
                                    </span>
                                </div>

                            </div>


                            {/* BIO */}
                            <div className="mentor-dashboard-bio">

                                <strong>
                                    About Me
                                </strong>

                                {mentor.bio ||
                                    "No bio added yet."}

                            </div>

                        </div>


                        {/* SKILLS */}
                        <div className="mentor-info-card">

                            <h3>
                                Skills I Teach
                            </h3>

                            <div className="mentor-dashboard-skills">

                                {mentor.skills?.length > 0 ? (

                                    mentor.skills.map(
                                        (skill, index) => (

                                            <span
                                                className="mentor-dashboard-skill"
                                                key={index}
                                            >
                                                {skill}
                                            </span>

                                        )
                                    )

                                ) : (

                                    <p className="mentor-no-data">
                                        No skills added yet.
                                    </p>

                                )}

                            </div>

                        </div>


                        {/* AVAILABILITY */}
                        <div className="mentor-info-card">

                            <h3>
                                My Availability
                            </h3>

                            <div className="mentor-dashboard-availability">

                                {mentor.availability?.length > 0 ? (

                                    mentor.availability.map(
                                        (slot, index) => (

                                            <div
                                                className="mentor-availability-slot"
                                                key={index}
                                            >
                                                🕐 {slot}
                                            </div>

                                        )
                                    )

                                ) : (

                                    <p className="mentor-no-data">
                                        No availability added yet.
                                    </p>

                                )}

                            </div>

                        </div>


                        {/* NAVIGATION CARDS */}
                        <div className="mentor-dashboard-actions">

                            {/* MY EXPERTISE */}
                            <div
                                className="mentor-action-card"
                                onClick={() =>
                                    navigate("/my-expertise")
                                }
                            >

                                <div className="mentor-action-icon">
                                    🎯
                                </div>

                                <h3>
                                    My Expertise
                                </h3>

                                <p>
                                    Update the skills and
                                    information students see.
                                </p>

                            </div>


                            {/* STUDENT REQUESTS */}
                            <div
                                className="mentor-action-card"
                                onClick={() =>
                                    navigate("/student-requests")
                                }
                            >

                                <div className="mentor-action-icon">
                                    👥
                                </div>

                                <h3>
                                    Student Requests
                                </h3>

                                <p>
                                    View and manage requests
                                    from students.
                                </p>

                            </div>


                            {/* MY SESSIONS */}
                            <div
                                className="mentor-action-card"
                                onClick={() =>
                                    navigate("/my-sessions")
                                }
                            >

                                <div className="mentor-action-icon">
                                    📅
                                </div>

                                <h3>
                                    My Sessions
                                </h3>

                                <p>
                                    View your upcoming and
                                    completed sessions.
                                </p>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </div>
    );
}

export default MentorDashboard;
