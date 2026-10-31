/* =========================================================
   Shared pages: case detail, AI first aid, community, messages,
   opportunities, settings, search
   ========================================================= */

/* ---------- Case detail (both roles) ---------- */
let liveWatch = null, simTimer = null;
function pageCase(id) {
  const c = Store.db.cases.find(x => x.id === id);
  if (!c) return emptyState('search', 'Case not found', '', '<a class="btn btn-primary" href="#/home">Go home</a>');
  const me = Store.me;
  const isReporter = c.reporterId === me.id, isMine = c.rescuerId === me.id;
  const canAccept = isRescuerSide(me) && c.status === 'reported';
  const tr = AI.triage(c.description + ' ' + c.title, (c.condition || []).map(x => COND_TEXT[x] || x));
  const rLoc = rescuerLoc(c);
  const shareTxt = `🚨 Animal needs help (${c.title}) – ${c.description}\n📍 ${c.address || ''}\n${Geo.mapsLink(c)}\nReported on BrunoVerse. Contact: ${c.reporterName} ${c.reporterPhone || ''}`;
  return `
  <a class="back" href="${isRescuerSide(me) ? '#/requests' : '#/reports'}">${icon('arrowL', 16)} Back</a>
  <div class="case-grid">
    <div class="stack">
      <section class="card p0 gallery">
        <div class="gal-main" id="galMain">${c.media.length ? mediaTag(c.media[0], 'gal-big', true) : `<div class="gal-empty">${icon('camera', 30)}<p>No photos yet</p></div>`}</div>
        ${c.media.length > 1 ? `<div class="gal-thumbs">${c.media.map((m, i) => `<button data-gi="${i}">${mediaTag(m, '')}</button>`).join('')}</div>` : ''}
      </section>
      <section class="card">
        <div class="ct-top"><h1 class="h-case">${esc(c.title)}</h1>${needBadge(c)}<span class="badge lvl-${c.urgency}">${c.urgency}</span></div>
        <p class="muted">${icon('pin', 14)} ${esc(c.address || 'Shared GPS location')} • <b>${Geo.dist(c)}</b> from you • ${timeAgo(c.createdAt)}</p>
        <p>${esc(c.description)}</p>
        ${(c.condition || []).length ? `<div class="chips static">${c.condition.map(x => `<span class="chip on">${esc(x)}</span>`).join('')}</div>` : ''}
        <div class="ai-summary">${icon('sparkle', 16)} <span><b>AI triage:</b> ${esc(c.aiSummary || AI.summary(c))}</span></div>
        <div class="reporter">${avatar(c.reporterName, 36)}<div class="grow"><b>${esc(c.reporterName)}</b><small class="muted">Reported this case</small></div>
          ${!isReporter && c.reporterPhone ? `<a class="btn btn-soft sm" href="tel:${c.reporterPhone.replace(/\s/g, '')}">${icon('phone', 14)} Call</a>` : ''}
          ${!isReporter && c.reporterId && Store.user(c.reporterId) ? `<button class="btn btn-ghost sm" data-chat="${c.reporterId}">${icon('msg', 14)}</button>` : ''}</div>
      </section>
      <section class="card">
        <h2>Updates</h2>
        <div class="timeline">${[...c.timeline.map(t => ({ ...t, kind: 'status' })), ...(c.updates || []).map(u => ({ ...u, kind: 'upd' }))].sort((a, b) => b.at - a.at).map(t => `
          <div class="tl-item"><span class="tl-dot ${t.kind === 'status' ? 'st' : ''}"></span><div class="tl-body"><div class="tl-top"><b>${t.kind === 'status' ? STATUS[t.status].label : esc(t.by)}</b><small class="muted">${timeAgo(t.at)}</small></div>
          <p>${esc(t.note || t.text || '')}</p>${t.media ? `<div class="rec-file">${mediaTag(t.media, 'rec-img', true)}</div>` : ''}</div></div>`).join('')}</div>
        ${isReporter || isMine || isRescuerSide(me) ? `<form class="upd-form" id="updForm"><input name="text" placeholder="Add an update (e.g. gave water, dog is calmer)…" required>
          <label class="icon-btn" title="Add photo/video">${icon('camera', 18)}<input type="file" name="file" accept="image/*,video/*" capture="environment" hidden></label><button class="btn btn-primary sm">${icon('send', 14)}</button></form>` : ''}
      </section>
    </div>

    <div class="stack">
      <section class="card">
        <div class="sec-head"><h2>Rescue status</h2><span class="tag tag-${c.status === 'resolved' ? 'green' : c.status === 'reported' ? 'red' : 'amber'}">${STATUS[c.status].label}</span></div>
        ${tracker(c)}
        ${c.rescuerName ? `<div class="reporter">${avatar(c.rescuerName, 40)}<div class="grow"><b>${esc(c.rescuerName)}</b><small class="muted">Rescuer${rLoc && c.status !== 'resolved' ? ` • ${Geo.km(rLoc, c) < 0.05 ? 'at the location' : `${Geo.km(rLoc, c).toFixed(1)} km away (~${Math.max(1, Math.round(Geo.km(rLoc, c) / 20 * 60))} min)`}` : ''}</small></div>
          ${!isMine && c.rescuerPhone ? `<a class="btn btn-primary sm" href="tel:${c.rescuerPhone.replace(/\s/g, '')}">${icon('phone', 14)} Call</a>` : ''}${!isMine && c.rescuerId ? `<button class="btn btn-ghost sm" data-chat="${c.rescuerId}">${icon('msg', 14)}</button>` : ''}</div>` : ''}
        ${canAccept ? `<button class="btn btn-primary full big" id="acceptBtn">${icon('hand', 18)} Accept this rescue</button>` : ''}
        ${isMine && c.status !== 'resolved' ? rescuerActions(c) : ''}
        ${isReporter && c.status === 'reported' ? `<div class="waiting"><span class="pulse"></span><p><b>Alert sent to rescuers near you.</b><br><small>You can also call them directly below — every minute counts.</small></p></div>` : ''}
        ${c.status === 'resolved' ? `<div class="happy">${icon('heart', 22)}<p><b>This animal is safe now.</b><br><small>Thank you for caring. You made a difference today 💚</small></p></div>` : ''}
      </section>

      <section class="card p0"><div class="map-box" id="caseMap"></div>
        <div class="map-foot"><a class="btn btn-soft sm" target="_blank" rel="noopener" href="${Geo.directions(c)}">${icon('nav', 14)} Directions</a>
        <a class="btn btn-soft sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(shareTxt)}">${icon('whatsapp', 14)} Share on WhatsApp</a>
        <button class="btn btn-ghost sm" id="copyLink">${icon('share', 14)} Copy</button></div></section>

      ${isReporter && c.status !== 'resolved' ? `<section class="card"><h2>Nearest rescuers & NGOs</h2>${nearestHelpers(4).map(p => placeRow(p, { message: !!p.userId })).join('')}</section>` : ''}

      ${c.status !== 'resolved' && tr.topics.length ? `<section class="card"><h2>${icon('sparkle', 18)} What to do right now</h2>${firstAidCard(tr.topics[0], !isReporter)}<a href="#/ai" class="link small">Ask the AI assistant more →</a></section>` : ''}
    </div>
  </div>`;
}

function rescuerLoc(c) {
  if (c.rescuerLoc) return c.rescuerLoc;
  const u = c.rescuerId && Store.user(c.rescuerId);
  return u && u.lat != null ? { lat: u.lat, lng: u.lng } : null;
}

function rescuerActions(c) {
  const next = { accepted: ['on_the_way', 'I’m on the way', 'truck'], on_the_way: ['reached', 'Reached the animal', 'pin'], reached: ['treatment', 'Taken for treatment', 'steth'], treatment: ['resolved', 'Mark safe & resolved', 'heart'] }[c.status];
  return `<div class="resc-actions">
    <button class="btn btn-primary full" data-next="${next[0]}">${icon(next[2], 16)} ${next[1]}</button>
    ${c.status === 'reached' ? `<button class="btn btn-soft full" data-next="resolved">${icon('heart', 16)} Treated on the spot – resolved</button>` : ''}
    <label class="switch"><input type="checkbox" id="liveLoc" ${liveWatch ? 'checked' : ''}><span></span>Share my live location with reporter</label>
    ${['accepted', 'on_the_way'].includes(c.status) ? `<button class="link small" id="simBtn">▶ Simulate journey (demo)</button>` : ''}
    <button class="link small red" id="dropBtn">Can’t make it? Release case</button>
  </div>`;
}

function setStatus(c, st, note) {
  const me = Store.me;
  c.status = st;
  const notes = { on_the_way: `${firstName(me)} is on the way`, reached: `${firstName(me)} has reached the animal`, treatment: 'Animal taken for treatment', resolved: 'Animal is safe 💚' };
  c.timeline.push({ status: st, at: now(), note: note || notes[st], by: me.name });
  if (st === 'resolved') { c.needs = 'Resolved'; Store.addActivity(me.id, `You marked the case “${c.title}” as resolved`, 'check'); stopLive(); }
  else Store.addActivity(me.id, `You updated the status for “${c.title}”`, 'edit');
  if (c.reporterId) Store.notify(c.reporterId, `${STATUS[st].label}: ${notes[st]} (“${c.title}”)`, '#/case/' + c.id);
  Store.save();
}
function stopLive() { if (liveWatch != null) { navigator.geolocation?.clearWatch(liveWatch); liveWatch = null; } clearInterval(simTimer); simTimer = null; }

function bindCase(id) {
  const c = Store.db.cases.find(x => x.id === id); if (!c) return;
  const me = Store.me;
  $$('[data-gi]').forEach(b => b.onclick = () => { $('#galMain').innerHTML = mediaTag(c.media[+b.dataset.gi], 'gal-big', true); hydrateMedia($('#galMain')); });
  $('#acceptBtn')?.addEventListener('click', () => acceptCase(c.id));
  $$('[data-next]').forEach(b => b.onclick = () => {
    const st = b.dataset.next;
    if (st === 'treatment') {
      const vets = directory().filter(p => p.type === 'vet' || p.type === 'shelter').slice(0, 6);
      const { el, close } = openModal(`<h2>Where are you taking the animal?</h2><form class="form" id="trForm"><label>Clinic / shelter<select name="vet">${vets.map(v => `<option>${esc(v.name)}</option>`).join('')}</select></label><label>Note<input name="note" placeholder="e.g. X-ray needed"></label><button class="btn btn-primary full">Update</button></form>`);
      $('#trForm', el).onsubmit = e => { e.preventDefault(); const f = formData(e.target); setStatus(c, 'treatment', `Taken to ${f.vet}${f.note ? ' – ' + f.note : ''}`); close(); };
      return;
    }
    if (st === 'resolved') {
      const { el, close } = openModal(`<h2>Mark as safe 💚</h2><form class="form" id="rsForm"><label>Outcome<select name="o"><option>Treated and released back safely</option><option>Moved to shelter</option><option>Adopted / fostered</option><option>Reunited with owner</option><option>Under long-term care</option></select></label><label>Note for the reporter<input name="note" placeholder="Thank you for reporting!"></label><button class="btn btn-primary full">Complete rescue</button></form>`);
      $('#rsForm', el).onsubmit = e => { e.preventDefault(); const f = formData(e.target); setStatus(c, 'resolved', f.o + (f.note ? '. ' + f.note : '')); close(); celebrate(); };
      return;
    }
    if (st === 'on_the_way' && !liveWatch) startLive(c);
    setStatus(c, st);
  });
  $('#liveLoc')?.addEventListener('change', e => { if (e.target.checked) startLive(c); else { stopLive(); toast('Live location sharing stopped'); } });
  $('#simBtn')?.addEventListener('click', () => simulate(c));
  $('#dropBtn')?.addEventListener('click', () => askConfirm('Release this case so another rescuer can take it?', 'Release case', () => {
    c.status = 'reported'; c.rescuerId = null; c.rescuerName = null; c.rescuerPhone = null; c.rescuerLoc = null; c.timeline = c.timeline.filter(t => t.status === 'reported');
    c.timeline.push({ status: 'reported', at: now(), note: 'Rescuer released the case — looking for another rescuer', by: me.name });
    if (c.reporterId) Store.notify(c.reporterId, `Your case “${c.title}” is looking for a new rescuer`, '#/case/' + c.id);
    stopLive(); Store.save();
  }));
  $('#copyLink')?.addEventListener('click', () => { safeCopy(`${c.title} – ${c.address}\n${Geo.mapsLink(c)}`); toast('Location copied'); });
  $('#updForm')?.addEventListener('submit', async e => {
    e.preventDefault(); const f = formData(e.target); const file = e.target.file.files[0];
    const media = file ? await Media.put(file) : '';
    c.updates = c.updates || []; c.updates.push({ by: me.name, text: f.text, media, at: now() });
    if (media) c.media.push(media);
    const other = c.reporterId === me.id ? c.rescuerId : c.reporterId;
    if (other) Store.notify(other, `New update on “${c.title}”: ${f.text}`, '#/case/' + c.id);
    Store.save();
  });
  // map
  const rl = rescuerLoc(c);
  const markers = [{ ...c, kind: c.status === 'resolved' ? 'caseDone' : 'case', popup: `<b>${esc(c.title)}</b>` }];
  if (rl && c.status !== 'resolved' && c.rescuerId) markers.push({ ...rl, kind: 'rescuerLive', label: 'R', popup: `${esc(c.rescuerName)} (rescuer)` });
  const m = Maps.make('caseMap', { zoom: 14, markers });
  if (m && rl && c.rescuerId && c.status !== 'resolved') L.polyline([[rl.lat, rl.lng], [c.lat, c.lng]], { color: '#1f5135', dashArray: '6 8', weight: 3 }).addTo(m);
}

function startLive(c) {
  if (!('geolocation' in navigator)) return toast('GPS not available on this device', 'warn');
  let last = 0;
  liveWatch = Geo.watch(p => { if (Date.now() - last < 8000) return; last = Date.now(); c.rescuerLoc = { ...p, at: now() }; Store.save(false); localStorage.setItem(DB_KEY, JSON.stringify(Store.db)); });
  toast('📡 Sharing your live location with the reporter');
}

// Demo helper: moves the rescuer pin towards the case so judges can see live tracking
function simulate(c) {
  clearInterval(simTimer);
  const start = rescuerLoc(c) || { lat: c.lat + 0.02, lng: c.lng - 0.02 };
  if (c.status === 'accepted') setStatus(c, 'on_the_way');
  let i = 0; const N = 12;
  toast('Simulating the rescuer’s journey… watch the reporter’s screen 👀');
  simTimer = setInterval(() => {
    i++;
    const cc = Store.db.cases.find(x => x.id === c.id); if (!cc) return clearInterval(simTimer);
    cc.rescuerLoc = { lat: start.lat + (cc.lat - start.lat) * i / N, lng: start.lng + (cc.lng - start.lng) * i / N, at: now() };
    if (i >= N) { clearInterval(simTimer); simTimer = null; setStatus(cc, 'reached'); return; }
    Store.save();
  }, 2500);
}

function celebrate() {
  const root = $('#toast-root'); const el = document.createElement('div'); el.className = 'celebrate';
  el.innerHTML = '<div class="cel-card"><div class="cel-emoji">🐾💚</div><h2>Another life saved!</h2><p>Thank you for being someone’s hero today.</p></div>';
  root.appendChild(el); for (let i = 0; i < 24; i++) { const s = document.createElement('i'); s.className = 'conf'; s.style.left = Math.random() * 100 + '%'; s.style.animationDelay = Math.random() * .6 + 's'; s.style.background = ['#e8796b', '#2c6a47', '#f2c14e', '#7a5bc4', '#3b8bc4'][i % 5]; el.appendChild(s); }
  setTimeout(() => el.remove(), 3200);
}

/* ---------- AI First Aid chat ---------- */
const aiChat = [];
function pageAI() {
  const me = Store.me;
  const pets = Store.db.pets.filter(p => p.ownerId === me.id);
  return `<div class="page-head"><div><h1>${icon('sparkle', 26)} BrunoVerse AI – First Aid</h1><p class="muted">Quick, safe steps while help is on the way. Type in English, Hindi or Hinglish.</p></div></div>
  <div class="ai-grid">
    <section class="card chat-card">
      <div class="chat" id="chat">
        <div class="bubble bot"><div class="ai-card"><p>Hi ${esc(firstName(me))} 💛 I’m your first-aid buddy. Tell me what happened — for example <i>“dog ka pair se khoon aa raha hai”</i> or <i>“cat hit by bike”</i>.</p><p class="muted small">I give emergency guidance only — always get the animal to a vet.</p></div></div>
        ${aiChat.map(m => `<div class="bubble ${m.who}">${m.who === 'me' ? esc(m.html) : m.html}</div>`).join('')}
      </div>
      <div class="quick">${FIRST_AID.slice(0, 10).map(f => `<button class="chip" data-q="${esc(f.title)}">${f.emoji} ${esc(f.title.split(' /')[0])}</button>`).join('')}</div>
      <form class="chat-in" id="aiForm">
        ${pets.length ? `<select id="aiPet" title="About which pet?"><option value="">Any animal</option>${pets.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select>` : ''}
        <input id="aiText" placeholder="Describe the emergency…" autocomplete="off"><button type="button" class="icon-btn" id="aiMic" title="Speak">${icon('mic', 18)}</button><button class="btn btn-primary">${icon('send', 16)}</button>
      </form>
    </section>
    <aside class="stack">
      <section class="card"><h2>Emergency guides</h2><div class="guide-list">${FIRST_AID.map(f => `<button class="guide-item" data-g="${f.id}"><span>${f.emoji}</span><b>${f.title}</b><span class="badge lvl-${f.level}">${f.level}</span></button>`).join('')}</div></section>
      <section class="card c-pink-soft"><h3>${icon('alert', 18)} In a serious emergency</h3><p class="small">Don’t wait for the chat — report the case so rescuers nearby are alerted with your GPS location.</p><a href="#/report" class="btn btn-danger sm">Report now</a></section>
      <p class="muted small">${Store.db.settings.aiKey ? '✨ Online AI (Gemini) is connected.' : 'Running offline first-aid engine. Add a Gemini API key in Settings for free-form AI answers.'}</p>
    </aside>
  </div>`;
}
function bindAI() {
  const chat = $('#chat'); chat.scrollTop = chat.scrollHeight;
  const ask = async text => {
    if (!text) return;
    aiChat.push({ who: 'me', html: text });
    chat.insertAdjacentHTML('beforeend', `<div class="bubble me">${esc(text)}</div><div class="bubble bot typing" id="typing"><span></span><span></span><span></span></div>`);
    chat.scrollTop = chat.scrollHeight;
    const pid = $('#aiPet')?.value; const pet = Store.db.pets.find(p => p.id === pid);
    const html = await AI.answer(text, { pet: pet ? `${pet.name}, ${pet.species} ${pet.breed}, ${ageText(pet.dob)}, ${pet.weight} kg. Notes: ${pet.notes}` : '' });
    await new Promise(r => setTimeout(r, 450));
    aiChat.push({ who: 'bot', html });
    $('#typing')?.remove();
    chat.insertAdjacentHTML('beforeend', `<div class="bubble bot">${html}</div>`);
    chat.scrollTop = chat.scrollHeight;
  };
  $('#aiForm').onsubmit = e => { e.preventDefault(); const t = $('#aiText').value.trim(); $('#aiText').value = ''; ask(t); };
  $$('[data-q]').forEach(b => b.onclick = () => ask(b.dataset.q));
  $$('[data-g]').forEach(b => b.onclick = () => { const f = FIRST_AID.find(x => x.id === b.dataset.g); openModal(firstAidCard(f), { wide: false }); });
  $('#aiMic').onclick = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return toast('Voice input not supported here (try Chrome).', 'warn');
    const r = new SR(); r.lang = 'en-IN'; $('#aiMic').classList.add('rec');
    r.onresult = ev => ask(ev.results[0][0].transcript); r.onend = () => $('#aiMic')?.classList.remove('rec'); r.start();
  };
}

/* ---------- Community ---------- */
const GUIDES = [
  { t: 'Safe & unsafe foods', e: '🍽️', b: ['<b>Safe for dogs:</b> rice, curd, boiled egg, boiled chicken, pumpkin, carrots, roti (plain).', '<b>Safe for cats:</b> boiled fish (no bones), boiled chicken, cat food. Fresh water always.', '<b>Never give:</b> chocolate, grapes/raisins, onion, garlic, xylitol (sugar-free gum), alcohol, cooked bones, very spicy/salty food.', 'Cow’s milk often upsets the stomach of adult dogs & cats — water is best.'] },
  { t: 'Feeding street animals responsibly', e: '🍚', b: ['Feed at a fixed spot and time, away from busy roads and building entrances.', 'Use clean bowls and pick up leftovers so the area stays clean (keeps neighbours friendly too).', 'Keep a water bowl out — especially in summer.', 'Coordinate with local feeders on BrunoVerse so no area is missed.'] },
  { t: 'Puppy & kitten vaccination', e: '💉', b: ['<b>Puppies:</b> 6–8 wks DHPPi • 9–12 wks DHPPi + Lepto • 12–16 wks Rabies • yearly boosters.', '<b>Kittens:</b> 8–9 wks FVRCP • 12 wks FVRCP booster • 12–16 wks Rabies • yearly boosters.', 'Deworm every 3 months. Follow your vet’s schedule — it can vary.'] },
  { t: 'Summer heat care', e: '☀️', b: ['Keep water bowls filled in shade outside your home.', 'Walk pets early morning / late evening — hot roads burn paws (test with the back of your hand for 5 sec).', 'Never leave a pet in a parked car.', 'Signs of heatstroke: heavy panting, drooling, collapse — see AI First Aid.'] },
  { t: 'Monsoon care', e: '🌧️', b: ['Dry paws and ears after walks to prevent fungal infection.', 'Check daily for ticks — tick fever is common in monsoon.', 'Keep a dry corner for street animals near your building if you can.'] },
  { t: 'Diwali & festivals', e: '🪔', b: ['Crackers terrify animals — keep pets indoors with windows closed and soft music on.', 'Never tie crackers or colours to animals; report cruelty.', 'Use natural/dry colours on Holi — chemical colours are toxic if licked.'] },
  { t: 'How to approach a scared stray', e: '🤲', b: ['Move slowly, crouch sideways, avoid staring.', 'Let it sniff your closed hand; offer food from a distance.', 'Use a towel/blanket to lift small animals; never grab the neck.', 'If bitten: wash 15 min with soap & water and get the anti-rabies vaccine.'] },
];
let commTab = 'feed';
function pageCommunity() {
  const posts = Store.db.posts;
  return `<div class="page-head"><div><h1>Community</h1><p class="muted">Feeders, rescuers, vets and animal lovers — learning and helping together.</p></div></div>
  <div class="tabs line"><button data-ct="feed" class="${commTab === 'feed' ? 'on' : ''}">Feed</button><button data-ct="guides" class="${commTab === 'guides' ? 'on' : ''}">Care & Feeding Guides</button></div>
  ${commTab === 'feed' ? `
  <form class="card new-post" id="postForm">${avatar(Store.me, 42)}
    <div class="grow"><textarea name="text" rows="2" placeholder="Share a rescue story, ask for help or post an adoption…" required></textarea>
    <div class="np-foot"><select name="tag">${['Story', 'Rescue Needed', 'Medical Help', 'Feeding', 'Adoption', 'Lost & Found'].map(t => `<option>${t}</option>`).join('')}</select>
    <label class="btn btn-ghost sm">${icon('camera', 15)} Photo<input type="file" name="image" accept="image/*" hidden></label><span class="muted small" id="imgName"></span><button class="btn btn-primary sm">Post</button></div></div>
  </form>
  <div class="feed">${posts.map(p => `
    <article class="card post">
      <div class="post-head">${avatar(p.author, 40)}<div><b>${esc(p.author)}</b><small class="muted">${timeAgo(p.at)}</small></div>${postMini(p).match(/<span class="tag[^>]*>.*?<\/span>/)[0]}</div>
      <p>${esc(p.text)}</p>${p.image ? mediaTag(p.image, 'post-img') : ''}
      <div class="post-foot"><button class="link ${p.liked ? 'liked' : ''}" data-like="${p.id}">${icon('heart', 16)} ${p.likes}</button><button class="link" data-cm="${p.id}">${icon('msg', 16)} ${(p.comments || 0) + (p.cmts?.length || 0)}</button></div>
      ${p.cmts?.length ? `<div class="cmts">${p.cmts.map(c => `<p><b>${esc(c.by)}</b> ${esc(c.text)}</p>`).join('')}</div>` : ''}
    </article>`).join('')}</div>`
  : `<div class="guides">${GUIDES.map(g => `<details class="card guide"><summary><span class="g-emoji">${g.e}</span><b>${g.t}</b>${icon('arrowR', 16, 'rot90')}</summary><ul>${g.b.map(x => `<li>${x}</li>`).join('')}</ul></details>`).join('')}
    <p class="muted small">Guides are educational and reviewed by community vets; they don’t replace a professional check-up.</p></div>`}`;
}
function bindCommunity() {
  $$('[data-ct]').forEach(b => b.onclick = () => { commTab = b.dataset.ct; render(); });
  const f = $('#postForm'); if (!f) return;
  f.image.onchange = () => { $('#imgName').textContent = f.image.files[0]?.name || ''; };
  f.onsubmit = async e => {
    e.preventDefault(); const d = formData(f); const file = f.image.files[0];
    Store.db.posts.unshift({ id: uid('po'), author: Store.me.name, authorId: Store.me.id, text: d.text, tag: d.tag, image: file ? await Media.put(file) : '', at: now(), likes: 0, comments: 0, cmts: [] });
    Store.save(); toast('Posted to the community 💛');
  };
  $$('[data-like]').forEach(b => b.onclick = () => { const p = Store.db.posts.find(x => x.id === b.dataset.like); p.liked = !p.liked; p.likes += p.liked ? 1 : -1; Store.save(); });
  $$('[data-cm]').forEach(b => b.onclick = () => {
    const p = Store.db.posts.find(x => x.id === b.dataset.cm);
    askText('Write a comment', 'Say something kind…', t => { p.cmts = p.cmts || []; p.cmts.push({ by: Store.me.name, text: t }); Store.save(); });
  });
}

/* ---------- Messages ---------- */
function threadTitle(t, me) {
  const other = t.members.find(m => m !== me.id);
  if (!other) return t.title;
  if (other.startsWith('c:')) return other.slice(2);
  return Store.user(other)?.name || t.title;
}
const AUTO_REPLIES = ['Thank you for reaching out 🙏 We’ll get back to you shortly.', 'Noted! Can you share a photo or the exact location?', 'We have a volunteer nearby, sending them your way.', 'Please keep the animal in shade and give some water if it can drink.', 'Sure, happy to help 💚'];
function pageMessages(tid) {
  const me = Store.me;
  const threads = Store.db.threads.filter(t => t.members.includes(me.id)).sort((a, b) => (b.msgs.at(-1)?.at || 0) - (a.msgs.at(-1)?.at || 0));
  const th = threads.find(t => t.id === tid) || (window.innerWidth > 800 ? threads[0] : null);
  if (th) { th.read = th.read || {}; th.read[me.id] = now(); Store.save(false); }
  return `<div class="page-head"><div><h1>Messages</h1></div></div>
  <div class="msg-layout ${tid ? 'has-open' : ''}">
    <aside class="card thread-list">${threads.length ? threads.map(t => { const last = t.msgs.at(-1); const unread = t.msgs.filter(m => m.from !== me.id && m.at > (t.read?.[me.id] || 0)).length; return `
      <a class="msg-row ${th && t.id === th.id ? 'on' : ''}" href="#/messages/${t.id}">${avatar(threadTitle(t, me), 42)}<div class="grow"><b>${esc(threadTitle(t, me))}</b>${t.caseId ? '<span class="tag tag-red mini">Rescue</span>' : ''}<small>${esc((last?.text || 'Say hi 👋').slice(0, 48))}</small></div><div class="msg-meta"><small class="muted">${last ? timeAgo(last.at) : ''}</small>${unread ? `<i class="pill-count">${unread}</i>` : ''}</div></a>`; }).join('') : emptyState('msg', 'No conversations', 'Message a vet, NGO or rescuer from Find Help.')}</aside>
    <section class="card convo">${th ? `
      <div class="convo-head"><a class="only-mobile icon-btn" href="#/messages">${icon('arrowL', 18)}</a>${avatar(threadTitle(th, me), 40)}<div class="grow"><b>${esc(threadTitle(th, me))}</b>${th.caseId ? `<small><a href="#/case/${th.caseId}">View rescue case →</a></small>` : ''}</div>
        ${(() => { const o = th.members.find(m => m !== me.id); const ph = o && !o.startsWith('c:') ? Store.user(o)?.phone : directory().find(p => 'c:' + p.name === o)?.phone; return ph ? `<a class="btn btn-soft sm" href="tel:${ph.replace(/\s/g, '')}">${icon('phone', 14)} Call</a>` : ''; })()}</div>
      <div class="convo-body" id="convo">${th.msgs.map(m => `<div class="msg ${m.from === me.id ? 'me' : ''}">${m.media ? mediaTag(m.media, 'msg-img', true) : ''}${m.text ? `<p>${esc(m.text).replace(/\n/g, '<br>')}</p>` : ''}<small>${timeAgo(m.at)}</small></div>`).join('') || '<p class="muted center">Start the conversation 👋</p>'}</div>
      <form class="chat-in" id="msgForm"><label class="icon-btn" title="Send photo/video">${icon('camera', 18)}<input type="file" name="file" accept="image/*,video/*" hidden></label><input name="text" placeholder="Type a message…" autocomplete="off"><button class="btn btn-primary">${icon('send', 16)}</button></form>`
    : emptyState('msg', 'Select a conversation', '')}</section>
  </div>`;
}
function bindMessages(tid) {
  const me = Store.me;
  const c = $('#convo'); if (c) c.scrollTop = c.scrollHeight;
  const f = $('#msgForm'); if (!f) return;
  const th = Store.db.threads.find(t => t.id === tid) || Store.db.threads.filter(t => t.members.includes(me.id)).sort((a, b) => (b.msgs.at(-1)?.at || 0) - (a.msgs.at(-1)?.at || 0))[0];
  f.file.onchange = async () => { const file = f.file.files[0]; if (!file) return; th.msgs.push({ from: me.id, text: '', media: await Media.put(file), at: now() }); Store.save(); };
  f.onsubmit = e => {
    e.preventDefault(); const text = f.text.value.trim(); if (!text) return;
    th.msgs.push({ from: me.id, text, at: now() });
    th.read = th.read || {}; th.read[me.id] = now();
    const other = th.members.find(m => m !== me.id);
    if (other && !other.startsWith('c:')) Store.notify(other, `💬 ${me.name}: ${text.slice(0, 60)}`, '#/messages/' + th.id);
    Store.save();
    setTimeout(() => $('#msgForm input[name=text]')?.focus(), 30);
    if (other?.startsWith('c:')) setTimeout(() => { th.msgs.push({ from: other, text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)], at: now() }); if (location.hash.includes(th.id) || location.hash === '#/messages') { th.read[me.id] = now(); } Store.save(); }, 1800);
  };
}

/* ---------- Every Rescue Matters / Opportunities ---------- */
const OPPS = [
  { id: 'o1', t: 'Weekend Rescue Squad', e: '🚑', d: 'Join a trained team that responds to emergency cases every Saturday & Sunday.', when: 'Sat–Sun • 4 hrs', spots: 6 },
  { id: 'o2', t: 'Community Feeding Drive', e: '🍚', d: 'Help feed 200+ street dogs & cats across 5 spots in your area.', when: 'Daily • 6–8 PM', spots: 15 },
  { id: 'o3', t: 'Foster a Rescue', e: '🏡', d: 'Give a recovering puppy or kitten a safe home for 2–4 weeks. Food & vet costs covered by partner NGOs.', when: 'Flexible', spots: 4 },
  { id: 'o4', t: 'Animal Ambulance Driver', e: '🚐', d: 'Have a licence and a free evening? Help transport injured animals to hospitals.', when: 'On call', spots: 3 },
  { id: 'o5', t: 'Vet Volunteer Camp', e: '🩺', d: 'Vets & vet students: free vaccination and sterilisation camp.', when: 'Monthly', spots: 8 },
  { id: 'o6', t: 'Awareness & Social Media', e: '📣', d: 'Design posters, run adoption posts and spread first-aid awareness.', when: 'Remote', spots: 10 },
];
function pageOpportunities() {
  const me = Store.me;
  const joined = new Set(Store.db.signups.filter(s => s.userId === me.id).map(s => s.oppId));
  const demo = isDemo();
  const saved = Store.db.cases.filter(c => c.status === 'resolved').length + (demo ? 1240 : 0);
  return `
  <section class="hero hero-matters">
    <div class="hero-text"><p class="hand big">Every rescue matters</p><h1>One small act of kindness<br>can change a whole life.</h1><p>Report. Connect. Save. Join the people in your city who refuse to walk past an animal in pain.</p>
    <div class="impact"><div><b>${saved.toLocaleString('en-IN')}</b><small>animals helped</small></div><div><b>${Store.db.users.filter(u => isRescuerSide(u)).length + (demo ? 312 : 0)}</b><small>rescuers</small></div><div><b>${Store.db.teams.length + (demo ? 27 : 0)}</b><small>rescue teams</small></div></div></div>
    <div class="matters-photos"><img src="${PHOTOS.story1}" alt=""><img src="${PHOTOS.story2}" alt=""></div>
  </section>

  ${demo ? `  <section>
    <h2>Stories that keep us going</h2>
    <div class="grid-2">
      <article class="card story"><img src="${PHOTOS.story2}" alt=""><div><span class="tag tag-green">Recovered</span><h3>Moti walks again</h3><p>Hit by a car near the market, Moti couldn’t stand. A college student reported him, Rohit reached in 12 minutes and Dr. Mehta’s team operated the same night. Six weeks later, he’s back to guarding his favourite tea stall. ☕🐕</p></div></article>
      <article class="card story"><img src="${PHOTOS.story1}" alt=""><div><span class="tag tag-blue">Adopted</span><h3>Four puppies, four homes</h3><p>Found in a box behind the metro station during the rains. Fostered by 2 BrunoVerse families, vaccinated at the community camp, and every single one is now somebody’s best friend. 💛</p></div></article>
    </div>
  </section>` : `<section class="card"><h2>Stories that keep us going</h2><p class="muted">Every rescue on BrunoVerse becomes a story. Helped an animal recently? <a class="link" href="#/community">Share it with the community →</a></p></section>`}

  <section>
    <div class="sec-head"><h2>Volunteer opportunities</h2>${me.role === 'owner' || me.role === 'feeder' ? `<button class="btn btn-soft sm" id="becomeRescuer">${icon('hand', 15)} Become a rescuer</button>` : ''}</div>
    <div class="opp-grid">${OPPS.map(o => `<article class="card opp"><div class="opp-emoji">${o.e}</div><h3>${o.t}</h3><p class="small">${o.d}</p><small class="muted">${icon('clock', 13)} ${o.when} • ${Math.max(0, o.spots - Store.db.signups.filter(s => s.oppId === o.id).length)} spots left</small>
      <button class="btn ${joined.has(o.id) ? 'btn-soft' : 'btn-primary'} sm" data-join="${o.id}">${joined.has(o.id) ? icon('check', 14) + ' Joined' : 'I want to help'}</button></article>`).join('')}</div>
  </section>

  <section class="card start-team">
    <div><h2>${icon('users', 22)} Start a rescue team in your area</h2><p class="muted">Many areas still have no one to call. Gather 3+ friends, register your team and we’ll route nearby cases to you, plus first-aid training from partner NGOs.</p>
      ${Store.db.teams.length ? `<div class="teams">${Store.db.teams.map(t => `<span class="tag tag-green">${icon('shield', 12)} ${esc(t.name)} • ${esc(t.area)} • ${t.members} members</span>`).join('')}</div>` : ''}</div>
    <form class="form" id="teamForm"><div class="grid2"><label>Team name<input name="name" required placeholder="Sector 62 Paws Squad"></label><label>Area<input name="area" required placeholder="Sector 62, Noida"></label></div>
      <div class="grid2"><label>Members<input name="members" type="number" min="1" value="3"></label><label>Contact number<input name="phone" required value="${esc(me.phone)}"></label></div>
      <button class="btn btn-primary">Create team ${icon('arrowR', 14)}</button></form>
  </section>`;
}
function bindOpportunities() {
  const me = Store.me;
  $$('[data-join]').forEach(b => b.onclick = () => {
    const id = b.dataset.join; const ex = Store.db.signups.find(s => s.userId === me.id && s.oppId === id);
    if (ex) { Store.db.signups = Store.db.signups.filter(s => s !== ex); toast('Removed from this opportunity'); }
    else { Store.db.signups.push({ id: uid('s'), userId: me.id, oppId: id, at: now() }); Store.addActivity(me.id, `Signed up for “${OPPS.find(o => o.id === id).t}”`, 'heart'); toast('Thank you! The coordinator will message you soon 💚'); }
    Store.save();
  });
  $('#becomeRescuer')?.addEventListener('click', () => askConfirm('Switch your account to Rescuer? You’ll start seeing rescue requests near you.', 'Become a rescuer', () => {
    me.role = 'rescuer'; me.available = true; const l = Geo.current(); me.lat = l.lat; me.lng = l.lng; me.baseCompleted = me.baseCompleted || 0; me.baseHelped = me.baseHelped || 0;
    Store.save(false); toast('Welcome to the rescue family, hero 💚'); location.hash = '#/home'; render();
  }));
  $('#teamForm').onsubmit = e => { e.preventDefault(); const f = formData(e.target); Store.db.teams.push({ id: uid('t'), ...f, members: +f.members, by: me.id, at: now() }); Store.addActivity(me.id, `Created rescue team “${f.name}”`, 'users'); Store.save(); toast('Team created! 🎉 Nearby cases will be shared with you.'); };
}

/* ---------- Settings ---------- */
function pageSettings() {
  const me = Store.me; const s = Store.db.settings; const l = Geo.current();
  return `<div class="page-head"><div><h1>Settings</h1></div></div>
  <div class="grid-2">
    <form class="card form" id="profForm"><h2>Profile</h2>
      <div class="photo-pick"><label class="photo-circle" id="avPrev">${me.avatar ? mediaTag(me.avatar) : avatar(me, 90)}<input type="file" name="av" accept="image/*" hidden></label><small class="muted">Change photo</small></div>
      <div class="grid2"><label>Name<input name="name" value="${esc(me.name)}" required></label><label>Phone<input name="phone" value="${esc(me.phone)}" required></label></div>
      <div class="grid2"><label>Email<input name="email" value="${esc(me.email)}"></label><label>City<input name="city" value="${esc(me.city)}"></label></div>
      <label>Account type<select name="role">${Object.entries(ROLE_LABEL).map(([k, v]) => `<option value="${k}" ${me.role === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      ${isRescuerSide(me) || me.role === 'feeder' ? `<label class="check"><input type="checkbox" name="available" ${me.available !== false ? 'checked' : ''}> Available — show my number to people reporting nearby cases</label>` : ''}
      <button class="btn btn-primary">Save profile</button>
    </form>
    <div class="stack">
      <section class="card"><h2>${icon('locate', 18)} Location</h2><p class="small">Current: <b>${l.lat.toFixed(4)}, ${l.lng.toFixed(4)}</b> ${Geo.loc ? '(live GPS)' : '(approximate)'}</p>
        <button class="btn btn-soft sm" id="setLoc">${icon('locate', 14)} Update from GPS</button><p class="muted small">Your location is used to find nearby help and show your distance to cases. Rescuers’ locations are shown only while they are available.</p></section>
      <form class="card form" id="aiForm2"><h2>${icon('sparkle', 18)} AI assistant</h2><p class="muted small">Works offline by default. For free-form AI answers paste a Google Gemini API key (free at aistudio.google.com). Stored only in this browser.</p>
        <label>Gemini API key<input name="aiKey" type="password" value="${esc(s.aiKey)}" placeholder="AIza…"></label><label>Model<input name="aiModel" value="${esc(s.aiModel)}"></label><button class="btn btn-soft">Save AI settings</button></form>
      <section class="card"><h2>Account & data</h2><p class="muted small">${Api.online ? 'Your data is stored securely on the BrunoVerse server.' : 'Offline mode: data is stored in this browser only.'} Read our <a class="link" href="#/privacy">Privacy Policy</a> and <a class="link" href="#/terms">Terms of Use</a>. To delete your account and data, write to the contact on the Privacy Policy page.</p>
        <div class="row-actions">${isDemo() && !Api.online ? `<button class="btn btn-ghost sm red" id="resetData">${icon('trash', 14)} Reset demo data</button>` : ''}<button class="btn btn-ghost sm" id="logout2">${icon('logout', 14)} Log out</button></div></section>
    </div>
  </div>`;
}
function bindSettings() {
  const me = Store.me;
  let av = me.avatar;
  const f = $('#profForm');
  f.av.onchange = async () => { const file = f.av.files[0]; if (!file) return; av = await Media.put(file); $('#avPrev').innerHTML = `<img src="${Media._cache[av].url}">`; $('#avPrev').appendChild(f.av); };
  f.onsubmit = e => { e.preventDefault(); const d = formData(f); Object.assign(me, { name: d.name, phone: d.phone, email: d.email, city: d.city, role: d.role, avatar: av }); if ('available' in d || f.available) me.available = !!f.available?.checked; if (isRescuerSide(me) && me.lat == null) { const l = Geo.current(); me.lat = l.lat; me.lng = l.lng; } Store.save(); toast('Profile saved ✓'); };
  $('#setLoc').onclick = async () => { const l = await Geo.locate(); if (isRescuerSide(me)) { me.lat = l.lat; me.lng = l.lng; delete me.dLat; } Store.save(); };
  $('#aiForm2').onsubmit = e => { e.preventDefault(); const d = formData(e.target); Object.assign(Store.db.settings, d); Store.save(); toast(d.aiKey ? 'AI key saved ✨' : 'Using offline AI'); };
  $('#resetData') && ($('#resetData').onclick = () => askConfirm('Reset all demo data? Your added pets, reports and messages will be removed.', 'Reset', () => { Store.reset(); Store.login('u_anushka'); location.hash = '#/home'; render(); toast('Demo data restored'); }));
  $('#logout2').onclick = () => { Store.logout(); location.hash = '#/login'; };
}

/* ---------- Search ---------- */
function pageSearch(q) {
  q = decodeURIComponent(q || '').toLowerCase().trim();
  const m = s => (s || '').toLowerCase().includes(q);
  const places = q ? directory().filter(p => m(p.name) || m(p.services) || m(PLACE_META[p.type]?.label)) : [];
  const cases = q ? Store.db.cases.filter(c => m(c.title) || m(c.description) || m(c.address) || m(c.animal)) : [];
  const pets = q ? Store.db.pets.filter(p => p.ownerId === Store.me.id && (m(p.name) || m(p.breed))) : [];
  const aid = q ? AI.match(q) : [];
  return `<div class="page-head"><div><h1>Search: “${esc(q)}”</h1></div></div>
  ${aid.length ? `<section class="card"><h2>${icon('sparkle', 18)} First-aid guides</h2>${aid.slice(0, 1).map(f => firstAidCard(f, true)).join('')}</section>` : ''}
  ${places.length ? `<section class="card"><h2>Help nearby</h2>${places.slice(0, 8).map(p => placeRow(p, { full: true })).join('')}</section>` : ''}
  ${cases.length ? `<section class="card"><h2>Cases</h2>${cases.map(c => caseRow(c)).join('')}</section>` : ''}
  ${pets.length ? `<section class="card"><h2>Your pets</h2>${pets.map(p => `<a class="msg-row" href="#/pet/${p.id}">${mediaTag(p.photo, 'thumb')}<b>${esc(p.name)}</b></a>`).join('')}</section>` : ''}
  ${!places.length && !cases.length && !pets.length && !aid.length ? emptyState('search', 'No results', 'Try “vet”, “shelter”, “bleeding” or an area name.') : ''}`;
}
