import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { checkBookmark, addBookmark, removeBookmark } from '../../services/bookmarkService';
import './BookmarkButton.css';

const BookmarkButton = ({ postId, onBookmarkChange }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchStatus = async () => {
      if (!isAuthenticated) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const res = await checkBookmark(postId);
        if (isMounted) setIsBookmarked(res.data.bookmarked);
      } catch (error) {
        console.error('Failed to check bookmark status:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchStatus();

    return () => {
      isMounted = false;
    };
  }, [postId, isAuthenticated]);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const previousState = isBookmarked;
    setIsBookmarked(!previousState); // Optimistic UI update

    try {
      if (previousState) {
        await removeBookmark(postId);
        if (onBookmarkChange) onBookmarkChange(false);
        showToast('Article removed from saved articles.', 'success');
      } else {
        await addBookmark(postId);
        if (onBookmarkChange) onBookmarkChange(true);
        showToast('Article saved.', 'success');
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
      setIsBookmarked(previousState); // Revert on failure
      showToast('Unable to update bookmark.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !isBookmarked) {
    // Show a disabled or subtle state while initially loading
    return (
      <button 
        className="bookmark-btn loading" 
        disabled 
        aria-label="Loading bookmark status"
        title="Loading..."
      >
        <Bookmark size={20} />
      </button>
    );
  }

  return (
    <button
      className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
      onClick={handleToggle}
      disabled={isLoading}
      aria-label={isBookmarked ? 'Remove article from saved articles' : 'Save article'}
      title={isBookmarked ? 'Saved' : 'Save article'}
    >
      <Bookmark 
        size={20} 
        fill={isBookmarked ? 'currentColor' : 'none'} 
      />
    </button>
  );
};

export default BookmarkButton;
