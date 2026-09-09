import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Eye } from 'lucide-react';
import { getPostById } from '../../services/postService';
import AuthorInfo from '../../components/blog/AuthorInfo';
import BookmarkButton from '../../components/blog/BookmarkButton';
import Comments from '../../components/blog/Comments';
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
      <div className="post-not-found container" style={{ textAlign: 'center', marginTop: 'var(--space-3xl)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', color: 'var(--color-text)', marginBottom: 'var(--space-md)' }}>Article Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)', fontSize: 'var(--font-lg)' }}>
          The article you're looking for could not be found.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
          <Link to="/explore" className="btn-outline">
            Explore Articles
          </Link>
        </div>
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

  // Calculate reading time based on 225 wpm average
  const getReadingTime = (content) => {
    if (!content) return 1; // Default to 1 min for empty/short articles
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 225);
    return minutes > 0 ? minutes : 1;
  };

  const readingTime = getReadingTime(post.content);

  return (
    <article className="post-details-container container">
      <header className="post-header">
        {post.category && (
          <Link to={`/explore?category=${encodeURIComponent(post.category)}`} className="post-category-link">
            {post.category}
          </Link>
        )}
        <h1 className="post-title">{post.title}</h1>
        {post.excerpt && (
          <p className="post-excerpt">{post.excerpt}</p>
        )}
        
        <div className="post-meta-container">
          <AuthorInfo author={post.author} publicationDate={post.createdAt} readingTime={readingTime} />
          
          <div className="post-actions-group" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            {post.views !== undefined && (
              <div className="post-views" aria-label={`${post.views} views`} title={`${post.views} views`}>
                <Eye size={16} />
                <span>{post.views}</span>
              </div>
            )}
            <BookmarkButton postId={post._id} />
          </div>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="post-tags-header">
            <div className="tags-list">
              {post.tags.map(tag => (
                <Link key={tag} to={`/explore?tag=${encodeURIComponent(tag)}`} className="post-tag-chip">
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
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

      <Comments postId={post._id} />

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
