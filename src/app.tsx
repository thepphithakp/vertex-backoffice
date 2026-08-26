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

const GOOGLE_CLIENT_ID = "565361629384-lre3e35dhoj151akegf1bskv38st9oe3.apps.googleusercontent.com";

export function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
