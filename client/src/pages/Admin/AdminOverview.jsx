import { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Edit3, MessageSquare, Bookmark } from 'lucide-react';
import { getAdminStats } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getAdminStats();
        setStats(res.data.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!stats) return null;

  return (
    <div className="admin-overview">
      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>Total Users</h3>
            <div className="admin-stat-value">{stats.users}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FileText size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>Total Posts</h3>
            <div className="admin-stat-value">{stats.posts}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <CheckCircle size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>Published</h3>
            <div className="admin-stat-value">{stats.publishedPosts}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Edit3 size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>Drafts</h3>
            <div className="admin-stat-value">{stats.draftPosts}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <MessageSquare size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>Comments</h3>
            <div className="admin-stat-value">{stats.comments}</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Bookmark size={24} />
          </div>
          <div className="admin-stat-info">
            <h3>Bookmarks</h3>
            <div className="admin-stat-value">{stats.bookmarks}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
