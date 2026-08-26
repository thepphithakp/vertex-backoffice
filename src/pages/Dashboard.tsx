import { useState, useEffect } from 'preact/hooks';
import { Users, PawPrint, Activity } from 'lucide-preact';
import { useAuth } from '../context/AuthContext';

export function Dashboard() {
  const [stats, setStats] = useState({ pets: 0, users: 0, eventsToday: 0 });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [petsMap, setPetsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEvents, resPets, resUsers] = await Promise.all([
          fetch('/api/v1/admin/events', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/admin/pets', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/auth/users', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (resEvents.status === 401 || resPets.status === 401 || resUsers.status === 401) {
          logout();
          return;
        }
        
        const eventsData = resEvents.ok ? await resEvents.json() : [];
        const petsData = resPets.ok ? await resPets.json() : [];
        const usersData = resUsers.ok ? await resUsers.json() : [];

        const pMap: Record<string, string> = {};
        (petsData || []).forEach((p: any) => { pMap[p.id] = p.name; });
        setPetsMap(pMap);

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const events = eventsData || [];
        const todayEvents = events.filter((e: any) => new Date(e.timestamp) >= todayStart);

        setStats({
          pets: (petsData || []).length,
          users: (usersData || []).length,
          eventsToday: todayEvents.length
        });
        
        setRecentEvents(events.slice(0, 5));

      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  if (loading) {
    return <div className="page-content"><p>Loading Dashboard...</p></div>;
  }

  const getEventBadge = (type: string) => {
    if (type.includes('LITTER')) return <span className="status-badge status-active">{type}</span>;
    if (type.includes('WATER')) return <span className="status-badge" style={{ backgroundColor: 'rgba(0,199,255,0.1)', color: '#00C7FF' }}>{type}</span>;
    return <span className="status-badge status-inactive">{type}</span>;
  };

  return (
    <div className="page-content">
      <h1>Dashboard</h1>
      <p style={{ marginBottom: '32px' }}>Overview of your Vertex pet ecosystem.</p>
      
      <div className="grid-3">
        <div className="card stat-card">
          <div className="stat-icon">
            <PawPrint size={24} />
          </div>
          <div className="stat-value">{stats.pets}</div>
          <div className="stat-label">Total Pets Registered</div>
        </div>
        <div className="card stat-card" style={{ '--apple-blue': '#34C759' } as any}>
          <div className="stat-icon" style={{ color: 'var(--apple-blue)', backgroundColor: 'rgba(52, 199, 89, 0.1)' }}>
            <Users size={24} />
          </div>
          <div className="stat-value">{stats.users}</div>
          <div className="stat-label">Active Caregivers</div>
        </div>
        <div className="card stat-card" style={{ '--apple-blue': '#FF9500' } as any}>
          <div className="stat-icon" style={{ color: 'var(--apple-blue)', backgroundColor: 'rgba(255, 149, 0, 0.1)' }}>
            <Activity size={24} />
          </div>
          <div className="stat-value">{stats.eventsToday}</div>
          <div className="stat-label">Transactions & Events Today</div>
        </div>
      </div>

      <h2>Recent Activity</h2>
      <div className="card">
        <div className="table-container" style={{ boxShadow: 'none' }}>
          {recentEvents.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#86868b' }}>No recent activity found.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Pet</th>
                  <th>Caregiver</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((evt) => {
                  const petName = petsMap[evt.entityId] || evt.payload?.name || 'Unknown Pet';
                  return (
                    <tr key={evt.id}>
                      <td>{getEventBadge(evt.eventType)}</td>
                      <td>
                        {evt.entityId ? (
                          <span className="tooltip-container" style={{ cursor: 'help', borderBottom: '1px dotted #ccc' }}>
                            {petName}
                            <span className="tooltip-text">{evt.entityId}</span>
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{evt.actorUsername || 'System'}</td>
                      <td>{new Date(evt.timestamp).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
