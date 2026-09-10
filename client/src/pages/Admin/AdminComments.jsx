import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAdminComments, deleteAdminComment } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmModal from '../../components/common/ConfirmModal';
import { ExternalLink } from 'lucide-react';

const AdminComments = () => {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page'), 10) || 1;

  const [data, setData] = useState({ comments: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, targetComment: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchComments(page);
    navigate(`/admin?section=comments&page=${page}`, { replace: true });
  }, [page]);

  const fetchComments = async (p) => {
    try {
      setLoading(true);
      const res = await getAdminComments(p, 20);
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load comments.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (comment) => {
    setConfirmModal({
      isOpen: true,
      targetComment: comment
    });
  };

  const handleDelete = async () => {
    const { targetComment } = confirmModal;
    if (!targetComment) return;

    try {
      setIsDeleting(true);
      await deleteAdminComment(targetComment._id);
      
      // Maintain pagination consistency
      if (data.comments.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        fetchComments(page);
      }
      
      showToast('success', 'Comment deleted successfully');
      setConfirmModal({ isOpen: false, targetComment: null });
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete comment');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && data.comments.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && data.comments.length === 0) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="admin-section">
      <div className="admin-filters">
        <h2>Manage Comments</h2>
      </div>

      {data.comments.length === 0 ? (
        <div className="empty-state">
          <h3>No comments found.</h3>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Comment</th>
                <th>Author</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.comments.map(comment => (
                <tr key={comment._id}>
                  <td data-label="Comment">
                    <div className="admin-comment-content">
                      {comment.content}
                    </div>
                    {comment.post && (
                      <div className="admin-post-meta" style={{ marginTop: '4px' }}>
                        On: {comment.post.title}
                      </div>
                    )}
                  </td>
                  <td data-label="Author">
                    {comment.author?.name || 'Unknown'}
                  </td>
                  <td data-label="Created">
                    {new Date(comment.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td data-label="Actions">
                    <div className="admin-actions">
                      {comment.post && (
                        <Link to={`/posts/${comment.post._id}`} className="admin-btn-action" title="View Post">
                          <ExternalLink size={16} />
                        </Link>
                      )}
                      <button 
                        className="admin-btn-action danger" 
                        onClick={() => openDeleteConfirm(comment)}
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.pagination && data.pagination.pages > 1 && (
        <div className="admin-pagination">
          <span className="admin-page-info">
            Page {data.pagination.page} of {data.pagination.pages}
          </span>
          <div className="admin-page-controls">
            <button 
              className="btn-outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button 
              className="btn-outline" 
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ isOpen: false, targetComment: null })}
      />
    </div>
  );
};

export default AdminComments;
