import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import { useAuth } from '../context/AuthContext';
import '../styles/CourseLandingPage.css';
import Chat from '../components/Chat';
import { FaUsers, FaChartLine, FaTrash, FaEdit, FaUpload } from 'react-icons/fa';

const CourseManagementPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [course, setCourse] = useState(null);
    const [courseContent, setCourseContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [contentTitle, setContentTitle] = useState("");
    const [contentDescription, setContentDescription] = useState("");
    const [uploadError, setUploadError] = useState(null);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                const courseResponse = await fetchWithAuth(`http://localhost:5000/api/courses/get/${courseId}`);
                const courseData = await courseResponse.json();
                
                if (!courseResponse.ok) {
                    throw new Error(courseData.message || 'Failed to fetch course details');
                }
                
                setCourse(courseData.data);
                const contentResponse = await fetchWithAuth(`http://localhost:5000/api/course-content/${courseId}`);
                const contentData = await contentResponse.json();
                    
                if (!contentResponse.ok) {
                    throw new Error(contentData.message || 'Failed to fetch course content');
                }
                    
                setCourseContent(contentData.data || []);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId]);

    const handleDeleteCourse = async () => {
        if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
            try {
                const response = await fetchWithAuth(`http://localhost:5000/api/courses/delete/${courseId}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Failed to delete course");
                }

                navigate("/instructor");
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleDeleteContent = async (contentId) => {
        if (window.confirm('Are you sure you want to delete this content?')) {
            try {
                const response = await fetchWithAuth(`http://localhost:5000/api/course-content/delete/${contentId}`, {
                    method: "DELETE",
                });

                if (!response.ok) {
                    throw new Error("Failed to delete content");
                }

                setCourseContent(prev => prev.filter(content => content.id !== contentId));
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const handleFileSelect = (e) => {
        setSelectedFile(e.target.files[0]);
        setUploadError(null);
    };

    const handleUploadContent = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('title', contentTitle);
            formData.append('description', contentDescription);

            const response = await fetchWithAuth(
                `http://localhost:5000/api/course-content/upload/${courseId}`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    }
                }
            );

            const data = await response.json();
            
            if (response.ok) {
                setShowUploadForm(false);
                setSelectedFile(null);
                setContentTitle("");
                setContentDescription("");
                setUploadError(null);
                // Refresh course content
                const contentResponse = await fetchWithAuth(`http://localhost:5000/api/course-content/${courseId}`);
                const contentData = await contentResponse.json();
                setCourseContent(contentData.data || []);
            } else {
                setUploadError(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Error uploading content:', error);
            setUploadError('Failed to upload content');
        }
    };

    const toggleChat = () => {
        setShowChat((prev) => !prev);
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
                <div className="course-actions">
                    <button onClick={() => setShowUploadForm(true)} className="action-button">
                        <FaUpload /> Add Content
                    </button>
                    <button onClick={handleDeleteCourse} className="action-button delete">
                        <FaTrash /> Delete Course
                    </button>
                </div>
            </header>

            <section className="course-description">
                <h2>About This Course</h2>
                <p>{course.description}</p>
            </section>

            <section className="course-stats">
                <div className="stat-card">
                    <FaUsers className="stat-icon" />
                    <div className="stat-info">
                        <h3>Enrolled Students</h3>
                        <p>{course.enrollmentCount || 0}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <FaChartLine className="stat-icon" />
                    <div className="stat-info">
                        <h3>Content Items</h3>
                        <p>{courseContent.length}</p>
                    </div>
                </div>
            </section>

            {showUploadForm && (
                <div className="upload-content-form">
                    <h3>Upload Course Content</h3>
                    {uploadError && <div className="error-message">{uploadError}</div>}
                    <form onSubmit={handleUploadContent}>
                        <div className="form-group">
                            <label htmlFor="contentTitle">Content Title</label>
                            <input
                                type="text"
                                id="contentTitle"
                                value={contentTitle}
                                onChange={(e) => setContentTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contentDescription">Content Description</label>
                            <textarea
                                id="contentDescription"
                                value={contentDescription}
                                onChange={(e) => setContentDescription(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="file">Upload File</label>
                            <input
                                type="file"
                                id="file"
                                onChange={handleFileSelect}
                                required
                            />
                            <small>Supported formats: JPEG, PNG, PDF, MP4 (Max size: 10MB)</small>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="upload-button">
                                <FaUpload /> Upload Content
                            </button>
                            <button 
                                type="button" 
                                className="cancel-button"
                                onClick={() => setShowUploadForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <section className="course-content">
                <h2>Course Content</h2>
                {courseContent.length === 0 ? (
                    <p>No content available for this course yet.</p>
                ) : (
                    <div className="content-list">
                        {courseContent.map((content) => (
                            <div key={content.id} className="content-item">
                                <div className="content-header">
                                    <h3>{content.title}</h3>
                                    <div className="content-actions">
                                        <button 
                                            onClick={() => handleDeleteContent(content.id)}
                                            className="delete-content-button"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                                <p>{content.description}</p>
                                <a 
                                    href={content.fileUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="content-link"
                                >
                                    View Content
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="course-chat">
                <button onClick={toggleChat} className="chat-button">
                    {showChat ? 'Close Chat' : 'Open Chat with Students'}
                </button>
                {showChat && <Chat courseId={courseId} userId={user.id} />}
            </section>
        </div>
    );
};

export default CourseManagementPage; 
