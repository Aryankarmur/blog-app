import { Link } from 'react-router-dom';
import { User, Image as ImageIcon } from 'lucide-react';
import './BlogCard.css';

const BlogCard = ({ post }) => {
  const { _id, title, excerpt, coverImage, category, author, createdAt } = post;
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <article className="blog-card">
      <Link to={`/posts/${_id}`} className="blog-card-image-link">
        {coverImage ? (
          <img src={coverImage} alt={title} className="blog-card-image" />
        ) : (
          <div className="blog-card-image-placeholder">
            <ImageIcon size={48} className="placeholder-icon" />
          </div>
        )}
      </Link>
      <div className="blog-card-content">
        {category && <span className="blog-card-category">{category}</span>}
        <Link to={`/posts/${_id}`} className="blog-card-title-link">
          <h3 className="blog-card-title">{title}</h3>
        </Link>
        <p className="blog-card-excerpt">{excerpt}</p>
        <div className="blog-card-footer">
          {author?._id ? (
            <Link to={`/users/${author._id}`} className="blog-card-author">
              {author?.profileImage ? (
                <img src={author.profileImage} alt={author.name} className="author-avatar" />
              ) : (
                <div className="author-avatar-fallback">
                  {author?.name ? author.name[0].toUpperCase() : <User size={14} />}
                </div>
              )}
              <span className="author-name">{author?.name || 'Unknown'}</span>
            </Link>
          ) : (
            <div className="blog-card-author">
              {author?.profileImage ? (
                <img src={author.profileImage} alt={author.name} className="author-avatar" />
              ) : (
                <div className="author-avatar-fallback">
                  {author?.name ? author.name[0].toUpperCase() : <User size={14} />}
                </div>
              )}
              <span className="author-name">{author?.name || 'Unknown'}</span>
            </div>
          )}
          <span className="blog-card-date">{formatDate(createdAt)}</span>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
