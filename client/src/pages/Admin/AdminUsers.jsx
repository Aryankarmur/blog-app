import { useState, useEffect } from 'react';
import { getAdminUsers, updateUserRole } from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmModal from '../../components/common/ConfirmModal';
import { User, Shield } from 'lucide-react';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [data, setData] = useState({ users: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, targetUser: null, newRole: null });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const fetchUsers = async (p) => {
    try {
      setLoading(true);
      const res = await getAdminUsers(p, 20);
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const openRoleConfirm = (user, newRole) => {
    setConfirmModal({
      isOpen: true,
      targetUser: user,
      newRole
    });
  };

  const handleRoleUpdate = async () => {
    const { targetUser, newRole } = confirmModal;
    if (!targetUser) return;

    try {
      setIsUpdating(true);
      await updateUserRole(targetUser._id, newRole);
      
      // Update local state instead of refetching
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => u._id === targetUser._id ? { ...u, role: newRole } : u)
      }));
      
      showToast('success', `${targetUser.name}'s role updated to ${newRole}`);
      setConfirmModal({ isOpen: false, targetUser: null, newRole: null });
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && data.users.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && data.users.length === 0) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="admin-section">
      <div className="admin-filters">
        <h2>Manage Users</h2>
      </div>

      {data.users.length === 0 ? (
        <div className="empty-state">
          <h3>No users found.</h3>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Member Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.users.map(u => (
                <tr key={u._id}>
                  <td data-label="User">
                    <div className="admin-user-cell">
                      {u.profileImage ? (
                        <img src={u.profileImage} alt={u.name} className="admin-user-avatar" />
                      ) : (
                        <div className="admin-user-initial">{u.name.charAt(0).toUpperCase()}</div>
                      )}
                      <div className="admin-user-details">
                        <strong>{u.name}</strong>
                        <span className="admin-user-email">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td data-label="Role">
                    <span className={`admin-badge ${u.role}`}>
                      {u.role === 'admin' ? <Shield size={12} style={{marginRight: 4, display:'inline'}}/> : <User size={12} style={{marginRight: 4, display:'inline'}}/>}
                      {u.role}
                    </span>
                  </td>
                  <td data-label="Member Since">
                    {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td data-label="Actions">
                    {u._id !== currentUser._id ? (
                      <div className="admin-actions">
                        {u.role === 'user' ? (
                          <button 
                            className="admin-btn-action" 
                            onClick={() => openRoleConfirm(u, 'admin')}
                            disabled={isUpdating}
                          >
                            Make Admin
                          </button>
                        ) : (
                          <button 
                            className="admin-btn-action" 
                            onClick={() => openRoleConfirm(u, 'user')}
                            disabled={isUpdating}
                          >
                            Demote to User
                          </button>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Current User</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data.pagination && data.pagination.pages > 1 && (
        <div className="admin-pagination">
          <span className="admin-page-info">
            Page {data.pagination.page} of {data.pagination.pages}
          </span>
          <div className="admin-page-controls">
            <button 
              className="btn-outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <button 
              className="btn-outline" 
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Change User Role"
        message={`Are you sure you want to change ${confirmModal.targetUser?.name}'s role to ${confirmModal.newRole}?`}
        confirmText="Change Role"
        onConfirm={handleRoleUpdate}
        onCancel={() => setConfirmModal({ isOpen: false, targetUser: null, newRole: null })}
      />
    </div>
  );
};

export default AdminUsers;
