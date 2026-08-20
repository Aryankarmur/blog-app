import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../../services/postService';
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
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPosts({ limit: 10 }); // Fetch recent posts
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
        <EmptyState title="No articles published yet" message="Check back later for exciting developer insights." />
      </div>
    );
  }

  const featuredPost = posts[0];
  const latestPosts = posts.slice(1);

  // Extract unique categories from fetched posts
  const uniqueCategories = [...new Set(posts.map(p => p.category).filter(Boolean))];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="container">
          <span className="home-hero-eyebrow">DEV BLOG</span>
          <h1 className="home-hero-title">Write. Build. Share.</h1>
          <p className="home-hero-subtitle">Ideas, tutorials and experiences from developers.</p>
          <Button onClick={handleExploreClick} size="lg">Explore Articles</Button>
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
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;
