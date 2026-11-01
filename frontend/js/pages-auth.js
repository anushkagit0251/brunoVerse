/* ---------- Login / Sign up ---------- */
function pageLogin(mode = 'login') {
  document.body.className = 'theme-owner auth-body';
  const quotes = ['“Until one has loved an animal, a part of one’s soul remains unawakened.”', '“The greatness of a nation can be judged by the way its animals are treated.”'];
  return `
  <div class="auth">
    <section class="auth-hero">
      <a class="brand light" href="#/login"><img src="assets/logo.svg" width="48" height="48" alt=""><span><b>BrunoVerse</b><small>Care • Connect • Create Change</small></span></a>
      <div class="auth-copy">
        <h1>Every paw deserves<br><em>a helping hand.</em></h1>
        <p>One home for pet parents and rescuers — report an animal in need, find help near you with GPS, keep your pet’s health records, and get first-aid guidance in the moments that matter.</p>
        ${authStats()}
        <p class="hand big">${quotes[new Date().getDate() % 2]}</p>
      </div>
      <div class="auth-photos"><img src="${PHOTOS.story1}" alt=""><img src="${PHOTOS.misty}" alt=""><img src="${PHOTOS.puppy}" alt=""></div>
    </section>
    <section class="auth-form-wrap">
      <div class="auth-card">
        <div class="tabs"><button class="${mode === 'login' ? 'on' : ''}" data-mode="login">Log in</button><button class="${mode === 'signup' ? 'on' : ''}" data-mode="signup">Create account</button></div>
        ${mode === 'login' ? `
        <form id="loginForm" class="form">
          <label>Email or phone<input name="id" required autocomplete="username" placeholder="you@example.com or 98765 43210"></label>
          <label>Password<input name="password" type="password" required autocomplete="current-password" placeholder="Your password"></label>
          <button class="btn btn-primary full">Log in ${icon('arrowR', 16)}</button>
        </form>
        ${isDemo() && Store.user('u_anushka') ? `<div class="divider"><span>or try the demo</span></div>
        <div class="demo-btns">
          <button class="demo-card" data-demo="u_anushka">${avatar(Store.user('u_anushka'), 44)}<span><b>Anushka</b><small>Pet Owner</small></span></button>
          <button class="demo-card blue" data-demo="u_rohit">${avatar(Store.user('u_rohit'), 44)}<span><b>Rohit</b><small>Rescuer</small></span></button>
        </div>
        <p class="muted small center">Tip: open the Owner in one tab and the Rescuer in another — reports & status update live.</p>` : `<p class="muted small center">New here? Choose <b>Create account</b> above — it takes a minute.</p>`}`
        : `
        <form id="signupForm" class="form">
          <p class="label">I am a…</p>
          <div class="role-pick">
            ${[['owner', 'Pet Owner', 'paw'], ['rescuer', 'Rescuer', 'hand'], ['feeder', 'Feeder / Volunteer', 'food'], ['vet', 'Veterinarian', 'steth'], ['ngo', 'NGO / Shelter', 'building']]
              .map(([v, l, ic], i) => `<label class="role-opt"><input type="radio" name="role" value="${v}" ${i === 0 ? 'checked' : ''}><span>${icon(ic, 22)}${l}</span></label>`).join('')}
          </div>
          <label>Full name<input name="name" required placeholder="Your name"></label>
          <div class="grid2"><label>Phone<input name="phone" required placeholder="+91 98xxx xxxxx" pattern="[+0-9 ]{10,16}"></label><label>City<input name="city" placeholder="Noida"></label></div>
          <label>Email<input name="email" type="email" required placeholder="you@example.com"></label>
          <label>Password<input name="password" type="password" minlength="8" required placeholder="At least 8 characters"></label>
          <label class="check"><input type="checkbox" name="loc" checked> Use my GPS location so nearby animals & helpers can find me</label>
          <label class="check"><input type="checkbox" name="agree" required> I am 18 or older (or have a parent’s consent) and agree to the <a href="#/terms" target="_blank">Terms</a> and <a href="#/privacy" target="_blank">Privacy Policy</a></label>
          <button class="btn btn-primary full">Create my account ${icon('heart', 16)}</button>
        </form>`}
        <p class="legal-links center small"><a href="#/privacy">Privacy Policy</a> · <a href="#/terms">Terms of Use</a></p>
      </div>
    </section>
  </div>`;
}

const DEMO_EMAILS = { u_anushka: 'anushka@demo.in', u_rohit: 'rohit@demo.in' };
async function demoLogin(id) {
  try {
    if (Api.online) await Api.login(DEMO_EMAILS[id], 'demo123'); else Store.login(id);
    toast(`Welcome, ${esc(firstName(Store.me))} 💛 (demo account)`);
    location.hash = '#/home'; render();
  } catch (err) { toast(esc(err.message), 'error'); }
}

// Demo numbers only on demo servers; a real launch shows real counts
function authStats() {
  if (isDemo()) return `<div class="auth-stats"><div><b>${Store.db.cases.length + 1240}</b><small>animals helped</small></div><div><b>${directory().length + 86}</b><small>vets, NGOs & rescuers</small></div><div><b>24×7</b><small>emergency guidance</small></div></div>`;
  const helped = Store.db.cases.filter(c => c.status === 'resolved').length;
  const network = directory().length;
  return `<div class="auth-stats">${helped ? `<div><b>${helped}</b><small>animals helped</small></div>` : ''}${network ? `<div><b>${network}</b><small>vets, NGOs & rescuers</small></div>` : ''}<div><b>24×7</b><small>first-aid guidance</small></div></div>`;
}

function bindLogin() {
  $$('.tabs [data-mode]').forEach(b => b.onclick = () => { location.hash = b.dataset.mode === 'signup' ? '#/signup' : '#/login'; });
  $$('[data-demo]').forEach(b => b.onclick = () => demoLogin(b.dataset.demo));
  $('#loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const f = formData(e.target);
    if (Api.online) {
      try { const su = await Api.login(f.id, f.password); Store.login(su.id); toast(`Welcome back, ${esc(firstName(su))} 💛`); location.hash = '#/home'; render(); }
      catch (err) { toast(esc(err.message), 'error'); }
      return;
    }
    const id = f.id.trim().toLowerCase();
    const digits = s => (s || '').replace(/\D/g, '').slice(-10);
    const found = Store.db.users.find(x => (x.email || '').toLowerCase() === id || (digits(id).length === 10 && digits(x.phone) === digits(id)));
    if (!found) return toast(Api.online
      ? 'No account found with this email or phone. Check it, or choose <b>Create account</b>.'
      : 'No account found on this device. Accounts are saved on the phone or computer where they were created (until the BrunoVerse server is connected). Choose <b>Create account</b> to make one here.', 'error');
    if (found.password !== f.password) return toast('Wrong password. Please try again.' + (isDemo() ? ' Demo accounts use <b>demo123</b>.' : ''), 'error');
    const u = found;
    Store.login(u.id); toast(`Welcome back, ${firstName(u)} 💛`); location.hash = '#/home';
  });
  $('#signupForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const f = formData(e.target);
    if (Api.online) {
      const btn = $('#signupForm button.btn-primary'); btn.disabled = true;
      try {
        const nu = { name: f.name, email: f.email, phone: f.phone, password: f.password, role: f.role, city: f.city, available: true };
        if (f.loc) { const l = await Geo.locate({ silent: true }); if (Geo.status === 'ok') { nu.lat = l.lat; nu.lng = l.lng; } }
        const u = await Api.signup(nu);
        Store.notify(u.id, `Welcome to BrunoVerse, ${firstName(u)}! ${u.role === 'owner' ? 'Add your first pet to start their health record 🐾' : 'Your profile will show a ✓ Verified badge once our team has checked it. Keep “Available” on so people nearby can reach you 🙌'}`, u.role === 'owner' ? '#/pets' : '#/settings');
        Store.save(false);
        toast('Account created — welcome to the family 💛');
        location.hash = u.role === 'owner' ? '#/pets' : '#/home'; render();
      } catch (err) { toast(esc(err.message), 'error'); btn.disabled = false; }
      return;
    }
    if (Store.db.users.some(x => x.email?.toLowerCase() === f.email.trim().toLowerCase())) return toast('An account with this email already exists on this device. Choose <b>Log in</b> instead.', 'error');
    const u = { id: uid('u'), name: f.name, email: f.email, phone: f.phone, password: f.password, role: f.role, city: f.city, avatar: '', joined: now(), available: true, baseCompleted: 0, baseHelped: 0 };
    if (f.loc) { const l = await Geo.locate({ silent: true }); u.lat = l.lat; u.lng = l.lng; }
    Store.db.users.push(u);
    Store.notify(u.id, `Welcome to BrunoVerse, ${firstName(u)}! ${u.role === 'owner' ? 'Add your first pet to start their health record 🐾' : 'Turn on “Available” so people nearby can reach you 🙌'}`, u.role === 'owner' ? '#/pets' : '#/settings');
    Store.save(false);
    Store.login(u.id);
    toast('Account created — welcome to the family 💛');
    location.hash = u.role === 'owner' ? '#/pets' : '#/home';
  });
}
