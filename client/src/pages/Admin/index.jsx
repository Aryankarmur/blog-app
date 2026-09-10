import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminPosts from './AdminPosts';
import AdminComments from './AdminComments';
import './Admin.css';

const Admin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialSection = queryParams.get('section') || 'overview';

  const [activeSection, setActiveSection] = useState(initialSection);

  useEffect(() => {
    const currentSection = queryParams.get('section') || 'overview';
    if (currentSection !== activeSection) {
      setActiveSection(currentSection);
    }
  }, [location.search]);

  const handleTabChange = (section) => {
    setActiveSection(section);
    navigate(`/admin?section=${section}`);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return <AdminOverview />;
      case 'users': return <AdminUsers />;
      case 'posts': return <AdminPosts />;
      case 'comments': return <AdminComments />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="admin-dashboard container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p className="admin-subtitle">Manage users, content, and platform statistics.</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button 
          className={`admin-tab ${activeSection === 'users' ? 'active' : ''}`}
          onClick={() => handleTabChange('users')}
        >
          Users
        </button>
        <button 
          className={`admin-tab ${activeSection === 'posts' ? 'active' : ''}`}
          onClick={() => handleTabChange('posts')}
        >
          Posts
        </button>
        <button 
          className={`admin-tab ${activeSection === 'comments' ? 'active' : ''}`}
          onClick={() => handleTabChange('comments')}
        >
          Comments
        </button>
      </div>

      <div className="admin-content">
        {renderSection()}
      </div>
    </div>
  );
};

export default Admin;
