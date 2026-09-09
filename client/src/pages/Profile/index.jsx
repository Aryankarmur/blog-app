import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Plus, Edit2, X, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getPosts, deletePost } from '../../services/postService';
import { updateUserProfile } from '../../services/userService';
import ConfirmModal from '../../components/common/ConfirmModal';
import MyArticleCard from '../../components/blog/MyArticleCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import './Profile.css';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', bio: '', profileImage: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  const currentStatus = searchParams.get('status') || 'all';

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        // The backend doesn't support author filtering natively and doesn't restrict drafts in getPosts.
        // The safest approach is to fetch the max limit (50) and filter securely on the frontend.
        // We filter aggressively by user._id to ensure we NEVER display someone else's drafts.
        const res = await getPosts({ limit: 50 });
        const allPosts = res.data?.posts || [];
        
        // Securely isolate the current user's posts
        const myPosts = allPosts.filter(p => {
          const authorId = p.author?._id || p.author;
          return authorId === user._id;
        });
        
        setPosts(myPosts);
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Your session has expired. Please log in again.');
        } else {
          setError('Unable to load your articles. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchMyPosts();
    }
  }, [user]);

  const handleTabChange = (status) => {
    const newParams = new URLSearchParams(searchParams);
    if (status === 'all') {
      newParams.delete('status');
    } else {
      newParams.set('status', status);
    }
    setSearchParams(newParams);
  };

  const filteredPosts = useMemo(() => {
    if (currentStatus === 'published') return posts.filter(p => p.status === 'published');
    if (currentStatus === 'draft') return posts.filter(p => p.status === 'draft');
    return posts;
  }, [posts, currentStatus]);

  const stats = useMemo(() => {
    return {
      total: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      drafts: posts.filter(p => p.status === 'draft').length
    };
  }, [posts]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setDeleteError(null);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deletePost(postToDelete._id);
      // Remove from local state
      setPosts(prev => prev.filter(p => p._id !== postToDelete._id));
      setIsModalOpen(false);
      setPostToDelete(null);
      showToast('Article deleted successfully.', 'success');
    } catch (err) {
      if (err.response?.status === 401) {
        setDeleteError('Your session has expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setDeleteError("You don't have permission to delete this article.");
      } else if (err.response?.status === 404) {
        setDeleteError("This article could not be found.");
      } else {
        setDeleteError('Unable to delete the article. Please try again.');
      }
      showToast('Unable to delete article.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditFormData({
        name: user.name || '',
        bio: user.bio || '',
        profileImage: user.profileImage || ''
      });
      setEditError(null);
    }
    setIsEditing(!isEditing);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      setEditError('Name is required');
      return;
    }

    setIsSaving(true);
    setEditError(null);

    try {
      await updateUserProfile(editFormData);
      await refreshUser();
      setIsEditing(false);
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile. Please try again.';
      setEditError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container container">
      <header className="profile-header">
        <div className="profile-avatar-wrapper">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="profile-avatar" />
          ) : (
            <div className="profile-avatar-fallback" aria-hidden="true">
              {user.name ? user.name[0].toUpperCase() : <UserIcon size={40} />}
            </div>
          )}
        </div>
        
        <div className="profile-info">
          {isEditing ? (
            <form className="profile-edit-form" onSubmit={handleEditSubmit}>
              {editError && <ErrorMessage message={editError} />}
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  placeholder="Your Name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  className="form-control profile-bio-input"
                  value={editFormData.bio}
                  onChange={handleEditChange}
                  placeholder="Tell us a little about yourself"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label htmlFor="profileImage">Avatar URL</label>
                <input
                  type="text"
                  id="profileImage"
                  name="profileImage"
                  className="form-control"
                  value={editFormData.profileImage}
                  onChange={handleEditChange}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="profile-edit-actions">
                <button type="button" className="btn-outline" onClick={handleEditToggle} disabled={isSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-name-row">
                <h1 className="profile-name">{user.name}</h1>
                <button className="btn-icon profile-edit-btn" onClick={handleEditToggle} aria-label="Edit Profile" title="Edit Profile">
                  <Edit2 size={16} />
                </button>
              </div>
              {user.bio && <p className="profile-bio">{user.bio}</p>}
              <p className="profile-email">{user.email}</p>
              <p className="profile-joined">Member since {formatDate(user.createdAt)}</p>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="profile-stats">
            <div className="stat-card">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Articles</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.published}</span>
              <span className="stat-label">Published</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{stats.drafts}</span>
              <span className="stat-label">Drafts</span>
            </div>
          </div>
        )}
      </header>

      <section className="my-articles-section">
        <div className="my-articles-header">
          <h2>My Articles</h2>
          <Link to="/posts/create" className="btn-primary create-article-btn">
            <Plus size={18} />
            Create Article
          </Link>
        </div>

        <div className="profile-tabs" role="tablist">
          <button 
            className={`profile-tab ${currentStatus === 'all' ? 'active' : ''}`}
            onClick={() => handleTabChange('all')}
            aria-pressed={currentStatus === 'all'}
            role="tab"
          >
            All
          </button>
          <button 
            className={`profile-tab ${currentStatus === 'published' ? 'active' : ''}`}
            onClick={() => handleTabChange('published')}
            aria-pressed={currentStatus === 'published'}
            role="tab"
          >
            Published
          </button>
          <button 
            className={`profile-tab ${currentStatus === 'draft' ? 'active' : ''}`}
            onClick={() => handleTabChange('draft')}
            aria-pressed={currentStatus === 'draft'}
            role="tab"
          >
            Drafts
          </button>
        </div>

        {error && <ErrorMessage message={error} />}

        {loading ? (
          <div className="profile-loading">
            <LoadingSpinner />
          </div>
        ) : !error && filteredPosts.length === 0 ? (
          <div className="profile-empty">
            <EmptyState 
              title={currentStatus === 'all' ? "You haven't written any articles yet." : `No ${currentStatus} articles found.`}
              message="Start sharing your ideas with the developer community."
            />
            {currentStatus === 'all' && (
              <button className="btn-primary" onClick={() => navigate('/posts/create')} style={{ marginTop: 'var(--space-md)' }}>
                Create Your First Article
              </button>
            )}
          </div>
        ) : (
          <div className="my-articles-list">
            {filteredPosts.map(post => (
              <MyArticleCard key={post._id} post={post} onDelete={handleDeleteClick} />
            ))}
          </div>
        )}
      </section>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete article?"
        description={
          <>
            <p>Are you sure you want to delete this article? This action cannot be undone.</p>
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
    </div>
  );
};

export default Profile;
