import { useState, useEffect } from 'preact/hooks';
import { Users, Edit, Trash2 } from 'lucide-preact';
import { useAuth } from '../context/AuthContext';
import { toList } from '../lib/list';

export function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/v1/auth/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.status === 401) {
          logout();
          return;
        }
        
        if (!res.ok) {
          throw new Error('Failed to fetch users');
        }
        
        const data = await res.json();
        setUsers(toList(data));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [token, logout]);

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>User Management</h1>
          <p>Manage all registered users</p>
        </div>
      </div>
      
      {error && (
        <div style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--apple-text-secondary)' }}>
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--apple-text-secondary)' }}>
            No users found in the system.
          </div>
        ) : (
          <div className="table-container" style={{ boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--apple-text-secondary)' }}>
                        {user.id}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} color="var(--apple-blue)" />
                        {user.fullName || 'Unknown'}
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td><span className="status-badge status-active">Active</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn" style={{ padding: '6px', background: 'var(--apple-gray)', color: 'var(--apple-text)' }}>
                          <Edit size={16} />
                        </button>
                        <button className="btn" style={{ padding: '6px', background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30' }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
