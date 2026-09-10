import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAdminPosts, deleteAdminPost } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmModal from '../../components/common/ConfirmModal';
import { ExternalLink } from 'lucide-react';

const AdminPosts = () => {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const queryParams = new URLSearchParams(location.search);
  const initialPage = parseInt(queryParams.get('page'), 10) || 1;
  const initialStatus = queryParams.get('status') || '';

  const [data, setData] = useState({ posts: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, targetPost: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPosts(page, statusFilter);
    // Update URL to reflect filters
    navigate(`/admin?section=posts&page=${page}${statusFilter ? `&status=${statusFilter}` : ''}`, { replace: true });
  }, [page, statusFilter]);

  const fetchPosts = async (p, s) => {
    try {
      setLoading(true);
      const res = await getAdminPosts(p, 20, s);
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = (post) => {
    setConfirmModal({
      isOpen: true,
      targetPost: post
    });
  };

  const handleDelete = async () => {
    const { targetPost } = confirmModal;
    if (!targetPost) return;

    try {
      setIsDeleting(true);
      await deleteAdminPost(targetPost._id);
      
      // Maintain pagination consistency
      if (data.posts.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        fetchPosts(page, statusFilter);
      }
      
      showToast('success', 'Post deleted successfully');
      setConfirmModal({ isOpen: false, targetPost: null });
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1); // Reset to page 1 on filter change
  };

  if (loading && data.posts.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && data.posts.length === 0) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="admin-section">
      <div className="admin-filters">
        <h2>Manage Posts</h2>
        <select 
          value={statusFilter} 
          onChange={handleStatusChange}
          className="admin-select"
          aria-label="Filter posts by status"
        >
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {data.posts.length === 0 ? (
        <div className="empty-state">
          <h3>No posts found.</h3>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Post</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.posts.map(post => (
                <tr key={post._id}>
                  <td data-label="Post">
                    <div className="admin-post-title">{post.title}</div>
                    <div className="admin-post-meta">
                      By {post.author?.name || 'Unknown'} • {post.category}
                    </div>
                  </td>
                  <td data-label="Status">
                    <span className={`admin-badge ${post.status}`}>
                      {post.status}
                    </span>
                  </td>
                  <td data-label="Created">
                    {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td data-label="Actions">
                    <div className="admin-actions">
                      <Link to={`/posts/${post._id}`} className="admin-btn-action" title="View Post">
                        <ExternalLink size={16} />
                      </Link>
                      <button 
                        className="admin-btn-action danger" 
                        onClick={() => openDeleteConfirm(post)}
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
        title="Delete Post"
        message={`Are you sure you want to permanently delete "${confirmModal.targetPost?.title}"? This will also erase all associated comments and bookmarks.`}
        confirmText="Delete Post"
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ isOpen: false, targetPost: null })}
      />
    </div>
  );
};

export default AdminPosts;
