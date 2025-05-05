import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaUser, FaPlus, FaChartLine, FaUsers, FaStar } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/LandingPage.css";

const InstructorLandingPage = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageRating: 0,
    totalCourses: 0
  });

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/course/my-courses", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setCourses(data.data);
        // Calculate statistics
        const totalStudents = data.data.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
        const totalRating = data.data.reduce((sum, course) => sum + (course.averageRating || 0), 0);
        const averageRating = data.data.length ? (totalRating / data.data.length).toFixed(1) : 0;
        
        setStats({
          totalStudents,
          averageRating,
          totalCourses: data.data.length
        });
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
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search your courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="navbar-right">
          <Link to="/profile" className="profile-link">
            <FaUser className="profile-icon" />
            <span>{user?.fullName}</span>
          </Link>
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <div className="dashboard-header">
          <div className="stats-container">
            <div className="stat-card">
              <FaUsers className="stat-icon" />
              <div className="stat-info">
                <h3>Total Students</h3>
                <p>{stats.totalStudents}</p>
              </div>
            </div>
            <div className="stat-card">
              <FaStar className="stat-icon" />
              <div className="stat-info">
                <h3>Average Rating</h3>
                <p>{stats.averageRating}</p>
              </div>
            </div>
            <div className="stat-card">
              <FaChartLine className="stat-icon" />
              <div className="stat-info">
                <h3>Total Courses</h3>
                <p>{stats.totalCourses}</p>
              </div>
            </div>
          </div>
          <Link to="/create-course" className="create-course-button">
            <FaPlus /> Create New Course
          </Link>
        </div>

        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-stats">
                <span><FaUsers /> {course.enrollmentCount || 0} Students</span>
                <span><FaStar /> {course.averageRating || 'N/A'} Rating</span>
              </div>
              <div className="course-actions">
                <Link to={`/course/${course.id}/edit`} className="edit-link">
                  Edit Course
                </Link>
                <Link to={`/course/${course.id}/students`} className="students-link">
                  View Students
                </Link>
                <Link to={`/course/${course.id}/analytics`} className="analytics-link">
                  Analytics
                </Link>
              </div>
            </div>
          ))}
          {filteredCourses.length === 0 && (
            <div className="no-courses">
              <p>No courses found. Create your first course!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InstructorLandingPage; 