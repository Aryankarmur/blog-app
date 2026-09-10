import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Sun, Moon, Menu, X, Edit3, User, LogOut, Bookmark, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/explore');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar-container">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">DevBlog</Link>
        
        {/* Desktop Nav */}
        <nav className="navbar-desktop-links">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Home</NavLink>
          <NavLink to="/explore" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Explore</NavLink>
          <NavLink to="/categories" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>Categories</NavLink>
        </nav>

        <div className="navbar-actions">
          <form className="navbar-search" onSubmit={handleSearch}>
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search..." aria-label="Search articles" />
          </form>

          <button onClick={toggleTheme} className="icon-button" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <div className="navbar-desktop-auth">
            {isAuthenticated ? (
              <>
                <Link to="/posts/create" className="nav-link write-link">
                  <Edit3 size={18} /> Write Article
                </Link>
                <Link to="/saved" className="nav-link write-link" aria-label="Saved Articles" title="Saved Articles">
                  <Bookmark size={18} /> Saved
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="nav-link write-link" style={{ color: 'var(--color-accent)' }}>
                    <Shield size={18} /> Admin
                  </Link>
                )}
                <Link to="/profile" className="profile-btn" aria-label="User Profile">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="profile-img" />
                  ) : (
                    <div className="profile-initial">{user?.name ? user.name[0].toUpperCase() : <User size={18}/>}</div>
                  )}
                </Link>
                <button type="button" onClick={handleLogout} className="nav-link logout-button">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="btn-primary">Register</Link>
              </>
            )}
          </div>

          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMenuOpen(true)} 
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setIsMenuOpen(false)}>
          <div className="mobile-menu" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <span className="navbar-brand">DevBlog</span>
              <button className="icon-button" onClick={() => setIsMenuOpen(false)} aria-label="Close menu">
                <X size={24} />
              </button>
            </div>
            
            <form className="mobile-search" onSubmit={handleSearch}>
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search..." aria-label="Search articles" />
            </form>

            <nav className="mobile-menu-links">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/explore">Explore</NavLink>
              <NavLink to="/categories">Categories</NavLink>
              <hr className="mobile-menu-divider" />
              {isAuthenticated ? (
                <>
                  <NavLink to="/posts/create">
                    <Edit3 size={18} /> Write Article
                  </NavLink>
                  <NavLink to="/saved">
                    <Bookmark size={18} /> Saved Articles
                  </NavLink>
                  {user?.role === 'admin' && (
                    <NavLink to="/admin" style={{ color: 'var(--color-accent)' }}>
                      <Shield size={18} /> Admin
                    </NavLink>
                  )}
                  <NavLink to="/profile">
                    <User size={18} /> Profile
                  </NavLink>
                  <button type="button" onClick={handleLogout}>
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login">Login</NavLink>
                  <NavLink to="/register" className="mobile-register">Register</NavLink>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
