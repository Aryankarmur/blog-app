import { Link } from 'react-router-dom';
import { Eye, Edit, FileText } from 'lucide-react';
import './MyArticleCard.css';

const MyArticleCard = ({ post }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isPublished = post.status === 'published';

  return (
    <div className="my-article-card">
      <div className="my-article-content">
        <div className="my-article-meta-top">
          {post.category && <span className="my-article-category">{post.category}</span>}
          <span className={`my-article-status ${isPublished ? 'status-published' : 'status-draft'}`}>
            {isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
        
        <h3 className="my-article-title">
          <Link to={`/posts/${post._id}`}>{post.title}</Link>
        </h3>
        
        <div className="my-article-meta-bottom">
          <span className="my-article-date">Updated: {formatDate(post.updatedAt || post.createdAt)}</span>
          {post.views !== undefined && isPublished && (
            <span className="my-article-views" aria-label={`${post.views} views`} title={`${post.views} views`}>
              <Eye size={14} /> {post.views}
            </span>
          )}
        </div>
      </div>

      <div className="my-article-actions">
        <Link to={`/posts/${post._id}`} className="btn-icon" aria-label={`View article: ${post.title}`}>
          <FileText size={18} />
          <span className="action-label">View</span>
        </Link>
        <Link to={`/posts/${post._id}/edit`} className="btn-icon" aria-label={`Edit article: ${post.title}`}>
          <Edit size={18} />
          <span className="action-label">Edit</span>
        </Link>
      </div>
    </div>
  );
};

export default MyArticleCard;
