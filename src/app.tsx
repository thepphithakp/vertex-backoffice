import { Router, Route } from 'preact-router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { PetsList } from './pages/PetsList';
import { EventLog } from './pages/EventLog';
import { UsersList } from './pages/UsersList';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { routes } from './routes';
import './index.css';

function MainLayout() {
  const { token } = useAuth();
  
  if (!token) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <Router>
          <Route path={routes.dashboard} component={Dashboard} />
          <Route path={routes.pets} component={PetsList} />
          <Route path={routes.events} component={EventLog} />
          <Route path={routes.users} component={UsersList} />
          {/* /backoffice กับ /backoffice/ เป็นคนละ path ในสายตา router
              default จึงรับทั้งกรณีที่มี trailing slash และ path ที่พิมพ์ผิด */}
          <Route default component={Dashboard} />
        </Router>
      </div>
    </div>
  );
}

// client id ของ Google ไม่ใช่ความลับโดยการออกแบบ แต่เก็บไว้นอก code
// เพื่อให้เปลี่ยนโปรเจกต์ Google ได้โดยไม่ต้องแก้ source (VT-82)
// ตั้งผ่าน VITE_GOOGLE_CLIENT_ID ตอน build — ถ้าไม่ตั้ง ปุ่ม Google จะไม่ขึ้น
// แต่ login ด้วย email/password ยังใช้ได้ตามปกติ
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

export function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
