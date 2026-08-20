import { Link } from 'react-router-dom';
import { User, Image as ImageIcon } from 'lucide-react';
import './FeaturedPost.css';

const FeaturedPost = ({ post }) => {
  const { _id, title, excerpt, coverImage, category, author, createdAt } = post;
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <article className="featured-post">
      <Link to={`/posts/${_id}`} className="featured-image-link">
        {coverImage ? (
          <img src={coverImage} alt={title} className="featured-image" />
        ) : (
          <div className="featured-image-placeholder">
            <ImageIcon size={64} className="placeholder-icon" />
          </div>
        )}
      </Link>
      <div className="featured-content">
        <div className="featured-meta">
          {category && <span className="featured-category">{category}</span>}
          <span className="featured-date">{formatDate(createdAt)}</span>
        </div>
        <Link to={`/posts/${_id}`} className="featured-title-link">
          <h2 className="featured-title">{title}</h2>
        </Link>
        <p className="featured-excerpt">{excerpt}</p>
        
        <div className="featured-author">
          {author?.profileImage ? (
            <img src={author.profileImage} alt={author.name} className="featured-avatar" />
          ) : (
            <div className="featured-avatar-fallback">
              {author?.name ? author.name[0].toUpperCase() : <User size={18} />}
            </div>
          )}
          <span className="featured-author-name">{author?.name || 'Unknown'}</span>
        </div>
      </div>
    </article>
  );
};

export default FeaturedPost;
