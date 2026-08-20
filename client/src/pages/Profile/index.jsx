import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPosts } from '../../services/postService';
import MyArticleCard from '../../components/blog/MyArticleCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import './Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      drafts: posts.filter(p => p.status === 'draft').length,
      views: posts.reduce((sum, p) => sum + (p.views || 0), 0)
    };
  }, [posts]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
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
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.email}</p>
          <p className="profile-joined">Member since {formatDate(user.createdAt)}</p>
        </div>

        <div className="profile-stats">
          <div className="stat-card">
            <span className="stat-value">{stats.published}</span>
            <span className="stat-label">Published</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.drafts}</span>
            <span className="stat-label">Drafts</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Articles</span>
          </div>
        </div>
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
              <MyArticleCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Profile;
