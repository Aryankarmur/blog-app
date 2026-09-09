import { Link } from 'react-router-dom';
import { User as UserIcon, Trash2 } from 'lucide-react';
import './CommentItem.css';

const CommentItem = ({ comment, isOwner, onDelete }) => {
  const author = comment.author || {};
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="comment-item">
      {author._id ? (
        <Link to={`/users/${author._id}`} className="comment-avatar-wrapper">
          {author.profileImage ? (
            <img src={author.profileImage} alt={author.name} className="comment-avatar" />
          ) : (
            <div className="comment-avatar-fallback" aria-hidden="true">
              {author.name ? author.name[0].toUpperCase() : <UserIcon size={20} />}
            </div>
          )}
        </Link>
      ) : (
        <div className="comment-avatar-wrapper">
          {author.profileImage ? (
            <img src={author.profileImage} alt={author.name} className="comment-avatar" />
          ) : (
            <div className="comment-avatar-fallback" aria-hidden="true">
              {author.name ? author.name[0].toUpperCase() : <UserIcon size={20} />}
            </div>
          )}
        </div>
      )}
      
      <div className="comment-content-wrapper">
        <div className="comment-header">
          {author._id ? (
            <Link to={`/users/${author._id}`} className="comment-author-name">
              {author.name || 'Anonymous User'}
            </Link>
          ) : (
            <div className="comment-author-name">{author.name || 'Anonymous User'}</div>
          )}
          <div className="comment-date">{formatDate(comment.createdAt)}</div>
        </div>
        
        <p className="comment-text">{comment.content}</p>
        
        {isOwner && (
          <div className="comment-actions">
            <button 
              type="button" 
              className="btn-delete-comment" 
              onClick={() => onDelete(comment)}
              aria-label="Delete comment"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
