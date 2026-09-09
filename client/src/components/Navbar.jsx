import { Link } from "react-router-dom";
import "../styles/Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        SkillBridge
      </Link>

      <ul className="nav-links">

        <li>
          <Link to="/">Home</Link>
        </li>

        <li>
          <a href="#about">About</a>
        </li>

        <li>
          <Link to="/mentors">
            Mentors
          </Link>
        </li>

        <li>
          <Link to="/login">
            Login
          </Link>
        </li>

        <li>
          <Link to="/register">
            Register
          </Link>
        </li>

      </ul>

    </nav>
  );
}

export default Navbar;