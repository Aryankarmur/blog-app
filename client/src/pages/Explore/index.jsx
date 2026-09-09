import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { getPosts, getTags } from '../../services/postService';
import BlogCard from '../../components/blog/BlogCard';
import Pagination from '../../components/common/Pagination';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import './Explore.css';

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableCategories, setAvailableCategories] = useState(new Set());
  const [availableTags, setAvailableTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState(null);
  
  // Local state for the search input to allow debouncing
  const initialSearch = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const searchTimeoutRef = useRef(null);

  const currentCategory = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentTag = searchParams.get('tag') || '';

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 9, // using 9 for a clean 3x3 grid
      };
      
      const q = searchParams.get('q');
      if (q) params.search = q;
      if (currentCategory) params.category = currentCategory;
      if (currentTag) params.tag = currentTag;

      const res = await getPosts(params);
      
      // Ensure we only use published posts in case backend returns drafts
      const fetchedPosts = res.data?.posts?.filter(p => p.status !== 'draft') || [];
      setPosts(fetchedPosts);
      setPagination(res.data?.pagination);
      
      // Accumulate categories to keep the filter list stable across pagination/searches
      setAvailableCategories(prev => {
        const next = new Set(prev);
        fetchedPosts.forEach(p => {
          if (p.category) next.add(p.category);
        });
        return next;
      });
      
    } catch (err) {
      setError('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchParams, currentPage, currentCategory, currentTag]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setTagsLoading(true);
        const res = await getTags();
        setAvailableTags(res.data?.tags || []);
      } catch (err) {
        setTagsError('Failed to load tags.');
      } finally {
        setTagsLoading(false);
      }
    };
    fetchTags();
  }, []);

  // Handle search debounce
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    
    searchTimeoutRef.current = setTimeout(() => {
      const qParam = searchParams.get('q') || '';
      if (searchInput !== qParam) {
        const newParams = new URLSearchParams(searchParams);
        if (searchInput.trim()) {
          newParams.set('q', searchInput.trim());
        } else {
          newParams.delete('q');
        }
        newParams.delete('page'); // reset to page 1 on new search
        setSearchParams(newParams);
      }
    }, 500);

    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchInput, searchParams, setSearchParams]);

  const handleCategorySelect = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat) {
      newParams.set('category', cat);
    } else {
      newParams.delete('category');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleTagSelect = (tag) => {
    const newParams = new URLSearchParams(searchParams);
    if (tag) {
      newParams.set('tag', tag);
    } else {
      newParams.delete('tag');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="explore-skeleton-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
          <div className="skeleton-line title"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      </div>
    ));
  };

  return (
    <div className="explore-page">
      <div className="container">
        <header className="explore-header">
          <h1 className="explore-title">Explore Articles</h1>
          <p className="explore-subtitle">Discover tutorials, ideas, and experiences from developers.</p>
        </header>

        <div className="explore-controls">
          <div className="explore-search-wrapper">
            <Search className="explore-search-icon" size={20} />
            <input 
              type="text" 
              className="explore-search-input"
              placeholder="Search articles..." 
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleClearSearch();
              }}
              aria-label="Search articles"
            />
            {searchInput && (
              <button 
                className="explore-search-clear" 
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {availableCategories.size > 0 && (
            <div className="explore-categories">
              <button 
                className={`explore-category-chip ${!currentCategory ? 'active' : ''}`}
                onClick={() => handleCategorySelect('')}
              >
                All
              </button>
              {Array.from(availableCategories).map(cat => (
                <button 
                  key={cat}
                  className={`explore-category-chip ${currentCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {!tagsLoading && !tagsError && availableTags.length > 0 && (
            <div className="explore-tags">
              <span className="explore-tags-label">Tags:</span>
              <div className="explore-tags-list">
                <button 
                  className={`explore-tag-chip ${!currentTag ? 'active' : ''}`}
                  onClick={() => handleTagSelect('')}
                >
                  All
                </button>
                {availableTags.map(tag => (
                  <button 
                    key={tag}
                    className={`explore-tag-chip ${currentTag === tag ? 'active' : ''}`}
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters Row */}
          {(searchParams.get('q') || currentCategory || currentTag) && (
            <div className="explore-active-filters">
              <span className="active-filters-label">Active Filters:</span>
              <div className="active-filters-list">
                {searchParams.get('q') && (
                  <button className="active-filter-chip" onClick={handleClearSearch}>
                    Search: <strong>{searchParams.get('q')}</strong> <X size={14} />
                  </button>
                )}
                {currentCategory && (
                  <button className="active-filter-chip" onClick={() => handleCategorySelect('')}>
                    Category: <strong>{currentCategory}</strong> <X size={14} />
                  </button>
                )}
                {currentTag && (
                  <button className="active-filter-chip" onClick={() => handleTagSelect('')}>
                    Tag: <strong>{currentTag}</strong> <X size={14} />
                  </button>
                )}
              </div>
              <button className="btn-clear-all" onClick={clearFilters}>
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="explore-error">
            <ErrorMessage message={error} />
            <button className="btn-primary" onClick={fetchPosts}>Try Again</button>
          </div>
        )}

        {loading ? (
          <div className="explore-grid">
            {renderSkeletons()}
          </div>
        ) : !error && posts.length === 0 ? (
          <div className="explore-empty">
            <EmptyState 
              title={searchParams.get('q') ? `No articles found for "${searchParams.get('q')}"` : "No articles found"}
              message="Try a different search term or category." 
            />
            {(searchParams.get('q') || searchParams.get('category') || searchParams.get('tag')) && (
              <button className="btn-outline" onClick={clearFilters} style={{ marginTop: 'var(--space-md)' }}>
                Clear Filters
              </button>
            )}
          </div>
        ) : !error && (
          <>
            <div className="explore-meta">
              {pagination?.totalPosts !== undefined && (
                <div className="explore-result-header">
                  {searchParams.get('q') && (
                    <h2 className="explore-search-feedback">Search results for "{searchParams.get('q')}"</h2>
                  )}
                  <span className="explore-result-count">
                    {pagination.totalPosts} article{pagination.totalPosts !== 1 ? 's' : ''} found
                  </span>
                </div>
              )}
            </div>
            
            <div className="explore-grid">
              {posts.map(post => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <Pagination 
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;
