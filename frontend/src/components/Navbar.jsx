import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">BCG<span className="logo-x">X</span></span>
        <span className="navbar-title">Price Optimization Tool</span>
      </div>
      {user && (
        <div className="navbar-right">
          <span className="navbar-welcome">Welcome, <strong>{user.name}</strong></span>
          <span className={`badge badge-${user.role}`}>{user.role}</span>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  );
}
