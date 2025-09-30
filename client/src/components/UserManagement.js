// client/src/components/UserManagement.js
import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';

const UserManagement = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await usersAPI.getOrganizationUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!inviteEmail.trim()) {
      setError('Email is required');
      return;
    }

    try {
      await usersAPI.inviteUser({
        email: inviteEmail,
        role: inviteRole
      });
      setMessage(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      loadUsers();
    } catch (err) {
      setError('Failed to send invitation: ' + err.message);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;

    try {
      await usersAPI.updateUserRole(userId, newRole);
      setMessage('Role updated successfully');
      loadUsers();
    } catch (err) {
      setError('Failed to update role: ' + err.message);
    }
  };

  const handleDeleteUser = async (user) => {
  if (!window.confirm(`Delete ${user.first_name} ${user.last_name}?`)) {
    return;
  }

  try {
    await usersAPI.deleteUser(user.id);
    setMessage(`User deleted successfully`);
    loadUsers();
  } catch (err) {
    setError('Failed to delete user: ' + err.message);
  }
};

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Organization Users</h2>

      {message && <div style={styles.successBox}>{message}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Invite Form - Admin Only */}
      {isAdmin && (
        <div style={styles.inviteSection}>
          <h3 style={styles.sectionTitle}>Invite New User</h3>
          <form onSubmit={handleInvite} style={styles.inviteForm}>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="user@example.com"
              style={styles.input}
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              style={styles.select}
            >
              <option value="user">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" style={styles.inviteButton}>
              Send Invitation
            </button>
          </form>
        </div>
      )}

      {/* Users List */}
      <div style={styles.usersList}>
        <h3 style={styles.sectionTitle}>Team Members ({users.length})</h3>
        {loading ? (
          <p>Loading users...</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                {isAdmin && <th style={styles.th}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={styles.tr}>
                  <td style={styles.td}>
                    {user.first_name} {user.last_name}
                    {user.id === currentUser?.id && ' (You)'}
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={user.role === 'admin' ? styles.adminBadge : styles.userBadge}>
                      {user.role}
                    </span>
                    
                  </td>
                  {isAdmin && (
                    <td style={styles.td}>
                      {user.id !== currentUser?.id && (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          style={styles.roleSelect}
                        >
                          <option value="user">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                      <button 
                      onClick={() => handleDeleteUser(user)}
                      style={styles.deleteButton}
                      >
                      Delete
                     </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', backgroundColor: 'white', borderRadius: '8px', marginBottom: '20px' },
  title: { fontSize: '24px', marginBottom: '20px', color: '#333' },
  sectionTitle: { fontSize: '18px', marginBottom: '15px', color: '#555' },
  inviteSection: { padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px' },
  inviteForm: { display: 'flex', gap: '10px', alignItems: 'center' },
  input: { flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' },
  select: { padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' },
  roleSelect: { padding: '5px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '13px' },
  inviteButton: { padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' },
  successBox: { padding: '12px', backgroundColor: '#d4edda', border: '1px solid #c3e6cb', borderRadius: '6px', color: '#155724', marginBottom: '15px' },
  errorBox: { padding: '12px', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', borderRadius: '6px', color: '#721c24', marginBottom: '15px' },
  usersList: { marginTop: '20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #dee2e6', color: '#495057', fontWeight: '600' },
  tr: { borderBottom: '1px solid #dee2e6' },
  td: { padding: '12px', color: '#212529' },
  adminBadge: { padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: '600' },
  userBadge: { padding: '4px 8px', backgroundColor: '#6c757d', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: '600' },
  deleteButton: { marginLeft: '10px', padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }
};

export default UserManagement;