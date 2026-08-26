import { useState, useEffect } from 'preact/hooks';
import { PawPrint, Edit, Trash2, Users } from 'lucide-preact';
import { useAuth } from '../context/AuthContext';

export function PetsList() {
  const [pets, setPets] = useState<any[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
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
        if (res.ok) {
          const usersList = await res.json();
          const map: Record<string, string> = {};
          usersList.forEach((u: any) => {
            map[u.id] = u.fullName || u.email;
          });
          setUsersMap(map);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };

    const fetchPets = async () => {
      try {
        const res = await fetch('/api/v1/admin/pets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.status === 401) {
          logout();
          return;
        }
        
        if (!res.ok) {
          throw new Error('Failed to fetch pets');
        }
        
        const data = await res.json();
        setPets(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
    fetchPets();
  }, [token]);

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Pet Management</h1>
          <p>Manage all pets across the platform</p>
        </div>
        <button className="btn btn-primary">
          <PawPrint size={18} /> Add New Pet
        </button>
      </div>
      
      {error && (
        <div style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--apple-text-secondary)' }}>
            Loading pets...
          </div>
        ) : pets.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--apple-text-secondary)' }}>
            No pets found in the system.
          </div>
        ) : (
          <div className="table-container" style={{ boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Species / Breed</th>
                  <th>Owner & Co-Caregivers</th>
                  <th>Weight</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pets.map(pet => (
                  <tr key={pet.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="avatar">
                          {pet.avatarData && <img src={`data:image/jpeg;base64,${pet.avatarData}`} alt={pet.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ fontWeight: 500 }}>{pet.name}</div>
                      </div>
                    </td>
                    <td>
                      <div>{pet.species}</div>
                      <div style={{ fontSize: '13px', color: 'var(--apple-text-secondary)' }}>{pet.breed || '-'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{pet.ownerUsername || 'Unknown'} <span style={{fontSize: '11px', color: 'var(--apple-text-secondary)', fontWeight: 'normal'}}>(Owner)</span></div>
                      {pet.caregivers && pet.caregivers.length > 0 && (
                        <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {pet.caregivers.map((cg: any) => (
                            <div key={cg.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--apple-text-secondary)' }}>
                              <Users size={12} />
                              {usersMap[cg.userId] || 'Unknown User'}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>{pet.currentWeight ? `${pet.currentWeight} kg` : '-'}</td>
                    <td><span className="status-badge status-active">Active</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{ padding: '6px', background: 'rgba(0,113,227,0.1)', color: 'var(--apple-blue)', borderRadius: '6px' }}>
                          <Edit size={16} />
                        </button>
                        <button style={{ padding: '6px', background: 'rgba(255,59,48,0.1)', color: '#FF3B30', borderRadius: '6px' }}>
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
