import { User } from 'lucide-react';
import './AuthorInfo.css';

const AuthorInfo = ({ author, publicationDate }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="author-info">
      {author?.profileImage ? (
        <img src={author.profileImage} alt={author.name} className="author-info-avatar" />
      ) : (
        <div className="author-info-fallback" aria-hidden="true">
          {author?.name ? author.name[0].toUpperCase() : <User size={20} />}
        </div>
      )}
      <div className="author-info-text">
        <span className="author-info-name">{author?.name || 'Unknown Author'}</span>
        {publicationDate && (
          <span className="author-info-date">{formatDate(publicationDate)}</span>
        )}
      </div>
    </div>
  );
};

export default AuthorInfo;
