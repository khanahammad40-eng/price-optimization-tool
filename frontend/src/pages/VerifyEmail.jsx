import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../api';
import './Auth.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }

    API.get(`/auth/verify-email?token=${token}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data.message);
        setTimeout(() => navigate('/login'), 3000);
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed.');
      });
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-logo">BCG<span>X</span></div>

        {status === 'verifying' && (
          <>
            <div style={{ margin: '24px auto' }}>
              <span className="spinner" style={{ width: 32, height: 32 }} />
            </div>
            <h2 className="auth-title">Verifying your email...</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Please wait.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, margin: '16px 0' }}>✅</div>
            <h2 className="auth-title">Email Verified!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '8px 0 20px' }}>
              {message}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              Redirecting to login in 3 seconds...
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 20, width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/login')}
            >
              Go to Login Now
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, margin: '16px 0' }}>❌</div>
            <h2 className="auth-title">Verification Failed</h2>
            <p style={{ color: 'var(--danger)', fontSize: 13, margin: '8px 0 20px' }}>
              {message}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 20 }}>
              This link may have already been used or expired.
            </p>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => navigate('/register')}
            >
              Register Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}