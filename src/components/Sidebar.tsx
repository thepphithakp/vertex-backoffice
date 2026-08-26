import { NavLink } from './NavLink';
import { LayoutDashboard, PawPrint, Activity, Users } from 'lucide-preact';
import { routes } from '../routes';

export function Sidebar() {
  return (
    <div className="sidebar glass-panel">
      <div className="sidebar-logo">
        <div style={{
            background: 'linear-gradient(135deg, var(--apple-blue), #5ac8fa)',
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            <PawPrint size={20} />
        </div>
        Vertex Admin
      </div>
      <div className="nav-menu">
        <NavLink activeClassName="active" href={routes.dashboard} className="nav-item">
          <LayoutDashboard /> Dashboard
        </NavLink>
        <NavLink activeClassName="active" href={routes.pets} className="nav-item">
          <PawPrint /> Pet Management
        </NavLink>
        <NavLink activeClassName="active" href={routes.users} className="nav-item">
          <Users /> User Management
        </NavLink>
        <NavLink activeClassName="active" href={routes.events} className="nav-item">
          <Activity /> Event Logs
        </NavLink>
      </div>
    </div>
  );
}
