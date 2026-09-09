import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container container">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-text">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn-primary">
            Go Home
          </Link>
          <Link to="/explore" className="btn-outline">
            Explore Articles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
