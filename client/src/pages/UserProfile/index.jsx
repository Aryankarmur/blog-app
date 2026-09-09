import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User as UserIcon, Calendar, FileText } from 'lucide-react';
import { getPublicUserProfile } from '../../services/userService';
import BlogCard from '../../components/blog/BlogCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import './UserProfile.css';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsNotFound(false);
        
        const res = await getPublicUserProfile(id);
        setProfileData(res.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setIsNotFound(true);
        } else if (err.response && err.response.status === 400) {
          setError('Invalid user profile link.');
        } else {
          setError('Unable to load user profile. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="user-profile-loading container">
        <LoadingSpinner />
      </div>
    );
  }

  if (isNotFound) {
    return (
      <div className="user-profile-error container" style={{ textAlign: 'center', marginTop: 'var(--space-3xl)' }}>
        <h1 style={{ fontSize: 'var(--font-2xl)', color: 'var(--color-text)', marginBottom: 'var(--space-md)' }}>User Not Found</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-xl)', fontSize: 'var(--font-lg)' }}>
          The profile you're looking for could not be found.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Go Home
          </button>
          <button className="btn-outline" onClick={() => navigate('/explore')}>
            Explore Articles
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-error container">
        <ErrorMessage message={error} />
        <button className="btn-outline" style={{ marginTop: '1rem' }} onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (!profileData) return null;

  const { user, posts } = profileData;

  return (
    <div className="user-profile-container container">
      <header className="user-profile-header">
        <div className="user-avatar-wrapper">
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} className="user-avatar" />
          ) : (
            <div className="user-avatar-fallback" aria-hidden="true">
              {user.name ? user.name[0].toUpperCase() : <UserIcon size={64} />}
            </div>
          )}
        </div>
        
        <h1 className="user-name">{user.name}</h1>
        
        {user.bio && (
          <p className="user-bio">{user.bio}</p>
        )}
        
        <div className="user-meta">
          <div className="user-meta-item">
            <Calendar size={16} />
            <span>Member since {formatDate(user.createdAt)}</span>
          </div>
          <div className="user-meta-divider" aria-hidden="true"></div>
          <div className="user-meta-item">
            <FileText size={16} />
            <span>{posts.length} {posts.length === 1 ? 'Article' : 'Articles'}</span>
          </div>
        </div>
      </header>

      <section className="user-articles-section">
        <div className="user-articles-header">
          <h2>Articles by {user.name}</h2>
        </div>

        {posts.length === 0 ? (
          <EmptyState 
            title="No published articles yet" 
            message="This author hasn't published any articles." 
          />
        ) : (
          <div className="user-articles-grid">
            {posts.map(post => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default UserProfile;
