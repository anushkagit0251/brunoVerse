/* =========================================================
   Rescuer pages
   ========================================================= */
const ACTIVE = ['accepted', 'on_the_way', 'reached', 'treatment'];

function rescuerStats(me) {
  const mine = Store.db.cases.filter(c => c.rescuerId === me.id);
  const done = mine.filter(c => c.status === 'resolved').length;
  return {
    pending: Store.db.cases.filter(c => c.status === 'reported').length,
    active: mine.filter(c => ACTIVE.includes(c.status)).length,
    completed: (me.baseCompleted || 0) + done,
    helped: (me.baseHelped || 0) + done,
  };
}
const openCases = () => Store.db.cases.filter(c => c.status === 'reported')
  .map(c => ({ ...c, km: Geo.km(Geo.current(), c) }))
  .sort((a, b) => ({ critical: 0, urgent: 1, moderate: 2 }[a.urgency] - { critical: 0, urgent: 1, moderate: 2 }[b.urgency]) || a.km - b.km);

function caseRow(c, btn = 'View Details') {
  return `<div class="case-row">
    <a href="#/case/${c.id}">${mediaTag(c.media[0], 'thumb')}</a>
    <div class="grow"><div class="cr-top"><b>${esc(c.title)}</b>${needBadge(c)}</div>
      <small class="muted">${icon('pin', 13)} ${esc((c.address || 'GPS location').split(' — ')[0])} • ${Geo.dist(c)} • ${timeAgo(c.createdAt)}</small></div>
    <a class="btn btn-primary sm" href="#/case/${c.id}">${btn}</a>
  </div>`;
}

function rescuerHome() {
  const me = Store.me;
  const s = rescuerStats(me);
  const cases = openCases();
  const act = Store.db.activity.filter(a => a.userId === me.id).slice(0, 4);
  const threads = Store.db.threads.filter(t => t.members.includes(me.id)).sort((a, b) => (b.msgs.at(-1)?.at || 0) - (a.msgs.at(-1)?.at || 0)).slice(0, 3);
  const myActive = Store.db.cases.filter(c => c.rescuerId === me.id && ACTIVE.includes(c.status));
  return `
  <section class="hero hero-rescuer">
    <div class="hero-photo"><img src="${PHOTOS.heroRescuer}" alt=""></div>
    <div class="hero-text"><h1>${greeting()}, ${esc(firstName(me))}!</h1><p>Together we can save more lives ${icon('heart', 16, 'heart-ic')}</p>
      <label class="switch"><input type="checkbox" id="availToggle" ${me.available !== false ? 'checked' : ''}><span></span>${me.available !== false ? 'Available for rescues' : 'Off duty'}</label></div>
    <div class="hero-bubble hand">Every<br>life matters 🐾</div>
  </section>

  <section class="stats4">
    <a href="#/requests" class="stat c-pink"><span class="stat-ic red">${icon('alert', 26)}</span><div><small>Pending Cases</small><b>${s.pending}</b></div></a>
    <a href="#/rescues" class="stat c-mint"><span class="stat-ic green">${icon('paw', 26)}</span><div><small>Active Rescues</small><b>${s.active}</b></div></a>
    <a href="#/rescues" class="stat c-lav"><span class="stat-ic violet">${icon('checkCircle', 26)}</span><div><small>Completed</small><b>${s.completed}</b></div></a>
    <div class="stat c-blue"><span class="stat-ic blue">${icon('heart', 26)}</span><div><small>Total Animals Helped</small><b>${s.helped}</b></div></div>
  </section>

  ${myActive.length ? `<section class="card active-strip">${sectionHead('Your active rescues', '#/rescues')}${myActive.map(c => `<a class="track-item" href="#/case/${c.id}">${mediaTag(c.media[0], 'thumb')}<div class="grow"><b>${esc(c.title)}</b> ${needBadge(c)}<small class="muted">${STATUS[c.status].label} • ${Geo.dist(c)} • reported by ${esc(c.reporterName)}</small>${tracker(c)}</div></a>`).join('')}</section>` : ''}

  <div class="grid-3-2">
    <section class="card">
      ${sectionHead('Nearby Rescue Requests', '#/requests')}
      ${cases.length ? cases.slice(0, 4).map(c => caseRow(c)).join('') : emptyState('heart', 'No pending cases nearby', 'All animals around you are safe right now 💚')}
    </section>
    <div class="stack">
      <section class="card">
        <h2>Quick Actions</h2>
        <div class="qa-grid">
          <a href="#/report" class="qa c-pink">${icon('megaphone', 26)}<span>Report a Case</span></a>
          <a href="#/cases" class="qa c-mint">${icon('pin', 26)}<span>Find Nearby Help</span></a>
          <a href="#/directory?f=vet" class="qa c-lav">${icon('steth', 26)}<span>Contact Vet</span></a>
          <a href="#/directory?f=ngo" class="qa c-blue">${icon('building', 26)}<span>Connect with NGO</span></a>
        </div>
      </section>
      <section class="card p-map">
        <h2>Active Rescue Map</h2>
        <div class="map-box" id="rescMap"></div>
        <a href="#/cases" class="btn btn-primary sm map-btn">View Full Map ${icon('arrowR', 14)}</a>
      </section>
    </div>
  </div>

  <div class="grid-2">
    <section class="card">
      <h2>Recent Activity</h2>
      ${act.length ? `<div class="act-list">${act.map((a, i) => `<div class="act ${i === 0 ? 'first' : ''}"><span class="act-dot">${i === 0 ? icon('check', 12) : ''}</span><div><p>${esc(a.text)}</p><small>${timeAgo(a.at)}</small></div></div>`).join('')}</div>` : emptyState('activity', 'No activity yet', 'Accept your first rescue to get started.')}
    </section>
    <section class="card">
      ${sectionHead('Messages', '#/messages')}
      ${threads.map(t => { const last = t.msgs.at(-1); return `<a class="msg-row" href="#/messages/${t.id}">${avatar(threadTitle(t, me), 40)}<div class="grow"><b>${esc(threadTitle(t, me))}</b><small>${esc(last?.text || '').slice(0, 60)}</small><small class="muted">${last ? timeAgo(last.at) : ''}</small></div></a>`; }).join('') || emptyState('msg', 'No messages', '')}
    </section>
  </div>

  <section class="banner wide c-cream">
    <span class="banner-ic">${icon('hand', 30)}</span>
    <div><h3>Every rescue matters</h3><p>Report. Connect. Save.</p></div>
    <a href="#/opportunities" class="btn btn-primary">View Opportunities ${icon('arrowR', 14)}</a>
  </section>`;
}
function bindRescuerHome() {
  const me = Store.me;
  $('#availToggle').onchange = e => { me.available = e.target.checked; Store.addActivity(me.id, e.target.checked ? 'You are now available for rescues' : 'You went off duty', 'clock'); Store.save(); };
  Maps.make('rescMap', { zoom: 12, markers: Store.db.cases.filter(c => c.status !== 'resolved').map(c => ({ ...c, kind: c.status === 'reported' ? 'case' : 'rescuerLive', popup: `<b>${esc(c.title)}</b><br>${Geo.dist(c)}<br><a href="#/case/${c.id}">View details →</a>` })) });
}

/* ---------- Nearby cases (map) ---------- */
let caseFilter = { animal: 'All', radius: 25 };
function pageCases() {
  const list = openCases().filter(c => (caseFilter.animal === 'All' || c.animal === caseFilter.animal) && c.km <= caseFilter.radius);
  return `<div class="page-head"><div><h1>Nearby Cases</h1><p class="muted">${list.length} animal${list.length === 1 ? '' : 's'} waiting for help within ${caseFilter.radius} km.</p></div>
    <button class="btn btn-primary" id="gpsBtn">${icon('locate', 16)} Update my location</button></div>
  <div class="filters"><div class="chips">${['All', 'Dog', 'Cat', 'Cow', 'Bird', 'Other'].map(a => `<button class="chip ${caseFilter.animal === a ? 'on' : ''}" data-an="${a}">${a}</button>`).join('')}</div>
    <label class="inline">Radius <select id="radius">${[2, 5, 10, 25, 50].map(r => `<option ${caseFilter.radius === r ? 'selected' : ''} value="${r}">${r} km</option>`).join('')}</select></label></div>
  <div class="help-grid">
    <div class="card p0"><div class="map-box tall" id="casesMap"></div><div class="legend"><span><i style="background:${PIN_COLORS.case}"></i>Needs help</span><span><i style="background:${PIN_COLORS.vet}"></i>Vets</span><span><i style="background:${PIN_COLORS.me}"></i>You</span></div></div>
    <div class="card list-scroll">${list.length ? list.map(c => caseRow(c)).join('') : emptyState('heart', 'No cases in this area', 'Try a bigger radius.')}</div>
  </div>`;
}
function bindCases() {
  $$('[data-an]').forEach(b => b.onclick = () => { caseFilter.animal = b.dataset.an; render(); });
  $('#radius').onchange = e => { caseFilter.radius = +e.target.value; render(); };
  $('#gpsBtn').onclick = async () => { await Geo.locate(); render(); };
  const list = openCases().filter(c => (caseFilter.animal === 'All' || c.animal === caseFilter.animal) && c.km <= caseFilter.radius);
  const vets = directory().filter(p => p.type === 'vet').slice(0, 6);
  Maps.make('casesMap', { zoom: 12, markers: [...list.map(c => ({ ...c, kind: 'case', popup: `<b>${esc(c.title)}</b> – ${esc(c.needs)}<br>${Geo.dist(c)} • ${timeAgo(c.createdAt)}<br><a href="#/case/${c.id}">View details →</a>` })), ...vets.map(v => ({ ...v, kind: 'vet', popup: `<b>${esc(v.name)}</b><br>${Geo.dist(v)}` }))] });
}

/* ---------- Rescue requests ---------- */
function pageRequests() {
  const list = openCases();
  return `<div class="page-head"><div><h1>Rescue Requests</h1><p class="muted">Sorted by urgency, then distance. Accepting a case notifies the person who reported it.</p></div></div>
  ${list.length ? `<div class="req-grid">${list.map(c => `
    <article class="card req">
      <a href="#/case/${c.id}" class="req-img">${mediaTag(c.media[0], '')}${c.media.length > 1 ? `<span class="count">+${c.media.length - 1}</span>` : ''}<span class="badge lvl-${c.urgency}">${c.urgency}</span></a>
      <div class="req-body"><div class="cr-top"><b>${esc(c.title)}</b>${needBadge(c)}</div>
        <p class="small">${esc(c.description.slice(0, 110))}${c.description.length > 110 ? '…' : ''}</p>
        <small class="muted">${icon('pin', 13)} ${esc((c.address || '').split(' — ')[0] || 'GPS location')}</small>
        <div class="req-meta"><span>${icon('nav', 13)} ${Geo.dist(c)}</span><span>${icon('clock', 13)} ~${Geo.eta(c)}</span><span>${icon('users', 13)} ${esc(c.reporterName)}</span></div>
        <div class="req-act"><button class="btn btn-primary sm" data-accept="${c.id}">${icon('hand', 14)} Accept rescue</button><a class="btn btn-soft sm" href="#/case/${c.id}">Details</a><a class="btn btn-ghost sm" href="tel:${(c.reporterPhone || '').replace(/\s/g, '')}">${icon('phone', 14)}</a></div>
      </div>
    </article>`).join('')}</div>` : emptyState('heart', 'No pending requests', 'All clear for now. Thank you for being there 💚')}`;
}
function bindRequests() { $$('[data-accept]').forEach(b => b.onclick = () => acceptCase(b.dataset.accept)); }

async function acceptCase(id) {
  const me = Store.me; let c = Store.db.cases.find(x => x.id === id);
  if (!c || c.status !== 'reported') return toast('This case was already taken by another rescuer.', 'warn');
  if (Api.online) {
    // Server checks that nobody else accepted it first
    try { const sc = await Api.accept(id, me); Object.assign(c, sc); Api.snap.cases[id] = JSON.stringify(c); }
    catch (err) { toast(esc(err.message), 'warn'); return; }
  } else {
    c.status = 'accepted'; c.rescuerId = me.id; c.rescuerName = me.name; c.rescuerPhone = me.phone;
    c.timeline.push({ status: 'accepted', at: now(), note: `${me.name} accepted the rescue`, by: me.name });
  }
  Store.addActivity(me.id, `You accepted the case “${c.title}”`, 'hand');
  if (c.reporterId && !Api.online) Store.notify(c.reporterId, `💚 ${me.name} accepted your rescue request for “${c.title}”`, '#/case/' + c.id);
  let th = Store.db.threads.find(t => t.caseId === c.id && t.members.includes(me.id));
  if (!th && c.reporterId && Store.user(c.reporterId)) { th = { id: uid('th'), members: [me.id, c.reporterId], caseId: c.id, title: 'Rescue: ' + c.title, msgs: [{ from: me.id, text: `Hi! I’m ${firstName(me)}, I’ve accepted this rescue and will be there soon. Please stay nearby if it’s safe 🙏`, at: now() }] }; Store.db.threads.unshift(th); }
  Store.save();
  toast('Rescue accepted — thank you, hero 💚');
  location.hash = '#/case/' + c.id;
}

/* ---------- My rescues ---------- */
function pageRescues() {
  const me = Store.me;
  const mine = Store.db.cases.filter(c => c.rescuerId === me.id).sort((a, b) => b.createdAt - a.createdAt);
  const act = mine.filter(c => ACTIVE.includes(c.status)), done = mine.filter(c => c.status === 'resolved');
  return `<div class="page-head"><div><h1>My Rescues</h1><p class="muted">${act.length} active • ${rescuerStats(me).completed} completed. Every one of them is alive because of you.</p></div></div>
  <h2 class="mt">Active</h2>
  ${act.length ? act.map(c => `<a class="card case-track" href="#/case/${c.id}">${mediaTag(c.media[0], 'thumb lg')}<div class="grow"><div class="ct-top"><b>${esc(c.title)}</b>${needBadge(c)}<small class="muted">${Geo.dist(c)}</small></div><small class="muted">${icon('users', 13)} ${esc(c.reporterName)} • ${esc(c.reporterPhone || '')}</small>${tracker(c)}</div></a>`).join('') : emptyState('paw', 'No active rescues', 'Pick a case from Rescue Requests.', '<a href="#/requests" class="btn btn-primary">See requests</a>')}
  <h2 class="mt">Completed</h2>
  ${done.length ? `<div class="done-grid">${done.map(c => `<a class="card done" href="#/case/${c.id}">${mediaTag(c.media[0], '')}<b>${esc(c.title)}</b><small class="muted">${fmtDate(c.timeline.at(-1).at)}</small><span class="tag tag-green">${icon('heart', 12)} Safe</span></a>`).join('')}</div>` : '<p class="muted">Completed rescues will appear here.</p>'}`;
}

/* ---------- Vets & NGOs directory ---------- */
let dirFilter = 'all';
function pageDirectory(params) {
  if (params.get('f')) dirFilter = params.get('f');
  const list = directory().filter(p => dirFilter === 'all' || p.type === dirFilter);
  return `<div class="page-head"><div><h1>Vets & NGOs</h1><p class="muted">A verified network of people who care. Organisations can register with documents for verification.</p></div>
    <button class="btn btn-primary" id="regOrg">${icon('building', 16)} Register organisation</button></div>
  <div class="chips">${[['all', 'All'], ['vet', 'Veterinarians'], ['ngo', 'NGOs'], ['shelter', 'Shelters'], ['rescuer', 'Rescuers'], ['feeder', 'Feeders']].map(([k, l]) => `<button class="chip ${dirFilter === k ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}</div>
  <div class="dir-grid">${list.map(p => { const m = PLACE_META[p.type] || PLACE_META.vet; return `
    <article class="card dir">
      <div class="dir-top"><span class="place-ic c-${m.color}">${icon(m.ic, 22)}</span><div class="grow"><b>${esc(p.name)} ${p.verified ? `<span class="verified">${icon('shield', 14)} Verified</span>` : ''}</b><small class="muted">${m.label} • ${Geo.dist(p)}${p.rating ? ` • ★ ${p.rating}` : ''}</small></div>${p.emergency ? '<span class="tag tag-red">24×7</span>' : ''}</div>
      <p class="small">${esc(p.services || '')}</p><small class="muted">${icon('clock', 13)} ${esc(p.hours || '')}${p.phone ? ` • ${icon('phone', 13)} ${esc(p.phone)}` : ''}</small>
      <div class="req-act">${p.phone ? `<a class="btn btn-primary sm" href="tel:${p.phone.replace(/\s/g, '')}">${icon('phone', 14)} Call</a>` : ''}<button class="btn btn-soft sm" data-chat="${esc(p.userId || 'c:' + p.name)}">${icon('msg', 14)} Message</button><a class="btn btn-ghost sm" target="_blank" rel="noopener" href="${Geo.directions(p)}">${icon('nav', 14)} Directions</a></div>
    </article>`; }).join('')}</div>`;
}
function bindDirectory() {
  $$('[data-f]').forEach(b => b.onclick = () => { dirFilter = b.dataset.f; location.hash = '#/directory'; render(); });
  $('#regOrg').onclick = () => {
    const { el, close } = openModal(`<h2>Register your organisation</h2><p class="muted">Clinics, NGOs, shelters & rescue groups. We verify documents before showing the ✓ badge.</p>
      <form class="form" id="orgForm"><div class="grid2"><label>Name<input name="name" required></label><label>Type<select name="type"><option value="vet">Veterinary clinic</option><option value="ngo">NGO</option><option value="shelter">Shelter</option><option value="rescuer">Rescue group</option><option value="feeder">Feeding group</option></select></label></div>
      <div class="grid2"><label>Phone<input name="phone" required></label><label>Hours<input name="hours" placeholder="9 AM – 9 PM"></label></div>
      <label>Services<input name="services" placeholder="Rescue, OPD, Shelter…"></label>
      <label>Registration document / licence<input type="file" name="doc" accept="image/*,application/pdf"></label>
      <label class="check"><input type="checkbox" name="emergency"> We handle emergencies 24×7</label>
      <p class="muted small">Your current GPS location will be used as the address pin.</p>
      <button class="btn btn-primary full">Submit for verification</button></form>`);
    $('#orgForm', el).onsubmit = async e => {
      e.preventDefault(); const f = formData(e.target); const l = await Geo.locate({ silent: true });
      Store.db.places.push({ id: uid('p'), type: f.type, name: f.name, phone: f.phone, hours: f.hours, services: f.services, emergency: !!f.emergency, lat: l.lat, lng: l.lng, verified: false, rating: null });
      Store.save(); close(); toast('Submitted! Listed now — verification badge after document review.');
    };
  };
}
