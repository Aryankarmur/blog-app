import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostEditor from '../../components/blog/PostEditor';
import { getPostById, updatePost } from '../../services/postService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [initialData, setInitialData] = useState(null);
  const [isFetching, setIsFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsFetching(true);
        const res = await getPostById(id);
        setInitialData(res.data);
      } catch (err) {
        if (err.response?.status === 404 || err.response?.status === 400) {
          setError('Article not found.');
        } else {
          setError('Failed to load article for editing.');
        }
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchPost();
  }, [id]);

  const handleSubmit = async (postData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await updatePost(id, postData);
      
      const updatedPostId = res.data._id;
      navigate(`/posts/${updatedPostId}`);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError("You don't have permission to edit this article.");
      } else {
        setError(err.response?.data?.message || 'Unable to save changes. Please try again.');
      }
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-3xl)' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !initialData) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: 'var(--space-3xl)' }}>
        <h2 style={{ marginBottom: 'var(--space-lg)' }}>{error}</h2>
        <button className="btn-outline" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: 'var(--space-xl)' }}>
      <PostEditor 
        initialData={initialData}
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        isEditMode={true}
      />
    </div>
  );
};

export default EditPost;
