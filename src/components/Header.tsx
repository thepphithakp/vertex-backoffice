import { useState } from 'preact/hooks';
import { Bell, Search, User, LogOut } from 'lucide-preact';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="header glass-panel">
      <div style={{ flex: 1 }}>
        <div style={{
          position: 'relative',
          width: '300px'
        }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--apple-text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search..." 
            style={{ 
              paddingLeft: '36px', 
              paddingTop: '8px', 
              paddingBottom: '8px',
              backgroundColor: 'rgba(0,0,0,0.04)',
              border: 'none',
              borderRadius: '20px'
            }} 
          />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button style={{ background: 'transparent', color: 'var(--apple-text)' }}>
          <Bell size={20} />
        </button>
        <div style={{ position: 'relative' }}>
          <div 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 500,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <div className="avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--apple-blue)', color: 'white' }}>
              <User size={20} />
            </div>
            {user ? (user.fullName || user.username) : 'Admin'}
          </div>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              backgroundColor: '#fff',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '8px',
              minWidth: '150px',
              zIndex: 100
            }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '4px' }}>
                <div style={{ fontWeight: 600 }}>{user?.fullName || user?.username || 'Admin'}</div>
                <div style={{ fontSize: '12px', color: 'var(--apple-text-secondary)' }}>{user?.email || ''}</div>
              </div>
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '8px 12px',
                  background: 'transparent',
                  color: '#FF3B30',
                  textAlign: 'left',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
