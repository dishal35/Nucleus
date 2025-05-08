import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/fetchWithAuth';
import CourseContentUpload from './CourseContentUpload';

const CourseContent = ({ courseId, isInstructor }) => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = async () => {
    try {
      const response = await fetchWithAuth(`/api/course-content/${courseId}`);
      const data = await response.json();
      if (response.ok) {
        setContent(data.data);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch course content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [courseId]);

  const handleUploadSuccess = (newContent) => {
    setContent([...content, newContent]);
  };

  const handleDelete = async (contentId) => {
    try {
      const response = await fetchWithAuth(
        `/api/course-content/${courseId}/${contentId}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        setContent(content.filter(item => item.id !== contentId));
      }
    } catch (error) {
      setError('Failed to delete content');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="course-content">
      {isInstructor && (
        <CourseContentUpload 
          courseId={courseId} 
          onUploadSuccess={handleUploadSuccess} 
        />
      )}
      
      <div className="content-list">
        {content.map(item => (
          <div key={item.id} className="content-item">
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
              View Content
            </a>
            {isInstructor && (
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseContent; 