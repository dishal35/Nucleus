import React from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";
import {
  FaUserShield,
  FaChalkboardTeacher,
  FaComments,
  FaLock,
  FaSearch
} from "react-icons/fa";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="navbar-logo">
          <h1>Nucleus</h1>
        </div>
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/signup">Sign Up</Link></li>
        </ul>
        <Link to="/signup" className="navbar-cta">Get Started</Link>
      </nav>

      <header className="landing-header">
        <h1 className="landing-title">Welcome to Nucleus</h1>
        <p className="landing-subtitle">
          A centralized platform for learning, teaching, and managing courses.
        </p>
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search for courses..." />
        </div>
        <div className="landing-buttons">
          <Link to="/login" className="landing-button primary">Get Started</Link>
          <Link to="/about" className="landing-button secondary">Learn More</Link>
        </div>
      </header>

      <section className="features-section">
        <h2 className="features-title">Why Choose Nucleus?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <FaUserShield className="feature-icon" />
            <h3>Role-Based Access</h3>
            <p>Admin, Instructor, and Student roles tailored to your needs.</p>
          </div>
          <div className="feature-card">
            <FaChalkboardTeacher className="feature-icon" />
            <h3>Course Management</h3>
            <p>Create, manage, and enroll in courses with ease.</p>
          </div>
          <div className="feature-card">
            <FaComments className="feature-icon" />
            <h3>Real-Time Chat</h3>
            <p>Engage with instructors and peers using WebSocket-powered chat.</p>
          </div>
          <div className="feature-card">
            <FaLock className="feature-icon" />
            <h3>Secure Authentication</h3>
            <p>Login with JWT-based authentication and refresh tokens.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2025 Nucleus. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
