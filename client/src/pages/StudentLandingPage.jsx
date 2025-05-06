import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaUser, FaBook, FaGraduationCap } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/LandingPage.css";

const StudentLandingPage = () => {
  const { user, logout } = useAuth();
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("available"); // "available" or "enrolled"

  useEffect(() => {
    fetchAvailableCourses();
    fetchEnrolledCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/courses/get", {
        method:"GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setAvailableCourses(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching available courses:", error);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/courses/enrolled", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        setEnrolledCourses(data.data|| []);
      }
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    }
  };

  const handleEnrollment = async (course) => {
    try{
      const response=await fetch("http://localhost:5000/api/enrollment/enroll",{
        credentials:"include",
        method:"POST",
        headers:
        {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          courseId: course.id
        })
        });
      const data = await response.json();
      if (response.ok) {
        // Refresh both course lists after successful enrollment
        
        await fetchAvailableCourses();
        await fetchEnrolledCourses();
      } else {
        console.error("Error enrolling in course:", data.message);
      }
    } catch (error) {
      console.error("Error during enrollment:", error);
    }
  }

  // Always fetch enrolled courses when switching to 'enrolled' tab
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "enrolled") {
      fetchEnrolledCourses();
    }
  };

  const filteredCourses = (activeTab === "available" ? availableCourses : enrolledCourses).filter(course =>
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
            placeholder={`Search ${activeTab} courses...`}
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
        <div className="tabs">
          <button 
            className={`tab ${activeTab === "available" ? "active" : ""}`}
            onClick={() => handleTabClick("available")}
          >
            <FaBook /> Available Courses
          </button>
          <button 
            className={`tab ${activeTab === "enrolled" ? "active" : ""}`}
            onClick={() => handleTabClick("enrolled")}
          >
            <FaGraduationCap /> My Courses
          </button>
        </div>

        <div className="courses-grid">
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <p className="instructor">Instructor: {course.instructor?.fullName}</p>
              {activeTab === "available" ? (
                <>
                  <Link to={`/course/${course.id}`} className="course-link">
                    View Course
                  </Link>
                  <button
                    className="enroll-button"
                    onClick={() => handleEnrollment(course)}
                  >
                    Enroll
                  </button>
                </>
              ) : (
                <Link to={`/course/${course.id}/learn`} className="course-link">
                  Continue Learning
                </Link>
              )}
            </div>
          ))}
          {filteredCourses.length === 0 && (
            <div className="no-courses">
              <p>No {activeTab} courses found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentLandingPage; 