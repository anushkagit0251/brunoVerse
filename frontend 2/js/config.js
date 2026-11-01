/* =========================================================
   BrunoVerse settings – edit these before launch
   ========================================================= */

/* Where is the backend?
   Leave empty when the backend serves this website (the Railway setup in the launch guide).
   Only set it if the website is hosted somewhere else, e.g. 'https://api.brunoverse.in'. */
window.BRUNOVERSE_API = window.BRUNOVERSE_API || '';

/* false = real launch: no sample clinics, people, numbers or cases are shown.
   true  = demo mode for presentations (sample data with a clear "Demo mode" banner). */
window.BRUNOVERSE_DEMO = false;

/* Photo & video storage (needed on free hosts like Render, whose disk is wiped on restart).
   Cloudinary → Settings → Upload → Upload presets → Add → Signing mode: Unsigned.
   Leave cloudName empty to store uploads on the BrunoVerse server instead. */
window.BRUNOVERSE_CLOUDINARY = {
  cloudName: '',      // e.g. 'dxyz12345' (shown on your Cloudinary dashboard)
  uploadPreset: '',   // e.g. 'brunoverse_unsigned'
};

/* Shown on the Privacy Policy and Terms pages. Replace every value. */
window.BRUNOVERSE_LEGAL = {
  operator: 'Anushka Gupta',               // person or organisation running BrunoVerse
  email: 'support@brunoverse.in',          // contact + grievance email you actually read
  city: 'Noida, Uttar Pradesh, India',     // city/state for legal notices and courts
  updated: '31 October 2026',              // date you last changed the policies
};
