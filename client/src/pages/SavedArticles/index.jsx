import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBookmarks, removeBookmark } from '../../services/bookmarkService';
import BlogCard from '../../components/blog/BlogCard';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import './SavedArticles.css';

const SavedArticles = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBookmarks();
      setBookmarks(res.data.bookmarks || []);
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
      setError('Failed to load saved articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (postId, e) => {
    e.preventDefault(); // Prevent navigating to the post when clicking the remove button inside a card overlay
    e.stopPropagation();
    
    try {
      // Optimistic UI update
      setBookmarks(prev => prev.filter(b => b.post._id !== postId));
      await removeBookmark(postId);
    } catch (err) {
      console.error('Failed to remove bookmark:', err);
      // Revert if failed
      fetchBookmarks(); 
    }
  };

  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="explore-skeleton-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
          <div className="skeleton-line title"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="saved-articles-page container">
        <header className="saved-header">
          <h1 className="saved-title">Saved Articles</h1>
          <p className="saved-subtitle">Articles you have bookmarked for later.</p>
        </header>
        <div className="explore-grid">
          {renderSkeletons()}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="saved-articles-page container">
        <div className="saved-error">
          <ErrorMessage message={error} />
          <button className="btn-primary" onClick={fetchBookmarks}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-articles-page container">
      <header className="saved-header">
        <h1 className="saved-title">Saved Articles</h1>
        <p className="saved-subtitle">
          {bookmarks.length} {bookmarks.length === 1 ? 'article' : 'articles'} bookmarked for later.
        </p>
      </header>

      {bookmarks.length === 0 ? (
        <div className="saved-empty">
          <EmptyState 
            title="No saved articles yet" 
            message="Save articles you want to read later and they will appear here." 
          />
          <button 
            className="btn-outline explore-btn" 
            onClick={() => navigate('/explore')}
            style={{ marginTop: 'var(--space-md)' }}
          >
            Explore Articles
          </button>
        </div>
      ) : (
        <div className="explore-grid">
          {bookmarks.map((bookmark) => (
            <div key={bookmark._id} className="saved-card-wrapper">
              <BlogCard post={bookmark.post} />
              <button 
                className="remove-bookmark-overlay" 
                onClick={(e) => handleRemoveBookmark(bookmark.post._id, e)}
                aria-label="Remove article from saved articles"
                title="Remove bookmark"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedArticles;
