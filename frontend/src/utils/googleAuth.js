import { authApi } from '../api/authApi';

let cachedConfig = null;

export async function fetchGoogleConfig() {
  if (cachedConfig) return cachedConfig;
  try {
    const data = await authApi.getGoogleConfig();
    cachedConfig = {
      clientId: data?.clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      configured: Boolean(data?.configured || import.meta.env.VITE_GOOGLE_CLIENT_ID),
      redirectUri: data?.redirectUri || `${window.location.origin}/auth/google/callback`
    };
    return cachedConfig;
  } catch (err) {
    console.warn('Could not fetch backend Google config:', err);
    cachedConfig = {
      clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      configured: Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID),
      redirectUri: `${window.location.origin}/auth/google/callback`
    };
    return cachedConfig;
  }
}

/**
 * Initializes Google Identity Services (GIS) and renders the official Google Sign-In button.
 * When the user selects their account, onCredentialSuccess is called with the OIDC ID token JWT.
 */
export async function setupGoogleIdentityServices(containerElement, onCredentialSuccess, options = {}) {
  const config = await fetchGoogleConfig();
  if (!config.clientId || !config.configured) {
    return { initialized: false, reason: 'NOT_CONFIGURED', config };
  }

  // Wait briefly if GIS script is still loading
  let attempts = 0;
  while ((!window.google || !window.google.accounts || !window.google.accounts.id) && attempts < 20) {
    await new Promise((res) => setTimeout(res, 100));
    attempts++;
  }

  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    console.warn('Google Identity Services script (accounts.google.com/gsi/client) is not loaded');
    return { initialized: false, reason: 'SCRIPT_NOT_LOADED', config };
  }

  try {
    window.google.accounts.id.initialize({
      client_id: config.clientId,
      callback: (response) => {
        if (response && response.credential) {
          onCredentialSuccess(response.credential);
        } else {
          console.warn('Google Sign-In response missing credential:', response);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    if (containerElement) {
      window.google.accounts.id.renderButton(containerElement, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: options.text || 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: options.width || 340,
      });
    }

    return { initialized: true, config };
  } catch (err) {
    console.error('Error initializing Google Identity Services:', err);
    return { initialized: false, error: err, config };
  }
}

/**
 * Initiates direct OAuth 2.0 authorization code redirect flow to Google
 */
export async function initiateGoogleOAuthRedirect(currentRole = null) {
  const redirectUri = `${window.location.origin}/auth/google/callback`;
  
  if (currentRole) {
    sessionStorage.setItem('brunoverse_oauth_role', currentRole);
  }

  try {
    const data = await authApi.getGoogleAuthUrl(redirectUri);
    if (data.configured && data.authUrl && !data.authUrl.includes('placeholder_client_id')) {
      window.location.href = data.authUrl;
      return { redirected: true };
    }
  } catch (err) {
    console.warn('Could not fetch backend Google OAuth URL:', err);
  }

  const config = await fetchGoogleConfig();
  if (config.clientId && config.clientId.trim().length > 0 && !config.clientId.includes('placeholder')) {
    const scope = encodeURIComponent('openid profile email');
    const encodedRedirect = encodeURIComponent(redirectUri);
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.clientId}&redirect_uri=${encodedRedirect}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    return { redirected: true };
  }

  return { redirected: false, reason: 'NOT_CONFIGURED', config };
}
