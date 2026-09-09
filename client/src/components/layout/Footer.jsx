import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Footer.css';

const Footer = () => {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="footer-container">
      <div className="container footer-content">
        <div className="footer-section footer-brand-section">
          <Link to="/" className="footer-brand">DevBlog</Link>
          <p className="footer-desc">A premium platform for developers to share insights, tutorials, and stories.</p>
        </div>
        
        <div className="footer-section">
          <h3 className="footer-heading">Explore</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/explore">Explore Articles</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            {isAuthenticated && (
              <li><Link to="/saved">Saved Articles</Link></li>
            )}
          </ul>
        </div>
        
        <div className="footer-section">
          <h3 className="footer-heading">Account</h3>
          <ul className="footer-links">
            {isAuthenticated ? (
              <>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/posts/create">Create Article</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>&copy; {new Date().getFullYear()} DevBlog.</p>
          <p>Built for developers.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
