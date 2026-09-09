import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getCommentsByPost, createComment, deleteComment } from '../../services/postService';
import CommentItem from './CommentItem';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import ConfirmModal from '../common/ConfirmModal';
import './Comments.css';

const Comments = ({ postId }) => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getCommentsByPost(postId);
        setComments(res.data || []);
      } catch (err) {
        setError('Unable to load comments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const trimmedContent = newComment.trim();
    if (!trimmedContent) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const res = await createComment(postId, trimmedContent);
      
      // Assume the backend returns the populated author (which Stage 10A does)
      const createdComment = res.data;
      
      // Update local state by placing new comment at the top (newest first)
      setComments([createdComment, ...comments]);
      setNewComment('');
      showToast('Comment added successfully.', 'success');
    } catch (err) {
      const msg = err.response?.status === 401 
        ? 'Your session has expired. Please log in again.' 
        : 'Unable to post your comment. Please try again.';
      setSubmitError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setDeleteError(null);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteComment(commentToDelete._id);
      
      // Remove from local state
      setComments(comments.filter(c => c._id !== commentToDelete._id));
      setIsModalOpen(false);
      setCommentToDelete(null);
      showToast('Comment deleted successfully.', 'success');
    } catch (err) {
      if (err.response?.status === 401) {
        setDeleteError('Your session has expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setDeleteError("You don't have permission to delete this comment.");
      } else if (err.response?.status === 404) {
        setDeleteError("Comment not found.");
      } else {
        setDeleteError('Unable to delete the comment. Please try again.');
      }
      showToast('Unable to delete comment.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section className="comments-section" id="comments">
      <div className="comments-header">
        <h2>Comments ({comments.length})</h2>
      </div>

      {isAuthenticated ? (
        <div className="comments-form-wrapper">
          <span className="comments-form-title">Join the discussion</span>
          {submitError && <ErrorMessage message={submitError} />}
          <form className="comments-form" onSubmit={handleCommentSubmit}>
            <textarea
              className="comments-textarea"
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={2000}
              disabled={isSubmitting}
              aria-label="Comment text"
              required
            />
            <div className="comments-form-footer">
              <span className={`comments-char-count ${newComment.length >= 2000 ? 'limit-reached' : ''}`}>
                {newComment.length} / 2000
              </span>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={isSubmitting || !newComment.trim()}
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="comments-login-prompt">
          <p>Want to join the discussion? Log in to leave a comment.</p>
          <Link to="/login" className="btn-outline">Log in</Link>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <div className="comments-loading">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {comments.length === 0 ? (
            <EmptyState 
              title="No comments yet" 
              message="Be the first to share your thoughts." 
            />
          ) : (
            <div className="comments-list">
              {comments.map((comment) => (
                <CommentItem 
                  key={comment._id} 
                  comment={comment} 
                  isOwner={user && comment.author && user._id === (comment.author._id || comment.author)}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete comment?"
        description={
          <>
            <p>Are you sure you want to delete this comment? This action cannot be undone.</p>
            {deleteError && (
              <div style={{ marginTop: '16px' }}>
                <ErrorMessage message={deleteError} />
              </div>
            )}
          </>
        }
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </section>
  );
};

export default Comments;
