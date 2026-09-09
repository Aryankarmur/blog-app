import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Folder, ChevronRight } from 'lucide-react';
import { getPosts } from '../../services/postService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch posts (the backend defaults to published if no status is given, but we check explicitly just in case)
        const res = await getPosts({ limit: 100 });
        const posts = res.data?.posts || [];

        // Derive categories
        const categoryCounts = {};

        posts.forEach(post => {
          if (post.status === 'published' && post.category) {
            const categoryName = post.category.trim();
            if (categoryName) {
              categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
            }
          }
        });

        const derivedCategories = Object.keys(categoryCounts).map(name => ({
          name,
          count: categoryCounts[name]
        }));

        // Sort by count descending, then alphabetically
        derivedCategories.sort((a, b) => {
          if (b.count !== a.count) {
            return b.count - a.count;
          }
          return a.name.localeCompare(b.name);
        });

        setCategories(derivedCategories);
      } catch (err) {
        setError('Unable to load categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="categories-page container">
        <div className="categories-header">
          <h1>Categories</h1>
          <p>Explore articles by topic</p>
        </div>
        <div className="categories-loading">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-page container">
        <div className="categories-header">
          <h1>Categories</h1>
          <p>Explore articles by topic</p>
        </div>
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="categories-page container">
      <div className="categories-header">
        <h1>Categories</h1>
        <p>Explore articles by topic</p>
      </div>

      {categories.length === 0 ? (
        <EmptyState 
          title="No categories available yet" 
          message="Categories will appear when published articles are added." 
        />
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <Link 
              key={category.name} 
              to={`/explore?category=${encodeURIComponent(category.name)}`} 
              className="category-card"
            >
              <div className="category-card-content">
                <div className="category-icon-wrapper">
                  <Folder size={24} />
                </div>
                <div className="category-info">
                  <h2>{category.name}</h2>
                  <p>{category.count} {category.count === 1 ? 'article' : 'articles'}</p>
                </div>
              </div>
              <ChevronRight size={20} className="category-arrow" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
