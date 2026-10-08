import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Loader2, AlertCircle, PawPrint } from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import RoleOnboardingModal from '../components/modals/RoleOnboardingModal';
import { parseApiError, logError } from '../utils/errorHandler';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [onboardingData, setOnboardingData] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const err = searchParams.get('error');

      if (err) {
        setError(`Google login was cancelled or denied: ${err}`);
        setLoading(false);
        return;
      }

      if (!code) {
        setError('Missing Google authorization code in callback URL.');
        setLoading(false);
        return;
      }

      const role = sessionStorage.getItem('brunoverse_oauth_role');
      sessionStorage.removeItem('brunoverse_oauth_role');
      const redirectUri = `${window.location.origin}/auth/google/callback`;

      try {
        const res = await authApi.handleGoogleCallback({
          code,
          redirectUri,
          role: role || undefined
        });

        if (res.needsOnboarding) {
          setOnboardingData(res);
          setLoading(false);
        } else if (res.token) {
          const userData = {
            userId: res.userId,
            name: res.name,
            email: res.email,
            role: res.role,
            avatarUrl: res.avatarUrl,
            gender: res.gender,
            address: res.address,
            bio: res.bio,
            token: res.token
          };
          localStorage.setItem('brunoverse_token', res.token);
          localStorage.setItem('brunoverse_user', JSON.stringify(userData));
          setUser(userData);
          redirectToDashboard(res.role);
        } else {
          setError('Unexpected response from server during Google login.');
          setLoading(false);
        }
      } catch (e) {
        logError('Google OAuth callback exchange', e);
        const msg = parseApiError(e, 'Google authorization exchange failed');
        setError(msg);
        setLoading(false);
      }
    };

    processCallback();
  }, [searchParams, navigate, setUser]);

  const redirectToDashboard = (role) => {
    switch (role) {
      case 'RESCUER': navigate('/dashboard/rescuer'); break;
      case 'VETERINARIAN': navigate('/dashboard/veterinarian'); break;
      case 'NGO': navigate('/dashboard/ngo'); break;
      case 'VOLUNTEER': navigate('/dashboard/volunteer'); break;
      case 'PET_OWNER':
      default:
        navigate('/dashboard/owner'); break;
    }
  };

  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="auth-card" style={{ width: '480px', textAlign: 'center', padding: '36px' }}>
        <div className="auth-logo-center" style={{ justifyContent: 'center', marginBottom: '20px' }}>
          <div className="sidebar-logo-icon" style={{ width: '56px', height: '56px', borderRadius: '18px' }}>
            <PawPrint size={30} strokeWidth={2.4} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', color: 'var(--primary)', fontWeight: 800 }}>BrunoVerse</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Google Authentication</p>
          </div>
        </div>

        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px 0' }}>
            <Loader2 size={40} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>Signing you in with Google...</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Verifying your Google profile and synchronizing your session with BrunoVerse.
            </p>
          </div>
        )}

        {error && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'var(--accent-red)', color: 'var(--accent-red-text)', marginBottom: '14px' }}>
              <AlertCircle size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Authentication Issue</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              {error}
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <Link to="/login" className="btn-primary" style={{ padding: '10px 20px', textDecoration: 'none' }}>
                Back to Sign In
              </Link>
            </div>
          </div>
        )}

        {onboardingData && (
          <RoleOnboardingModal
            initialData={onboardingData}
            onSuccess={(u) => {
              setOnboardingData(null);
              redirectToDashboard(u.role);
            }}
            onClose={() => navigate('/login')}
          />
        )}
      </div>
    </div>
  );
}
