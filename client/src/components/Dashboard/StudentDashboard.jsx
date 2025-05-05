import React from "react";
import "../../styles/Dashboard.css";

const StudentDashboard = () => {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Student Dashboard</h1>
      <div className="dashboard-content">
        <p>Welcome, Student! Here are your tools:</p>
        <ul>
          <li><a href="/enrolled-courses">View Enrolled Courses</a></li>
          <li><a href="/available-courses">Browse Available Courses</a></li>
          <li><a href="/progress">Track Your Progress</a></li>
        </ul>
      </div>
    </div>
  );
};

export default StudentDashboard;