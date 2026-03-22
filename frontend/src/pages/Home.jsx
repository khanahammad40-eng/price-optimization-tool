import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-content">
        <div className="home-hero">
          <div className="home-brand">BCG<span>X</span></div>
          <h1 className="home-title">Price Optimization Tool</h1>
          <p className="home-desc">
            Leverage demand forecasting and market intelligence to drive optimal
            pricing strategies across your product portfolio.
          </p>
        </div>

        <div className="home-cards">
          <div className="home-card" onClick={() => navigate('/products')}>
            <div className="home-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
                <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
              </svg>
            </div>
            <div className="home-card-body">
              <h2>Create and Manage Product</h2>
              <p>
                Add, edit, and manage your product catalog. Search and filter with
                advanced controls. Role-based access ensures data security.
              </p>
              <span className="home-card-arrow">→</span>
            </div>
          </div>

          <div className="home-card" onClick={() => navigate('/pricing')}>
            <div className="home-card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <div className="home-card-body">
              <h2>Pricing Optimization</h2>
              <p>
                View AI-recommended optimized prices alongside demand forecasts.
                Make data-driven pricing decisions at a glance.
              </p>
              <span className="home-card-arrow">→</span>
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="home-admin-hint">
            <span className="badge badge-admin">Admin</span>
            <span>You have full access — including user management and delete permissions.</span>
          </div>
        )}
      </div>
    </div>
  );
}
