import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import '../styles/CourseLandingPage.css';

const CourseLandingPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [courseContent, setCourseContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                // Fetch course details
                const courseResponse = await fetchWithAuth(`http://localhost:5000/api/courses/get/${courseId}`);
                const courseData = await courseResponse.json();
                
                if (!courseResponse.ok) {
                    throw new Error(courseData.message || 'Failed to fetch course details');
                }
                
                setCourse(courseData.data);
                setIsEnrolled(courseData.data.isEnrolled);

                // Only fetch content if enrolled
                if (courseData.data.isEnrolled) {
                    const contentResponse = await fetchWithAuth(`http://localhost:5000/api/course-content/${courseId}`);
                    const contentData = await contentResponse.json();
                    
                    if (!contentResponse.ok) {
                        throw new Error(contentData.message || 'Failed to fetch course content');
                    }
                    
                    setCourseContent(contentData.data || []);
                }
                
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    const handleEnrollment = async () => {
        try {
            const response = await fetchWithAuth("http://localhost:5000/api/enrollment/enroll", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    courseId: courseId
                })
            });

            const data = await response.json();
            if (response.ok) {
                setIsEnrolled(true);
                // Fetch course content after successful enrollment
                const contentResponse = await fetchWithAuth(`http://localhost:5000/api/course-content/${courseId}`);
                const contentData = await contentResponse.json();
                if (contentResponse.ok) {
                    setCourseContent(contentData.data || []);
                }
            } else {
                throw new Error(data.message || 'Failed to enroll');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) {
        return <div className="course-landing-loading">Loading...</div>;
    }

    if (error) {
        return <div className="course-landing-error">Error: {error}</div>;
    }

    if (!course) {
        return <div className="course-landing-not-found">Course not found</div>;
    }

    return (
        <div className="course-landing-container">
            <header className="course-landing-header">
                <h1>{course.title}</h1>
                <p className="course-instructor">Instructor: {course.instructor?.fullName}</p>
            </header>

            <section className="course-description">
                <h2>About This Course</h2>
                <p>{course.description}</p>
            </section>

            {!isEnrolled ? (
                <section className="course-enrollment">
                    <h2>Course Enrollment</h2>
                    <p>Enroll in this course to access all content.</p>
                    <button onClick={handleEnrollment} className="enroll-button">
                        Enroll Now
                    </button>
                </section>
            ) : (
                <section className="course-content">
                    <h2>Course Content</h2>
                    {courseContent.length === 0 ? (
                        <p>No content available for this course yet.</p>
                    ) : (
                        <div className="content-list">
                            {courseContent.map((content) => (
                                <div key={content.id} className="content-item">
                                    <h3>{content.title}</h3>
                                    <p>{content.description}</p>
                                    <a 
                                        href={content.fileUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="content-link"
                                    >
                                        Access Content
                                    </a>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default CourseLandingPage; 
