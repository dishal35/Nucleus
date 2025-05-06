import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaUser, FaPlus, FaChartLine, FaUsers } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/LandingPage.css";

const InstructorLandingPage = () => {
  console.log("InstructorLandingPage rendering", new Date().toISOString());

  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });

  const handleCreateClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Create button clicked", new Date().toISOString());
    setShowCreateForm(prev => !prev);
  }, []);

  useEffect(() => {
    console.log("Component mounted", new Date().toISOString());
    fetchMyCourses();
    return () => {
      console.log("Component unmounting", new Date().toISOString());
    };
  }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/courses/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token for authentication
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCourses(data.data);

        // Calculate statistics
        const totalStudents = data.data.reduce((sum, course) => sum + (course.enrollmentCount || 0), 0);
        setStats({
          totalStudents,
          totalCourses: data.data.length,
        });
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/courses/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Include token for authentication
        },
        body: JSON.stringify(newCourse),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Course created:", data.data);
        setShowCreateForm(false); // Hide the form after successful creation
        setNewCourse({ title: "", description: "" }); // Reset form inputs
        await fetchMyCourses(); // Refresh the course list
      } else {
        console.error("Error creating course:", data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="landing-container" data-testid="instructor-landing">
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
              <FaChartLine className="stat-icon" />
              <div className="stat-info">
                <h3>Total Courses</h3>
                <p>{stats.totalCourses}</p>
              </div>
            </div>
          </div>
        </div>

        <div style={{ margin: '20px 0', textAlign: 'center' }}>
          <button
            type="button"
            data-testid="create-course-button"
            style={{
              padding: '10px 20px',
              backgroundColor: '#9b59b6',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              position: 'relative',
              zIndex: 1000
            }}
            onClick={handleCreateClick}
          >
            Create New Course
          </button>
        </div>

        {showCreateForm && (
          <div className="create-course-form" onClick={(event) => event.stopPropagation()}>
            <h3>Create a New Course</h3>
            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label htmlFor="title">Course Title</label>
                <input
                  type="text"
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Enter course title"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Course Description</label>
                <textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Enter course description"
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-button">
                Create Course
              </button>
            </form>
          </div>
        )}

        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-stats">
                <span>
                  <FaUsers /> {course.enrollmentCount || 0} Students
                </span>
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

// Add display name for React DevTools
InstructorLandingPage.displayName = 'InstructorLandingPage';

export default React.memo(InstructorLandingPage);