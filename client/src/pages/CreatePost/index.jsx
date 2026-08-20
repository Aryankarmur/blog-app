import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostEditor from '../../components/blog/PostEditor';
import { createPost } from '../../services/postService';

const CreatePost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (postData) => {
    try {
      setLoading(true);
      setError(null);
      const res = await createPost(postData);
      
      const newPostId = res.data._id;
      // Navigate to the post details page after success
      navigate(`/posts/${newPostId}`);
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else {
        setError(err.response?.data?.message || 'Unable to connect to the server. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: 'var(--space-xl)' }}>
      <PostEditor 
        loading={loading}
        error={error}
        onSubmit={handleSubmit}
        isEditMode={false}
      />
    </div>
  );
};

export default CreatePost;
