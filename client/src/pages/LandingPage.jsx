import React, { useState, useEffect } from "react";
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
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/course");
      const data = await response.json();
      if (response.ok) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      </nav>

      <header className="landing-header">
        <h1 className="landing-title">Welcome to Nucleus</h1>
        <p className="landing-subtitle">
          A centralized platform for learning, teaching, and managing courses.
        </p>
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="landing-buttons">
          <Link to="/signup" className="landing-button primary">Get Started</Link>
          <Link to="/about" className="landing-button secondary">Learn More</Link>
        </div>
      </header>

      <section className="courses-section">
        <h2>Featured Courses</h2>
        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p className="instructor">Instructor: {course.instructor?.fullName}</p>
              <Link to="/login" className="course-link">
                Login to Enroll
              </Link>
            </div>
          ))}
        </div>
      </section>

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
