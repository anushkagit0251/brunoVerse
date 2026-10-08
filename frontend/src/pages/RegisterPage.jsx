import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

import RoleOnboardingModal from '../components/modals/RoleOnboardingModal';
import { initiateGoogleOAuthRedirect, setupGoogleIdentityServices } from '../utils/googleAuth';
import { parseApiError, logError } from '../utils/errorHandler';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'PET_OWNER',
    gender: 'MALE'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [onboardingData, setOnboardingData] = useState(null);
  const [googleStatus, setGoogleStatus] = useState(null);
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const initGIS = async () => {
      const res = await setupGoogleIdentityServices(
        googleBtnContainerRef.current,
        (credential) => {
          if (mounted) handleGoogleCredentialResponse(credential);
        },
        { text: 'signup_with', width: 340 }
      );
      if (mounted) {
        setGoogleStatus(res);
      }
    };

    initGIS();

    return () => {
      mounted = false;
    };
  }, [formData.role, formData.gender]);

  const handleGoogleCredentialResponse = async (credential) => {
    setLoading(true);
    setError('');
    try {
      const res = await loginWithGoogle({ credential, role: formData.role, gender: formData.gender, phone: formData.phone });
      if (res?.needsOnboarding) {
        setOnboardingData(res);
      } else if (res?.role) {
        redirectToDashboard(res.role);
      }
    } catch (err) {
      logError('Google registration credential response', err);
      const detail = parseApiError(err, 'Google Sign-Up failed');
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await initiateGoogleOAuthRedirect(formData.role);
      if (!result.redirected) {
        if (result.reason === 'NOT_CONFIGURED') {
          setError('Google OAuth requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to be configured in your environment variables.');
        } else {
          setError('Google Sign-Up could not initiate redirect. Please verify Google credentials.');
        }
      }
    } catch (err) {
      logError('Google OAuth redirect initiation', err);
      const detail = parseApiError(err, 'Google Sign-Up failed');
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
        gender: formData.gender
      });

      switch (user.role) {
        case 'RESCUER': navigate('/dashboard/rescuer'); break;
        case 'VETERINARIAN': navigate('/dashboard/veterinarian'); break;
        case 'NGO': navigate('/dashboard/ngo'); break;
        case 'VOLUNTEER': navigate('/dashboard/volunteer'); break;
        case 'PET_OWNER':
        default:
          navigate('/dashboard/owner'); break;
      }
    } catch (err) {
      logError('Registration submit', err);
      const msg = parseApiError(err, 'Registration failed. Email might already be taken.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ width: '520px' }}>
        <div className="auth-logo-center">
          <div className="sidebar-logo-icon" style={{ width: '52px', height: '52px', borderRadius: '18px' }}>
            <PawPrint size={28} strokeWidth={2.4} />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', color: 'var(--primary)', fontWeight: 800 }}>Join BrunoVerse</h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Create your animal welfare profile
            </p>
          </div>
        </div>

        {/* Google Registration */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '14px', width: '100%' }}>
          <div 
            ref={googleBtnContainerRef} 
            id="google-signup-btn-container" 
            style={{ minHeight: '44px', display: googleStatus?.initialized ? 'flex' : 'none', justifyContent: 'center', width: '100%' }}
          ></div>

          {(!googleStatus || !googleStatus.initialized) && (
            <button 
              type="button" 
              className="btn-google-auth"
              onClick={() => handleGoogleSignUp()}
              disabled={loading}
              style={{ width: '100%' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign up with Google</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0', color: 'var(--text-muted)', fontSize: '12px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          <span>OR REGISTER WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'var(--accent-red)', color: 'var(--accent-red-text)', borderRadius: '12px', fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="e.g. Ayushman Sharma" 
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="name@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-input" 
                placeholder="9876543210" 
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Gender Selection Requirement 2 */}
          <div className="form-group">
            <label className="form-label">Gender *</label>
            <div style={{ display: 'flex', gap: '16px', background: '#F8FAF8', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="MALE" 
                  checked={formData.gender === 'MALE'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                />
                Male
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="FEMALE" 
                  checked={formData.gender === 'FEMALE'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                />
                Female
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="gender" 
                  value="PREFER_NOT_TO_SAY" 
                  checked={formData.gender === 'PREFER_NOT_TO_SAY'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                />
                Prefer not to say
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Choose Role *</label>
            <select 
              className="form-select" 
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="PET_OWNER">Pet Owner (Manage pets & veterinary care)</option>
              <option value="RESCUER">Rescuer (Handle emergency cases & rescues)</option>
              <option value="VETERINARIAN">Veterinarian (Consultations & medical charts)</option>
              <option value="NGO">NGO (Shelters, adoptions & drives)</option>
              <option value="VOLUNTEER">Volunteer (Feeding drives & assistance)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="Minimum 6 characters" 
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Complete Registration</span>}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In
          </Link>
        </div>
      </div>

      {onboardingData && (
        <RoleOnboardingModal
          initialData={onboardingData}
          onSuccess={(u) => {
            setOnboardingData(null);
            redirectToDashboard(u.role);
          }}
          onClose={() => setOnboardingData(null)}
        />
      )}
    </div>
  );
}
