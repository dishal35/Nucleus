import React from "react";
import "../../styles/Dashboard.css";

const InstructorDashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Instructor Dashboard</h1>
      <div className="dashboard-content">
        <p>Welcome, Instructor! Here are your tools:</p>
        <ul>
          <li><a href="/my-courses">View My Courses</a></li>
          <li><a href="/create-course">Create a New Course</a></li>
          <li><a href="/student-progress">Track Student Progress</a></li>
        </ul>
      </div>
    </div>
  );
};

export default InstructorDashboard;