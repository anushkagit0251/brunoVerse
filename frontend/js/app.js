/* =========================================================
   Router + app bootstrap
   ========================================================= */
const ROUTES = {
  home: { r: () => isRescuerSide(Store.me) ? rescuerHome() : ownerHome(), b: () => isRescuerSide(Store.me) ? bindRescuerHome() : bindOwnerHome() },
  pets: { r: pagePets, b: bindPets },
  pet: { r: pagePet, b: bindPet, nav: 'pets' },
  report: { r: pageReport, b: bindReport },
  reports: { r: pageMyReports },
  case: { r: pageCase, b: bindCase, nav: () => isRescuerSide(Store.me) ? 'requests' : 'reports' },
  help: { r: pageHelp, b: bindHelp },
  vet: { r: pageVet, b: bindVet },
  ai: { r: pageAI, b: bindAI },
  community: { r: pageCommunity, b: bindCommunity },
  messages: { r: pageMessages, b: bindMessages },
  opportunities: { r: pageOpportunities, b: bindOpportunities },
  settings: { r: pageSettings, b: bindSettings },
  cases: { r: pageCases, b: bindCases },
  requests: { r: pageRequests, b: bindRequests },
  rescues: { r: pageRescues },
  directory: { r: pageDirectory, b: bindDirectory },
  search: { r: pageSearch },
  privacy: { r: pagePrivacy },
  terms: { r: pageTerms },
  admin: { r: pageAdmin, b: bindAdmin },
};
const PUBLIC_PAGES = ['privacy', 'terms'];

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [path, qs] = raw.split('?');
  const [name, arg] = path.split('/');
  return { name: name || 'home', arg, params: new URLSearchParams(qs || '') };
}

let lastRoute = '';
function render() {
  const { name, arg, params } = parseHash();
  const app = $('#app');
  const me = Store.me;
  const pop = $('.popover'); if (pop) pop.remove();

  if (!me && PUBLIC_PAGES.includes(name)) {
    document.body.className = 'theme-owner';
    app.innerHTML = `<div class="legal-public">${ROUTES[name].r()}</div>`;
    window.scrollTo(0, 0);
    return;
  }
  if (!me) {
    if (name !== 'login' && name !== 'signup') { location.replace('#/login'); return; }
    Maps.clear();
    app.innerHTML = pageLogin(name === 'signup' ? 'signup' : 'login');
    bindLogin();
    return;
  }
  if (name === 'login' || name === 'signup') { location.replace('#/home'); return; }
  if (Geo.status === 'idle') Geo.locate({ silent: true }).then(l => {
    if (Geo.status !== 'ok') return;
    const u = Store.me; if (u && isRescuerSide(u) && u.dLat === undefined) { u.lat = l.lat; u.lng = l.lng; Store.save(false); }
    queueRender();
  });

  const route = ROUTES[name] || ROUTES.home;
  const navKey = typeof route.nav === 'function' ? route.nav() : (route.nav || name);
  const scroll = window.scrollY;
  const key = location.hash;
  Maps.clear();
  let content;
  try { content = route.r(arg, params); }
  catch (e) { console.error(e); content = emptyState('alert', 'Something went wrong', esc(e.message)); }
  app.innerHTML = shell(navKey, content);
  bindShell();
  try { route.b && route.b(arg, params); } catch (e) { console.error(e); }
  hydrateMedia(app);
  if (key === lastRoute) window.scrollTo(0, scroll); else window.scrollTo(0, 0);
  lastRoute = key;
}

// pages receive (arg) — for routes with ?query we pass URLSearchParams
ROUTES.vet.r = (a, p) => pageVet(p);
ROUTES.directory.r = (a, p) => pageDirectory(p);

window.addEventListener('hashchange', render);

// Re-render on local saves
let renderQueued = false;
function queueRender() { if (renderQueued) return; renderQueued = true; requestAnimationFrame(() => { renderQueued = false; render(); }); }

// Live sync between tabs (owner tab <-> rescuer tab)
let pendingSync = false;
window.addEventListener('storage', e => {
  if (e.key !== DB_KEY || !e.newValue) return;
  try { Store.db = JSON.parse(e.newValue); } catch (err) { return; }
  const a = document.activeElement;
  if (a && ['INPUT', 'TEXTAREA', 'SELECT'].includes(a.tagName) && a.value) { pendingSync = true; return; }
  queueRender();
});
document.addEventListener('focusout', () => { if (pendingSync) { setTimeout(() => { const a = document.activeElement; if (!a || !['INPUT', 'TEXTAREA'].includes(a.tagName)) { pendingSync = false; queueRender(); } }, 200); } });

// Re-render after server data arrives, without wiping what the user is typing
window.syncRender = () => {
  const a = document.activeElement;
  if (a && ['INPUT', 'TEXTAREA', 'SELECT'].includes(a.tagName) && a.value) { pendingSync = true; return; }
  queueRender();
};

window.addEventListener('DOMContentLoaded', async () => {
  Store.load();
  Store.on(queueRender);
  render();
  if (await Api.init()) { if (Api.demo) toast('🟢 Connected to the BrunoVerse server'); queueRender(); }
  else if (!Store.me) queueRender();
});

// Installable app (PWA): works on https or localhost
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
