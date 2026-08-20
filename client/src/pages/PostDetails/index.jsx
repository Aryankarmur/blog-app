import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Eye } from 'lucide-react';
import { getPostById } from '../../services/postService';
import AuthorInfo from '../../components/blog/AuthorInfo';
import ErrorMessage from '../../components/common/ErrorMessage';
import './PostDetails.css';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsNotFound(false);
        
        const res = await getPostById(id);
        const fetchedPost = res.data;
        
        if (!fetchedPost) {
          setIsNotFound(true);
          return;
        }

        setPost(fetchedPost);
        
        // Basic SEO document title
        document.title = `${fetchedPost.title} | DevBlog`;

      } catch (err) {
        // Handle 404 or Invalid ObjectId (usually 400 or 500 depending on backend)
        if (err.response && (err.response.status === 404 || err.response.status === 400)) {
          setIsNotFound(true);
        } else {
          setError('Failed to load article. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();

    return () => {
      document.title = 'DevBlog'; // Cleanup title on unmount
    };
  }, [id]);

  if (loading) {
    return (
      <div className="post-details-container container">
        <div className="post-skeleton">
          <div className="skeleton-line category"></div>
          <div className="skeleton-line title"></div>
          <div className="skeleton-line title-short"></div>
          <div className="skeleton-line excerpt"></div>
          <div className="skeleton-author-block">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-author-text">
              <div className="skeleton-line short"></div>
              <div className="skeleton-line shortest"></div>
            </div>
          </div>
          <div className="skeleton-image-block"></div>
          <div className="skeleton-content-block">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
            <br/>
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
            <div className="skeleton-line short"></div>
          </div>
        </div>
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="post-not-found container">
        <h1>Article not found</h1>
        <p>The article you're looking for doesn't exist or may have been removed.</p>
        <button className="btn-outline" onClick={() => navigate('/explore')}>
          Back to Explore
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-error container">
        <ErrorMessage message={error} />
        <button className="btn-outline" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!post) return null;

  return (
    <article className="post-details-container container">
      <header className="post-header">
        {post.category && (
          <span className="post-category">{post.category}</span>
        )}
        <h1 className="post-title">{post.title}</h1>
        {post.excerpt && (
          <p className="post-excerpt">{post.excerpt}</p>
        )}
        
        <div className="post-meta-container">
          <AuthorInfo author={post.author} publicationDate={post.createdAt} />
          {post.views !== undefined && (
            <div className="post-views" aria-label={`${post.views} views`} title={`${post.views} views`}>
              <Eye size={16} />
              <span>{post.views}</span>
            </div>
          )}
        </div>
      </header>

      <div className="post-cover-wrapper">
        {post.coverImage ? (
          <img src={post.coverImage} alt={post.title} className="post-cover-image" />
        ) : (
          <div className="post-cover-placeholder" aria-hidden="true">
            <ImageIcon size={64} className="placeholder-icon" />
          </div>
        )}
      </div>

      <div className="post-content">
        {post.content ? (
          post.content.split('\n').map((paragraph, index) => (
            paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />
          ))
        ) : (
          <p>No content available.</p>
        )}
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="post-tags">
          <span className="tags-label">Tags</span>
          <div className="tags-list">
            {post.tags.map(tag => (
              <Link key={tag} to={`/explore?tag=${encodeURIComponent(tag)}`} className="post-tag-chip">
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      <footer className="post-footer">
        <Link to="/explore" className="back-link" aria-label="Back to Explore">
          <ArrowLeft size={20} />
          Back to Explore
        </Link>
      </footer>
    </article>
  );
};

export default PostDetails;
