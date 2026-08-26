import { useState } from 'preact/hooks';
import { useAuth } from '../context/AuthContext';
import { PawPrint } from 'lucide-preact';
import { GoogleLogin } from '@react-oauth/google';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // ไม่ได้ตั้ง client id = ปุ่ม Google ใช้ไม่ได้ ให้เริ่มที่ email/password แทน
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [loginMode, setLoginMode] = useState<'password' | 'google'>(
    googleEnabled ? 'google' : 'password'
  );
  const { login } = useAuth();

  const handlePasswordLogin = async (e: Event) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      if (data.token) login(data.token);
      else throw new Error('No token returned');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google Login failed');
      if (data.token) login(data.token);
      else throw new Error('No token returned');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--apple-bg)' }}>
      <div className="card" style={{ width: '400px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--apple-blue), #5ac8fa)',
            width: '64px', height: '64px', borderRadius: '20px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', color: 'white', margin: '0 auto 16px'
          }}>
            <PawPrint size={32} />
          </div>
          <h2>Vertex Admin</h2>
          <p>Sign in to manage the platform</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#FF3B30', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {/* ไม่มี client id ก็ไม่ต้องมีตัวเลือกให้กด — กดไปก็ขึ้น error อย่างเดียว */}
        {googleEnabled && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'rgba(0,0,0,0.05)', padding: '4px', borderRadius: '8px' }}>
          <button 
            type="button"
            onClick={() => setLoginMode('google')}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, 
                     backgroundColor: loginMode === 'google' ? 'white' : 'transparent',
                     boxShadow: loginMode === 'google' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >Google</button>
          <button 
            type="button"
            onClick={() => setLoginMode('password')}
            style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                     backgroundColor: loginMode === 'password' ? 'white' : 'transparent',
                     boxShadow: loginMode === 'password' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}
          >Email/Password</button>
        </div>
        )}

        {loginMode === 'password' ? (
          <form onSubmit={handlePasswordLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label className="label">Email</label>
              <input type="email" value={email} onInput={(e: any) => setEmail(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label className="label">Password</label>
              <input type="password" value={password} onInput={(e: any) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
             <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Sign-In was unsuccessful')}
                useOneTap
              />
              <p style={{ fontSize: '12px', color: 'var(--apple-text-secondary)', textAlign: 'center' }}>
                Securely sign in using your verified Google account.
              </p>
          </div>
        )}
      </div>
    </div>
  );
}
