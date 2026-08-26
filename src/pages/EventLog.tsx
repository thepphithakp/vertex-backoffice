import { useState, useEffect } from 'preact/hooks';
import { Filter } from 'lucide-preact';
import { useAuth } from '../context/AuthContext';

export function EventLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [petsMap, setPetsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, logout } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resEvents, resPets] = await Promise.all([
          fetch('/api/v1/admin/events', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/admin/pets', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (resEvents.status === 401 || resPets.status === 401) {
          logout();
          return;
        }
        
        if (!resEvents.ok) throw new Error('Failed to fetch events');
        
        const eventsData = await resEvents.json();
        setLogs(eventsData || []);

        if (resPets.ok) {
          const petsData = await resPets.json();
          const pMap: Record<string, string> = {};
          (petsData || []).forEach((p: any) => {
            pMap[p.id] = p.name;
          });
          setPetsMap(pMap);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [token]);

  return (
    <div className="page-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1>Transaction Journey & Event Logs</h1>
          <p>Track every interaction and update within the platform</p>
        </div>
        <button className="btn btn-secondary">
          <Filter size={18} /> Filter Logs
        </button>
      </div>

      <div className="card">
        <div className="table-container" style={{ boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event Type</th>
                <th>Action</th>
                <th>Pet</th>
                <th>User</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
                {/* เดิม loading กับ error ถูก set ไว้แต่ไม่เคยแสดง
                    เวลา fetch พังจึงเห็นแค่ตารางว่างโดยไม่รู้ว่าเกิดอะไรขึ้น */}
                {loading && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Loading…</td></tr>
                )}
                {!loading && error && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--apple-red, #ff3b30)' }}>{error}</td></tr>
                )}
                {!loading && !error && logs.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No events yet</td></tr>
                )}
                {logs.map(log => {
                  const petName = petsMap[log.entityId] || log.payload?.name || 'Unknown Pet';
                  const userName = log.actorUsername || 'System';
                  return (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'var(--apple-blue-light)', color: 'var(--apple-blue)' }}>
                        {log.eventType}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{log.action}</td>
                    <td>
                      <span title={log.entityId} style={{ cursor: 'help', borderBottom: '1px dotted #ccc' }}>
                        {petName}
                      </span>
                    </td>
                    <td>
                      <span title={log.actorId} style={{ cursor: 'help', borderBottom: '1px dotted #ccc' }}>
                        {userName}
                      </span>
                    </td>
                    <td style={{ color: 'var(--apple-text-secondary)', fontSize: '13px' }}>
                      {log.payload ? JSON.stringify(log.payload) : '-'}
                    </td>
                  </tr>
                )})}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
