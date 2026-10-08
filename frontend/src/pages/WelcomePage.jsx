import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PawPrint, Mail, ArrowRight, Heart, ShieldCheck, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PetOwnerHeroArt from '../components/illustrations/PetOwnerHeroArt';
import RoleOnboardingModal from '../components/modals/RoleOnboardingModal';
import { initiateGoogleOAuthRedirect } from '../utils/googleAuth';
import { parseApiError, logError } from '../utils/errorHandler';

export default function WelcomePage() {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState(null);
  const [error, setError] = useState('');

  // If already logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (user) {
      redirectToDashboard(user.role);
    }
  }, [user]);

  const redirectToDashboard = (role) => {
    switch (role) {
      case 'RESCUER':
        navigate('/dashboard/rescuer');
        break;
      case 'VETERINARIAN':
        navigate('/dashboard/veterinarian');
        break;
      case 'NGO':
        navigate('/dashboard/ngo');
        break;
      case 'VOLUNTEER':
        navigate('/dashboard/volunteer');
        break;
      case 'PET_OWNER':
      default:
        navigate('/dashboard/owner');
        break;
    }
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = async (customCredential = null) => {
    setLoading(true);
    setError('');
    try {
      if (customCredential) {
        const res = await loginWithGoogle({ credential: customCredential });
        if (res?.needsOnboarding) {
          setOnboardingData(res);
        } else if (res?.role) {
          redirectToDashboard(res.role);
        }
        return;
      }

      const result = await initiateGoogleOAuthRedirect();
      if (!result.redirected) {
        if (result.reason === 'NOT_CONFIGURED') {
          setError('Google OAuth requires GOOGLE_CLIENT_ID to be configured in your environment variables. You can also sign in or register with email.');
        } else {
          setError('Unable to initiate Google Sign-in. Please verify Google OAuth settings or sign in with email.');
        }
      }
    } catch (err) {
      logError('Google Sign-in', err);
      const parsed = parseApiError(err, 'Google Sign-in failed. Please try again.');
      setError(parsed);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (loggedUser) => {
    setOnboardingData(null);
    redirectToDashboard(loggedUser.role);
  };

  return (
    <div className="welcome-page-container">
      {/* Top Navigation Bar */}
      <header className="welcome-header">
        <div className="welcome-brand">
          <div className="brand-logo-circle">
            <PawPrint size={24} strokeWidth={2.4} />
          </div>
          <div>
            <span className="brand-title">BrunoVerse</span>
            <span className="brand-tagline">Care • Connect • Create Change</span>
          </div>
        </div>

        <div className="welcome-nav-actions">
          <Link to="/login" className="welcome-nav-login">Sign In</Link>
          <Link to="/register" className="welcome-nav-signup">Sign Up</Link>
        </div>
      </header>

      {/* Main Welcome Hero */}
      <main className="welcome-main-grid">
        {/* Left Content Column */}
        <div className="welcome-content-col">
          <div className="welcome-badge-pill">
            <Sparkles size={14} className="text-amber-500" />
            <span>India's Community Platform for Animal Welfare</span>
          </div>

          <h1 className="welcome-headline">
            Care for animals.<br />
            Connect with people.<br />
            <span className="text-forest-highlight">Create real change.</span>
          </h1>

          <p className="welcome-subtext">
            Join thousands of pet owners, rescuers, veterinarians, NGOs, and volunteers dedicated to making the world a kinder place for every animal.
          </p>

          {error && (
            <div className="welcome-error-banner">
              {error}
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="welcome-action-buttons">
            {/* Real Google Auth / Identity Button */}
            <button 
              type="button" 
              className="btn-google-auth"
              onClick={() => handleGoogleSignIn()}
              disabled={loading}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>{loading ? 'Connecting with Google...' : 'Continue with Google'}</span>
            </button>

            {/* Email Registration */}
            <Link to="/register" className="btn-email-auth">
              <Mail size={18} />
              <span>Sign up with Email</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="welcome-signin-prompt">
            Already have an account?{' '}
            <Link to="/login" className="welcome-link-bold">Sign In</Link>
          </div>

          {/* Quick Features List */}
          <div className="welcome-features-list">
            <div className="feature-pill">
              <CheckCircle2 size={16} className="text-forest" />
              <span>Report distressed animals</span>
            </div>
            <div className="feature-pill">
              <CheckCircle2 size={16} className="text-forest" />
              <span>Manage your pets & reminders</span>
            </div>
            <div className="feature-pill">
              <CheckCircle2 size={16} className="text-forest" />
              <span>Connect with nearby shelters & vets</span>
            </div>
          </div>
        </div>

        {/* Right Illustration Column */}
        <div className="welcome-art-col">
          <div className="welcome-illustration-card">
            <PetOwnerHeroArt />
            <div className="welcome-quote-bubble">
              <p className="welcome-quote-text">
                "Kindness goes a long way for them <span className="heart-pink">♥</span>"
              </p>
              <span className="welcome-quote-author">— The BrunoVerse Community</span>
            </div>
          </div>
        </div>
      </main>

      {/* Role Onboarding Modal when Google login is new */}
      {onboardingData && (
        <RoleOnboardingModal
          initialData={onboardingData}
          onSuccess={handleOnboardingComplete}
          onClose={() => setOnboardingData(null)}
        />
      )}
    </div>
  );
}
