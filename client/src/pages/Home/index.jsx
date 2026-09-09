import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPosts } from '../../services/postService';
import { useAuth } from '../../context/AuthContext';
import BlogCard from '../../components/blog/BlogCard';
import FeaturedPost from '../../components/blog/FeaturedPost';
import CategoryList from '../../components/blog/CategoryList';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import './Home.css';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPosts({ limit: 7 }); // Fetch 1 featured + 6 recent posts
      // Ensure we only use published posts in case backend returns drafts
      const publishedPosts = res.data?.posts?.filter(p => p.status !== 'draft') || [];
      setPosts(publishedPosts);
    } catch (err) {
      setError('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleExploreClick = () => {
    navigate('/explore');
  };

  const handleWriteClick = () => {
    if (isAuthenticated) {
      navigate('/posts/create');
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: 'var(--space-2xl)' }}>
        <ErrorMessage message={error} />
        <Button onClick={fetchPosts} variant="outline">Try Again</Button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="container" style={{ marginTop: 'var(--space-2xl)' }}>
        <EmptyState 
          title="No articles published yet" 
          message="Be one of the first developers to share something with the community." 
        />
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--space-md)' }}>
          <Button onClick={handleWriteClick}>Start Writing</Button>
        </div>
      </div>
    );
  }

  const featuredPost = posts[0];
  const latestPosts = posts.slice(1);

  // Extract unique categories and tags from fetched posts
  const uniqueCategories = [...new Set(posts.map(p => p.category).filter(Boolean))];
  const uniqueTags = [...new Set(posts.flatMap(p => p.tags || []).filter(Boolean))];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="container">
          <span className="home-hero-eyebrow">DEV BLOG</span>
          <h1 className="home-hero-title">Write. Build. Share.</h1>
          <p className="home-hero-subtitle">Explore ideas, tutorials, and experiences from developers and tech enthusiasts.</p>
          <div className="home-hero-actions">
            <Button onClick={handleExploreClick} size="lg">Explore Articles</Button>
            <Button onClick={handleWriteClick} variant="outline" size="lg">
              {isAuthenticated ? 'Write an Article' : 'Start Writing'}
            </Button>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Featured Post */}
        <section className="home-section">
          <div className="home-section-header">
            <h2 className="home-section-title">Featured</h2>
          </div>
          <FeaturedPost post={featuredPost} />
        </section>

        {/* Categories (only show if we have any) */}
        {uniqueCategories.length > 0 && (
          <section className="home-section">
            <CategoryList categories={uniqueCategories} />
          </section>
        )}

        {/* Latest Articles */}
        {latestPosts.length > 0 && (
          <section className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title">Latest Articles</h2>
            </div>
            <div className="home-posts-grid">
              {latestPosts.map(post => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
            <div className="home-view-all">
              <Button onClick={handleExploreClick} variant="outline">View All Articles</Button>
            </div>
          </section>
        )}

        {/* Tags */}
        {uniqueTags.length > 0 && (
          <section className="home-section">
            <div className="home-section-header">
              <h3 className="home-tags-title">Explore Topics</h3>
            </div>
            <div className="home-tags-list">
              {uniqueTags.map(tag => (
                <Link key={tag} to={`/explore?tag=${encodeURIComponent(tag)}`} className="home-tag-chip">
                  #{tag}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="home-cta-section">
          <h2 className="home-cta-title">Share your knowledge</h2>
          <p className="home-cta-subtitle">
            {isAuthenticated 
              ? 'Share your next article with the developer community.'
              : 'Create an account and start writing.'
            }
          </p>
          <Button onClick={handleWriteClick} size="lg">
            {isAuthenticated ? 'Start Writing' : 'Create an Account'}
          </Button>
        </section>
      </div>
    </div>
  );
};

export default Home;
