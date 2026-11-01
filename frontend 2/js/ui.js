/* =========================================================
   UI helpers: layout shell, toast, modal, formatting
   ========================================================= */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function timeAgo(t) {
  const s = Math.max(1, Math.round((Date.now() - t) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60); if (m < 60) return m + 'm ago';
  const h = Math.round(m / 60); if (h < 24) return h + 'h ago';
  const d = Math.round(h / 24); if (d < 30) return d + 'd ago';
  return new Date(t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function daysUntil(d) { return Math.round((new Date(d).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / D); }
function dueText(d) { const n = daysUntil(d); if (n < 0) return `Overdue by ${-n} day${n === -1 ? '' : 's'}`; if (n === 0) return 'Due today'; if (n < 31) return `Due in ${n} day${n === 1 ? '' : 's'}`; const mo = Math.round(n / 30); return `Due in ${mo} month${mo > 1 ? 's' : ''}`; }
function ageText(dob) { if (!dob) return ''; const m = Math.floor((Date.now() - new Date(dob)) / (30.44 * D)); return m < 12 ? `${m} month${m === 1 ? '' : 's'}` : `${Math.floor(m / 12)} year${m >= 24 ? 's' : ''}`; }
function initials(n) { return (n || '?').replace(/^c:/, '').split(/\s+/).filter(w => /[A-Za-z]/.test(w[0])).slice(0, 2).map(w => w[0].toUpperCase()).join(''); }
function greeting() { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; }
function firstName(u) { return (u?.name || '').split(' ')[0]; }

function avatar(u, size = 40) {
  const name = typeof u === 'string' ? u : u?.name;
  const img = typeof u === 'object' && u?.avatar;
  if (img) return `<img class="avatar" style="width:${size}px;height:${size}px" ${mediaAttr(img)} alt="">`;
  const hue = [...(name || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return `<span class="avatar avatar-txt" style="width:${size}px;height:${size}px;font-size:${size * .38}px;background:hsl(${hue} 45% 88%);color:hsl(${hue} 40% 30%)">${initials(name)}</span>`;
}

// src for seeded URLs, data-media for IndexedDB files
function mediaAttr(ref) { if (!ref) return `src="${FALLBACK_IMG}"`; return ref.startsWith('media:') ? `data-media="${ref}" src="${FALLBACK_IMG}"` : `src="${esc(ref)}"`; }
const isVideoRef = ref => typeof ref === 'string' && (/\.(mp4|webm|mov|3gp|m4v)(\?|$)/i.test(ref) || (Media._cache[ref]?.type || '').startsWith('video'));
function mediaTag(ref, cls = '', controls = false) {
  if (ref && !ref.startsWith('media:') && isVideoRef(ref)) {
    const src = esc(Media._cache[ref]?.url || ref);
    return controls ? `<video class="${cls}" src="${src}" controls playsinline preload="metadata"></video>` : `<video class="${cls}" src="${src}" muted loop autoplay playsinline></video>`;
  }
  return `<img class="${cls}" ${mediaAttr(ref)} ${controls ? 'data-controls' : ''} loading="lazy" alt="">`;
}

/* ---------- Toast ---------- */
function toast(msg, type = 'ok') {
  const root = $('#toast-root'); if (!root) return;
  const el = document.createElement('div');
  el.className = 'toast toast-' + type; el.innerHTML = msg;
  root.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3800);
}

/* ---------- Modal ---------- */
function openModal(html, { wide = false, onClose } = {}) {
  const root = $('#modal-root');
  root.innerHTML = `<div class="modal-back"><div class="modal ${wide ? 'wide' : ''}" role="dialog"><button class="modal-x" aria-label="Close">${icon('x')}</button>${html}</div></div>`;
  const close = () => { root.innerHTML = ''; onClose && onClose(); };
  $('.modal-x', root).onclick = close;
  $('.modal-back', root).addEventListener('mousedown', e => { if (e.target.classList.contains('modal-back')) close(); });
  hydrateMedia(root);
  return { el: $('.modal', root), close };
}
// In-page replacements for confirm()/prompt() (blocked inside embedded viewers)
function askConfirm(msg, yesLabel, onYes) {
  const { el, close } = openModal(`<h2>Are you sure?</h2><p>${msg}</p><div class="form-actions"><button class="btn btn-ghost" id="cfNo">Cancel</button><button class="btn btn-primary" id="cfYes">${yesLabel}</button></div>`);
  $('#cfNo', el).onclick = close;
  $('#cfYes', el).onclick = () => { close(); onYes(); };
}
function askText(title, placeholder, onDone) {
  const { el, close } = openModal(`<h2>${title}</h2><form class="form" id="askForm"><input id="askIn" required placeholder="${placeholder}" autocomplete="off"><button class="btn btn-primary full">Post</button></form>`);
  setTimeout(() => $('#askIn', el)?.focus(), 30);
  $('#askForm', el).onsubmit = e => { e.preventDefault(); const v = $('#askIn', el).value.trim(); close(); if (v) onDone(v); };
}
function safeCopy(t) { try { navigator.clipboard?.writeText(t)?.catch(() => {}); } catch (e) {} }
function closeModal() { $('#modal-root').innerHTML = ''; }

function formData(form) { const o = {}; new FormData(form).forEach((v, k) => { o[k] = typeof v === 'string' ? v.trim() : v; }); return o; }

/* ---------- Navigation config ---------- */
const NAV = {
  owner: [
    ['home', 'Home', 'home'], ['pets', 'My Pets', 'paw'], ['report', 'Report Animal', 'megaphone'], ['help', 'Find Help', 'pin'],
    ['vet', 'Veterinary', 'steth'], ['ai', 'AI First Aid', 'sparkle'], ['reports', 'My Reports', 'file'], ['community', 'Community', 'users'],
    ['messages', 'Messages', 'msg'], ['opportunities', 'Every Rescue Matters', 'heart'], ['settings', 'Settings', 'settings'],
  ],
  rescuer: [
    ['home', 'Home', 'home'], ['cases', 'Nearby Cases', 'pin'], ['requests', 'Rescue Requests', 'alert'], ['rescues', 'My Rescues', 'paw'],
    ['directory', 'Vets & NGOs', 'hospital'], ['ai', 'AI First Aid', 'sparkle'], ['community', 'Community', 'users'], ['messages', 'Messages', 'msg'],
    ['opportunities', 'Opportunities', 'heart'], ['settings', 'Settings', 'settings'],
  ],
};
const isDemo = () => window.BRUNOVERSE_DEMO !== false && (typeof Api === 'undefined' || !Api.online || Api.demo);
const ROLE_LABEL = { owner: 'Pet Owner', rescuer: 'Rescuer', vet: 'Veterinarian', ngo: 'NGO / Shelter', feeder: 'Feeder / Volunteer' };
const isRescuerSide = u => ['rescuer', 'vet', 'ngo'].includes(u?.role);

const SIDE_QUOTES = {
  owner: ['Better care<br>for happier<br>animals', 'Kindness goes<br>a long way', 'Every paw<br>deserves love'],
  rescuer: ['Rescue<br>Rehabilitate<br>Reunite', 'Every life<br>matters', 'Be someone’s<br>miracle today'],
};

function shell(route, content) {
  const me = Store.me;
  const side = isRescuerSide(me) ? 'rescuer' : 'owner';
  const nav = NAV[side];
  const unreadN = Store.db.notifications.filter(n => n.userId === me.id && !n.read).length;
  const unreadM = unreadMessages(me.id);
  const q = SIDE_QUOTES[side][new Date().getDate() % 3];
  document.body.className = 'theme-' + side;
  return `
  <header class="topbar">
    <button class="icon-btn only-mobile" id="menuBtn" aria-label="Menu">${icon('menu')}</button>
    <a class="brand" href="#/home"><img src="assets/logo.svg" alt="" width="44" height="44"><span><b>BrunoVerse</b><small>Care • Connect • Create Change</small></span></a>
    <form class="search" id="globalSearch"><span>${icon('search', 18)}</span><input name="q" placeholder="${side === 'owner' ? 'Search for help, vets, NGOs…' : 'Search for cases, locations, NGOs…'}" autocomplete="off"></form>
    <div class="top-right">
      <span class="conn ${typeof Api !== 'undefined' && Api.online ? 'on' : ''}" title="${typeof Api !== 'undefined' && Api.online ? 'Connected to the BrunoVerse server – data is shared live' : 'Backend not running – data is saved in this browser only'}"><i></i>${typeof Api !== 'undefined' && Api.online ? 'Live' : 'Offline'}</span>
      <button class="icon-btn bell" id="bellBtn" aria-label="Notifications">${icon('bell', 22)}${unreadN ? `<i class="dot">${unreadN}</i>` : ''}</button>
      <button class="profile" id="profileBtn">${avatar(me, 42)}<span class="hide-sm"><b>${esc(me.name)}</b><small>${ROLE_LABEL[me.role]}</small></span>${icon('arrowR', 16, 'rot90')}</button>
    </div>
  </header>
  ${isDemo() ? `<div class="demo-banner">${icon('info', 16)} Demo mode – clinics, rescuers, cases and numbers shown are samples, not real people.</div>` : ''}
  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <nav>${(Api.admin ? [...nav, ['admin', 'Admin', 'shield']] : nav).map(([r, label, ic]) => `<a href="#/${r}" class="${route === r ? 'active' : ''}">${icon(ic, 20)}<span>${label}</span>${r === 'messages' && unreadM ? `<i class="pill-count">${unreadM}</i>` : ''}</a>`).join('')}</nav>
      <div class="side-art">
        <p class="hand">${q}</p>
        ${sideIllustration()}
      </div>
    </aside>
    <main class="main" id="main">${content}</main>
  </div>
  ${side === 'owner' && route !== 'report' ? `<a href="#/report" class="sos-fab" title="Report an animal in need">${icon('alert', 22)}<span>SOS</span></a>` : ''}
  <nav class="bottom-nav only-mobile">${nav.slice(0, 5).map(([r, label, ic]) => `<a href="#/${r}" class="${route === r ? 'active' : ''}">${icon(ic, 20)}<span>${label.split(' ')[0]}</span></a>`).join('')}</nav>`;
}

// Simple hand-drawn style line illustration (no AI imagery)
function sideIllustration() {
  return `<svg class="side-ill" viewBox="0 0 160 120" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 110h140" opacity=".35"/>
    <path d="M40 108c-6-18 0-38 14-46 4-10 2-22 8-26 4 4 4 10 6 14 8-2 14 2 18 8 10 4 14 16 10 28-2 8-2 16 2 22" />
    <circle cx="66" cy="50" r="1.6" fill="currentColor"/><path d="M76 58c-3 2-6 2-8 0"/>
    <path d="M98 108c-2-10 2-20 10-24 2-8 6-12 10-12l4-8 4 8c6 2 8 8 6 14 6 6 6 16 2 22"/>
    <circle cx="114" cy="80" r="1.3" fill="currentColor"/><circle cx="122" cy="80" r="1.3" fill="currentColor"/>
    <path d="M136 30c-4-6-12-2-8 4l8 8 8-8c4-6-4-10-8-4z" fill="#e8796b" stroke="#e8796b"/>
    <path d="M22 40c-3-4-9-1-6 3l6 6 6-6c3-4-3-7-6-3z" fill="#e8796b" stroke="#e8796b" opacity=".7"/>
  </svg>`;
}

function unreadMessages(uid) {
  return Store.db.threads.filter(t => t.members.includes(uid)).reduce((a, t) => a + t.msgs.filter(m => m.from !== uid && m.at > (t.read?.[uid] || 0)).length, 0);
}

function bindShell() {
  const me = Store.me;
  $('#menuBtn')?.addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $$('#sidebar a').forEach(a => a.addEventListener('click', () => $('#sidebar').classList.remove('open')));
  $('#globalSearch')?.addEventListener('submit', e => { e.preventDefault(); const q = e.target.q.value; location.hash = '#/search/' + encodeURIComponent(q); });
  $('#bellBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    const list = Store.db.notifications.filter(n => n.userId === me.id).slice(0, 8);
    togglePop('bell', `<div class="pop-head"><b>Notifications</b>${list.some(n => !n.read) ? '<button class="link" id="markAll">Mark all read</button>' : ''}</div>
      ${list.length ? list.map(n => `<a class="pop-item ${n.read ? '' : 'unread'}" href="${n.link}" data-nid="${n.id}">${icon('bell', 16)}<span>${esc(n.text)}<small>${timeAgo(n.at)}</small></span></a>`).join('') : '<p class="muted pad">No notifications yet 🐾</p>'}`, $('#bellBtn'));
    $('#markAll')?.addEventListener('click', ev => { ev.stopPropagation(); Store.db.notifications.forEach(n => { if (n.userId === me.id) n.read = true; }); Store.save(); });
    $$('.pop-item[data-nid]').forEach(a => a.addEventListener('click', () => { const n = Store.db.notifications.find(x => x.id === a.dataset.nid); if (n) { n.read = true; Store.save(false); } }));
  });
  $('#profileBtn')?.addEventListener('click', e => {
    e.stopPropagation();
    togglePop('profile', `<div class="pop-head">${avatar(me, 44)}<span><b>${esc(me.name)}</b><small>${esc(me.email || me.phone)}</small></span></div>
      <a class="pop-item" href="#/settings">${icon('settings', 16)}<span>Profile & settings</span></a>
      ${isDemo() ? `<button class="pop-item" id="switchRole">${icon('users', 16)}<span>Switch to ${isRescuerSide(me) ? 'Pet Owner' : 'Rescuer'} view</span></button>` : ''}
      ${Api.admin ? `<a class="pop-item" href="#/admin">${icon('shield', 16)}<span>Admin – verify organisations</span></a>` : ''}
      <button class="pop-item" id="logoutBtn">${icon('logout', 16)}<span>Log out</span></button>`, $('#profileBtn'));
    $('#logoutBtn').onclick = () => { Store.logout(); location.hash = '#/login'; render(); };
    $('#switchRole') && ($('#switchRole').onclick = () => {
      const target = isRescuerSide(me) ? 'u_anushka' : 'u_rohit';
      const mine = me.id === 'u_anushka' || me.id === 'u_rohit';
      if (mine) { demoLogin(target); return; }
      else { me.role = isRescuerSide(me) ? 'owner' : 'rescuer'; Store.save(false); toast('Account type changed to ' + ROLE_LABEL[me.role]); }
      location.hash = '#/home'; render();
    });
  });
}

function togglePop(kind, html, anchor) {
  const ex = $('.popover');
  if (ex) { const same = ex.dataset.kind === kind; ex.remove(); if (same) return; }
  const p = document.createElement('div');
  p.className = 'popover'; p.dataset.kind = kind; p.innerHTML = html;
  document.body.appendChild(p);
  const r = anchor.getBoundingClientRect();
  p.style.top = (r.bottom + window.scrollY + 8) + 'px';
  p.style.right = Math.max(12, window.innerWidth - r.right) + 'px';
  hydrateMedia(p);
}
document.addEventListener('click', e => { const p = $('.popover'); if (p && !p.contains(e.target)) p.remove(); });

/* ---------- Shared small components ---------- */
const STATUS = {
  reported: { label: 'Reported', ic: 'megaphone' },
  accepted: { label: 'Rescuer assigned', ic: 'hand' },
  on_the_way: { label: 'On the way', ic: 'truck' },
  reached: { label: 'Reached animal', ic: 'pin' },
  treatment: { label: 'Under treatment', ic: 'steth' },
  resolved: { label: 'Safe & resolved', ic: 'heart' },
};
const STATUS_ORDER = ['reported', 'accepted', 'on_the_way', 'reached', 'treatment', 'resolved'];
const NEED_CLASS = { 'Urgent': 'red', 'Medical Help': 'amber', 'Needs Shelter': 'amber', 'Food Needed': 'blue', 'Rescue Needed': 'red', 'Resolved': 'green' };

function needBadge(c) {
  const cls = c.status === 'resolved' ? 'green' : (NEED_CLASS[c.needs] || (c.urgency === 'critical' ? 'red' : 'amber'));
  return `<span class="tag tag-${cls}">${esc(c.status === 'resolved' ? 'Resolved' : c.needs)}</span>`;
}

function tracker(c) {
  const idx = STATUS_ORDER.indexOf(c.status);
  return `<div class="tracker">${STATUS_ORDER.map((s, i) => {
    const ev = c.timeline?.find(t => t.status === s);
    return `<div class="tstep ${i < idx ? 'done' : i === idx ? 'now' : ''}"><span class="tdot">${i <= idx ? icon(i < idx || s === 'resolved' ? 'check' : STATUS[s].ic, 14) : ''}</span><b>${STATUS[s].label}</b><small>${ev ? timeAgo(ev.at) : ''}</small></div>`;
  }).join('')}</div>`;
}

function emptyState(ic, title, text, action = '') {
  return `<div class="empty">${icon(ic, 36)}<h3>${title}</h3><p>${text}</p>${action}</div>`;
}

function sectionHead(title, link = '', linkText = 'View All') {
  return `<div class="sec-head"><h2>${title}</h2>${link ? `<a href="${link}" class="view-all">${linkText} ${icon('arrowR', 14)}</a>` : ''}</div>`;
}

const PLACE_META = {
  vet: { label: 'Veterinarian', ic: 'steth', color: 'green' },
  ngo: { label: 'NGO', ic: 'building', color: 'violet' },
  shelter: { label: 'Shelter', ic: 'home2', color: 'amber' },
  rescuer: { label: 'Rescuer', ic: 'hand', color: 'red' },
  feeder: { label: 'Feeder', ic: 'food', color: 'blue' },
};

// Directory = seeded places + real OSM places + registered users who help
function directory() {
  const helpers = Store.db.users.filter(u => ['rescuer', 'vet', 'ngo', 'feeder'].includes(u.role) && u.lat != null && u.id !== Store.me?.id)
    .map(u => ({ id: u.id, userId: u.id, type: u.role === 'ngo' ? 'ngo' : u.role, name: u.name + (u.role === 'rescuer' ? ' (Rescuer)' : ''), phone: u.phone, lat: u.lat, lng: u.lng, hours: u.available === false ? 'Off duty' : 'Available now', verified: !!u.verified, services: ROLE_LABEL[u.role] + ' on BrunoVerse', rating: 4.9, emergency: u.role === 'rescuer' }));
  return [...helpers, ...Store.db.places].map(p => ({ ...p, km: Geo.km(Geo.current(), p) })).sort((a, b) => a.km - b.km);
}

function placeRow(p, opts = {}) {
  const m = PLACE_META[p.type] || PLACE_META.vet;
  const tel = p.phone ? `<a class="btn btn-soft sm" href="tel:${p.phone.replace(/\s/g, '')}">${icon('phone', 15)} Call</a>` : '';
  return `<div class="place-row">
    <span class="place-ic c-${m.color}">${icon(m.ic, 20)}</span>
    <div class="grow"><b>${esc(p.name)} ${p.verified ? `<span class="verified" title="Verified">${icon('shield', 14)}</span>` : ''}</b>
      <small>${Geo.dist(p)} • ${m.label}${p.osm ? ' • OSM' : ''}${opts.full ? ` • ${esc(p.hours || '')}` : ''}</small>
      ${opts.full ? `<small class="muted">${esc(p.services || '')}${p.phone ? ' • ' + esc(p.phone) : ''}</small>` : ''}</div>
    <div class="row-actions">${opts.compact ? (p.type === 'vet' ? tel : `<a class="btn btn-soft sm" target="_blank" rel="noopener" href="${Geo.directions(p)}">${p.type === 'shelter' ? 'Get Directions' : 'Directions'}</a>`) : `${tel}<a class="btn btn-ghost sm" target="_blank" rel="noopener" href="${Geo.directions(p)}" title="Directions">${icon('nav', 15)}</a>${opts.message !== false ? `<button class="btn btn-ghost sm" data-chat="${esc(p.userId || 'c:' + p.name)}" title="Message">${icon('msg', 15)}</button>` : ''}`}</div>
  </div>`;
}

// Start/open a chat thread with a user id or contact ("c:Name")
function openChatWith(memberId, caseId) {
  const me = Store.me;
  let th = Store.db.threads.find(t => t.members.includes(me.id) && t.members.includes(memberId) && (!caseId || t.caseId === caseId));
  if (!th) {
    const u = Store.user(memberId);
    th = { id: uid('th'), members: [me.id, memberId], caseId, title: u ? u.name : memberId.replace(/^c:/, ''), msgs: [] };
    Store.db.threads.unshift(th); Store.save(false);
  }
  location.hash = '#/messages/' + th.id;
}
document.addEventListener('click', e => { const b = e.target.closest('[data-chat]'); if (b) { e.preventDefault(); openChatWith(b.dataset.chat); } });
