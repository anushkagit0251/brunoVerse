/* =========================================================
   Pet-owner pages
   ========================================================= */

/* ---------- Owner Home ---------- */
function ownerHome() {
  const me = Store.me;
  const pets = Store.db.pets.filter(p => p.ownerId === me.id);
  const myOpen = Store.db.cases.filter(c => c.reporterId === me.id && c.status !== 'resolved').sort((a, b) => b.createdAt - a.createdAt);
  const near = directory().slice(0, 3);
  return `
  <section class="hero hero-owner">
    <div class="hero-photo"><img src="${PHOTOS.heroOwner}" alt=""></div>
    <div class="hero-text"><h1>${greeting()}, ${esc(firstName(me))}!</h1><p>Your little companions make<br>the world brighter ${icon('heart', 16, 'heart-ic')}</p></div>
    <div class="hero-bubble hand">Kindness<br>goes a long way<br>for them ♡</div>
  </section>

  <section class="actions4">
    <a href="#/report" class="action c-pink">${icon('megaphone', 30)}<span>Report an<br>Animal in Need</span></a>
    <a href="#/help" class="action c-mint">${icon('pin', 30)}<span>Find Nearby<br>Help</span></a>
    <a href="#/vet" class="action c-lav">${icon('steth', 30)}<span>Book Veterinary<br>Consultation</span></a>
    <a href="#/pets" class="action c-blue">${icon('file', 30)}<span>View My Pet<br>Records</span></a>
  </section>

  ${myOpen.length ? `<section class="card track-card">
    ${sectionHead('Your rescue in progress 🐾', '#/reports', 'All reports')}
    ${myOpen.slice(0, 2).map(c => `<a class="track-item" href="#/case/${c.id}">
      ${mediaTag(c.media[0], 'thumb')}
      <div class="grow"><b>${esc(c.title)}</b> ${needBadge(c)}<small class="muted">${c.rescuerName ? `${esc(c.rescuerName)} • ${STATUS[c.status].label}` : 'Notifying rescuers near you…'} • ${timeAgo(c.createdAt)}</small>${tracker(c)}</div>
    </a>`).join('')}
  </section>` : ''}

  <div class="grid-2-1">
    <section class="card">
      ${sectionHead('My Pets', '#/pets')}
      <div class="pet-strip">
        ${pets.map(p => `<a class="pet-card" href="#/pet/${p.id}">${mediaTag(p.photo, 'pet-img')}<b>${esc(p.name)} <span class="sex">${p.gender === 'Female' ? '♀' : '♂'}</span></b><small>${esc(p.species)} • ${ageText(p.dob)}</small>${petHealthTag(p)}</a>`).join('')}
        <button class="pet-card add" id="addPetBtn">${icon('paw', 34)}<b>Add a Pet</b><span class="plus">${icon('plus', 16)}</span></button>
      </div>
    </section>
    <section class="card">
      ${sectionHead('Upcoming Reminders', '#/pets')}
      ${reminderList(me.id, 3)}
    </section>
  </div>

  <section class="card">
    ${sectionHead('Nearby Help', '#/help')}
    <div class="nearby-grid">
      <div class="map-box" id="homeMap"></div>
      <div>${near.map(p => placeRow(p, { compact: true })).join('')}</div>
    </div>
  </section>

  <div class="grid-2">
    <section class="banner c-green-soft">
      <span class="banner-ic">${icon('heart', 30)}</span>
      <div><h3>Need help or know an animal in distress?</h3><p>Report it now and get connected with the right people.</p><a href="#/report" class="btn btn-primary sm">Report Now ${icon('arrowR', 14)}</a></div>
    </section>
    <section class="banner c-peach">
      <span class="banner-ic plain">${icon('sparkle', 30)}</span>
      <div><h3>Ask AI</h3><p>Quick first-aid steps, care tips and personalised advice for your pet.</p><a href="#/ai" class="btn btn-primary sm">Chat Now ${icon('arrowR', 14)}</a></div>
    </section>
  </div>

  <section>
    ${sectionHead('Latest from the Community', '#/community')}
    <div class="comm-strip">${Store.db.posts.slice(0, 4).map(postMini).join('')}</div>
  </section>`;
}
function bindOwnerHome() {
  $('#addPetBtn')?.addEventListener('click', () => petForm());
  const near = directory().slice(0, 6);
  Maps.make('homeMap', { zoom: 13, markers: near.map(p => ({ ...p, kind: p.type, popup: `<b>${esc(p.name)}</b><br>${Geo.dist(p)}` })) });
}

function petHealthTag(p) {
  const next = (p.vaccinations || []).filter(v => v.due).sort((a, b) => new Date(a.due) - new Date(b.due))[0];
  if (next && daysUntil(next.due) <= 75) return `<span class="tag tag-amber">${icon('syringe', 12)} Next vaccine ${dueText(next.due).replace('Due ', '').toLowerCase()}</span>`;
  return `<span class="tag tag-green">${icon('heart', 12)} ${esc(p.health === 'Healthy' || !p.health ? 'Healthy' : p.health)}</span>`;
}

function allReminders(ownerId) {
  const out = [];
  Store.db.pets.filter(p => p.ownerId === ownerId).forEach(p => {
    (p.vaccinations || []).forEach(v => v.due && out.push({ pet: p, title: `${v.name} Vaccine`, due: v.due, ic: 'syringe', c: 'pink' }));
    (p.reminders || []).forEach(r => out.push({ pet: p, title: r.title, due: r.due, ic: r.icon || 'calendar', c: 'peach', rid: r.id }));
  });
  Store.db.appointments.filter(a => a.ownerId === ownerId && a.status !== 'cancelled' && daysUntil(a.date) >= 0).forEach(a => {
    const p = Store.db.pets.find(x => x.id === a.petId);
    out.push({ pet: p, title: `Vet visit – ${a.vetName}`, due: a.date, ic: 'steth', c: 'lav' });
  });
  return out.filter(r => daysUntil(r.due) > -30).sort((a, b) => new Date(a.due) - new Date(b.due));
}
function reminderList(ownerId, n = 99) {
  const list = allReminders(ownerId).slice(0, n);
  if (!list.length) return emptyState('calendar', 'No reminders yet', 'Add vaccinations to your pet’s record and we’ll remind you.');
  return `<div class="rem-list">${list.map(r => `<div class="rem"><span class="rem-ic c-${r.c}">${icon(r.ic, 18)}</span><div><b>${esc(r.pet?.name || '')} – ${esc(r.title)}</b><small class="${daysUntil(r.due) < 0 ? 'red' : ''}">${dueText(r.due)}</small></div></div>`).join('')}</div>`;
}

function postMini(p) {
  const cls = { 'Rescue Needed': 'red', 'Medical Help': 'lav', 'Feeding': 'green', 'Adoption': 'blue', 'Lost & Found': 'amber', 'Story': 'green' }[p.tag] || 'green';
  return `<a class="post-mini" href="#/community">${mediaTag(p.image, '')}<p>${esc(p.text.slice(0, 60))}${p.text.length > 60 ? '…' : ''}</p><div class="pm-foot"><span class="tag tag-${cls}">${esc(p.tag)}</span><small>${timeAgo(p.at)}</small></div></a>`;
}

/* ---------- My Pets ---------- */
function pagePets() {
  const me = Store.me;
  const pets = Store.db.pets.filter(p => p.ownerId === me.id);
  return `
  <div class="page-head"><div><h1>My Pets</h1><p class="muted">Their whole health story, in one safe place.</p></div><button class="btn btn-primary" id="addPetBtn">${icon('plus', 16)} Add a Pet</button></div>
  ${pets.length ? `<div class="pets-grid">${pets.map(p => `
    <a class="pet-big" href="#/pet/${p.id}">
      ${mediaTag(p.photo, 'pet-big-img')}
      <div class="pet-big-body"><h3>${esc(p.name)} <span class="sex">${p.gender === 'Female' ? '♀' : '♂'}</span></h3><p class="muted">${esc(p.breed || p.species)} • ${ageText(p.dob)} • ${p.weight ? p.weight + ' kg' : ''}</p>${petHealthTag(p)}
      <div class="pet-mini-stats"><span>${icon('syringe', 14)} ${p.vaccinations?.length || 0} vaccines</span><span>${icon('file', 14)} ${p.records?.length || 0} records</span></div></div>
    </a>`).join('')}</div>`
    : emptyState('paw', 'Add your first pet', 'Create a profile with photo, vaccinations and medical history — share it with any vet in one tap.', '<button class="btn btn-primary" id="addPetBtn2">Add a Pet</button>')}
  <section class="card"><h2>All Reminders</h2>${reminderList(me.id)}</section>`;
}
function bindPets() { $('#addPetBtn')?.addEventListener('click', () => petForm()); $('#addPetBtn2')?.addEventListener('click', () => petForm()); }

function petForm(pet) {
  const p = pet || {};
  const { el, close } = openModal(`
    <h2>${pet ? 'Edit ' + esc(p.name) : 'Add a Pet'} 🐾</h2>
    <form class="form" id="petForm">
      <div class="photo-pick">
        <label class="photo-circle" id="photoPrev">${p.photo ? mediaTag(p.photo) : icon('camera', 28)}<input type="file" accept="image/*" name="photoFile" hidden></label>
        <small class="muted">Add a real photo of your pet</small>
      </div>
      <div class="grid2"><label>Name<input name="name" required value="${esc(p.name)}" placeholder="Bruno"></label>
      <label>Species<select name="species">${['Dog', 'Cat', 'Bird', 'Rabbit', 'Cow', 'Other'].map(s => `<option ${p.species === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div>
      <div class="grid2"><label>Breed<input name="breed" value="${esc(p.breed)}" placeholder="Indie / Labrador…"></label>
      <label>Gender<select name="gender">${['Male', 'Female'].map(s => `<option ${p.gender === s ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div>
      <div class="grid3"><label>Date of birth<input type="date" name="dob" value="${esc(p.dob)}"></label><label>Weight (kg)<input type="number" step="0.1" name="weight" value="${esc(p.weight)}"></label><label>Colour<input name="color" value="${esc(p.color)}"></label></div>
      <label>Microchip / Licence no. (optional)<input name="microchip" value="${esc(p.microchip)}"></label>
      <label>Notes (allergies, behaviour, diet)<textarea name="notes" rows="2">${esc(p.notes)}</textarea></label>
      <div class="form-actions">${pet ? `<button type="button" class="btn btn-ghost red" id="delPet">${icon('trash', 15)} Remove</button>` : ''}<button class="btn btn-primary">${pet ? 'Save changes' : 'Add pet'}</button></div>
    </form>`);
  let photoRef = p.photo || '';
  const fileIn = $('input[name=photoFile]', el);
  fileIn.onchange = async () => { const f = fileIn.files[0]; if (!f) return; photoRef = await Media.put(f); $('#photoPrev', el).innerHTML = `<img src="${Media._cache[photoRef].url}">`; $('#photoPrev', el).appendChild(fileIn); };
  $('#delPet', el)?.addEventListener('click', () => askConfirm(`Remove ${esc(p.name)}'s profile and records?`, 'Remove', () => { Store.db.pets = Store.db.pets.filter(x => x.id !== p.id); location.hash = '#/pets'; Store.save(); }));
  $('#petForm', el).onsubmit = e => {
    e.preventDefault();
    const f = formData(e.target); delete f.photoFile;
    if (pet) Object.assign(pet, f, { photo: photoRef, weight: +f.weight || '' });
    else {
      const np = { id: uid('pet'), ownerId: Store.me.id, ...f, weight: +f.weight || '', photo: photoRef, health: 'Healthy', vaccinations: [], records: [], reminders: [] };
      Store.db.pets.push(np);
      Store.addActivity(Store.me.id, `Added ${f.name} to My Pets`, 'paw');
      location.hash = '#/pet/' + np.id;
    }
    Store.save(); close(); toast(pet ? 'Saved ✓' : `${esc(f.name)} joined the family 💛`);
  };
}

/* ---------- Pet detail / records ---------- */
function pagePet(id) {
  const p = Store.db.pets.find(x => x.id === id);
  if (!p) return emptyState('paw', 'Pet not found', '', '<a class="btn btn-primary" href="#/pets">Back to My Pets</a>');
  const tab = window._petTab || 'records';
  return `
  <a class="back" href="#/pets">${icon('arrowL', 16)} My Pets</a>
  <section class="card pet-profile">
    ${mediaTag(p.photo, 'pp-img')}
    <div class="grow">
      <h1>${esc(p.name)} <span class="sex">${p.gender === 'Female' ? '♀' : '♂'}</span></h1>
      <p class="muted">${esc(p.species)} • ${esc(p.breed || '')} • ${ageText(p.dob)} old</p>
      <div class="facts">
        <span><small>Weight</small><b>${p.weight || '—'} kg</b></span><span><small>Born</small><b>${fmtDate(p.dob)}</b></span>
        <span><small>Colour</small><b>${esc(p.color || '—')}</b></span><span><small>Microchip</small><b>${esc(p.microchip || '—')}</b></span>
      </div>
      ${p.notes ? `<p class="note">${icon('info', 15)} ${esc(p.notes)}</p>` : ''}
    </div>
    <div class="pp-actions">
      <button class="btn btn-soft" id="editPet">${icon('edit', 15)} Edit</button>
      <button class="btn btn-soft" id="aiSum">${icon('sparkle', 15)} AI health summary</button>
      <a class="btn btn-primary" href="#/vet?pet=${p.id}">${icon('steth', 15)} Book vet</a>
    </div>
  </section>
  <div class="tabs line">${[['records', 'Medical Records'], ['vaccines', 'Vaccinations'], ['reminders', 'Reminders']].map(([k, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>
  <section class="card">
    ${tab === 'records' ? `
      <div class="sec-head"><h2>Treatment history</h2><button class="btn btn-soft sm" id="addRec">${icon('plus', 14)} Add record</button></div>
      ${(p.records || []).length ? `<div class="timeline">${[...p.records].sort((a, b) => new Date(b.date) - new Date(a.date)).map(r => `
        <div class="tl-item"><span class="tl-dot"></span><div class="tl-body"><div class="tl-top"><b>${esc(r.title)}</b><span class="tag tag-lav">${esc(r.type)}</span></div>
        <small class="muted">${fmtDate(r.date)} • ${esc(r.vet || '')}</small><p>${esc(r.notes || '')}</p>${r.file ? `<div class="rec-file">${mediaTag(r.file, 'rec-img', true)}</div>` : ''}
        <button class="link red small" data-delrec="${r.id}">Delete</button></div></div>`).join('')}</div>` : emptyState('file', 'No records yet', 'Add checkups, treatments, surgeries and lab reports (photos of prescriptions work great).')}`
    : tab === 'vaccines' ? `
      <div class="sec-head"><h2>Vaccinations</h2><button class="btn btn-soft sm" id="addVac">${icon('plus', 14)} Add vaccine</button></div>
      ${(p.vaccinations || []).length ? `<table class="table"><thead><tr><th>Vaccine</th><th>Given on</th><th>Next due</th><th></th></tr></thead><tbody>
        ${p.vaccinations.map(v => `<tr><td><b>${esc(v.name)}</b></td><td>${fmtDate(v.date)}</td><td><span class="tag ${daysUntil(v.due) < 0 ? 'tag-red' : daysUntil(v.due) < 30 ? 'tag-amber' : 'tag-green'}">${v.due ? dueText(v.due) : '—'}</span></td><td><button class="link small" data-donevac="${v.id}">Mark given today</button></td></tr>`).join('')}
      </tbody></table>` : emptyState('syringe', 'No vaccinations added', 'Add your pet’s vaccination card — we’ll remind you before each due date.')}`
    : `
      <div class="sec-head"><h2>Reminders</h2><button class="btn btn-soft sm" id="addRem">${icon('plus', 14)} Add reminder</button></div>
      ${(p.reminders || []).length ? `<div class="rem-list">${p.reminders.map(r => `<div class="rem"><span class="rem-ic c-peach">${icon(r.icon || 'calendar', 18)}</span><div class="grow"><b>${esc(r.title)}</b><small>${dueText(r.due)} • ${fmtDate(r.due)}</small></div><button class="link red small" data-delrem="${r.id}">Remove</button></div>`).join('')}</div>` : emptyState('bell', 'No reminders', 'Deworming, grooming, flea treatment… add anything.')}`}
  </section>`;
}
function bindPet(id) {
  const p = Store.db.pets.find(x => x.id === id); if (!p) return;
  $$('[data-tab]').forEach(b => b.onclick = () => { window._petTab = b.dataset.tab; render(); });
  $('#editPet').onclick = () => petForm(p);
  $('#aiSum').onclick = () => {
    const vac = (p.vaccinations || []).map(v => `${v.name} (${v.due ? dueText(v.due).toLowerCase() : 'given ' + fmtDate(v.date)})`).join(', ') || 'none recorded';
    const recs = [...(p.records || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    const overdue = (p.vaccinations || []).filter(v => v.due && daysUntil(v.due) < 0);
    const txt = `${p.name} is a ${ageText(p.dob)} old ${p.gender?.toLowerCase()} ${p.breed || p.species} weighing ${p.weight || '?'} kg.\nVaccinations: ${vac}.\nRecent history: ${recs.slice(0, 3).map(r => `${fmtDate(r.date)} – ${r.title}`).join('; ') || 'no visits recorded'}.\nNotes: ${p.notes || '—'}.`;
    openModal(`<h2>${icon('sparkle', 20)} AI Health Summary — ${esc(p.name)}</h2>
      <div class="ai-card"><p>${esc(txt).replace(/\n/g, '<br>')}</p>
      <p><b>Suggestions:</b></p><ul>${[overdue.length ? `⚠️ ${overdue.map(v => v.name).join(', ')} vaccine is overdue — book a visit soon.` : '✅ Vaccinations are up to date.',
        !recs.some(r => daysUntil(r.date) > -365) ? 'Book a yearly health check-up.' : 'Last check-up was within a year — great!',
        p.species === 'Dog' ? 'Deworm every 3 months and use tick prevention during monsoon.' : p.species === 'Cat' ? 'Deworm every 3 months; keep fresh water to support kidney health.' : 'Ask your vet for a species-specific care plan.'].map(s => `<li>${s}</li>`).join('')}</ul>
      <p class="muted small">AI summary is for information only and is not a diagnosis.</p></div>
      <div class="form-actions"><button class="btn btn-soft" id="copySum">${icon('share', 15)} Copy for vet</button><a class="btn btn-primary" href="#/vet?pet=${p.id}">Share with a vet</a></div>`, {});
    $('#copySum').onclick = () => { safeCopy(txt); toast('Copied — paste it in a chat with your vet'); };
  };
  $('#addRec')?.addEventListener('click', () => {
    const { el, close } = openModal(`<h2>Add medical record</h2><form class="form" id="recForm">
      <div class="grid2"><label>Date<input type="date" name="date" required value="${new Date().toISOString().slice(0, 10)}"></label><label>Type<select name="type">${['Checkup', 'Treatment', 'Surgery', 'Lab test', 'Deworming', 'Prescription', 'Other'].map(t => `<option>${t}</option>`).join('')}</select></label></div>
      <label>Title<input name="title" required placeholder="e.g. Skin allergy"></label><label>Vet / Clinic<input name="vet" placeholder="Clinic name"></label>
      <label>Notes / medicines<textarea name="notes" rows="3"></textarea></label>
      <label>Attach prescription / report photo<input type="file" name="file" accept="image/*,application/pdf"></label>
      <button class="btn btn-primary full">Save record</button></form>`);
    $('#recForm', el).onsubmit = async e => { e.preventDefault(); const f = formData(e.target); const file = e.target.file.files[0]; f.file = file ? await Media.put(file) : ''; p.records = p.records || []; p.records.push({ id: uid('r'), ...f }); Store.save(); close(); toast('Record added ✓'); };
  });
  $('#addVac')?.addEventListener('click', () => {
    const { el, close } = openModal(`<h2>Add vaccination</h2><form class="form" id="vacForm">
      <label>Vaccine<input name="name" required list="vacList" placeholder="Rabies"><datalist id="vacList">${['Rabies', 'DHPPi (5-in-1)', 'Leptospirosis', 'Corona', 'Kennel Cough', 'FVRCP', 'Feline Leukemia'].map(v => `<option>${v}</option>`).join('')}</datalist></label>
      <div class="grid2"><label>Given on<input type="date" name="date" required></label><label>Next due<input type="date" name="due"></label></div>
      <button class="btn btn-primary full">Save</button></form>`);
    $('#vacForm', el).onsubmit = e => { e.preventDefault(); const f = formData(e.target); if (!f.due) { const d = new Date(f.date); d.setFullYear(d.getFullYear() + 1); f.due = d.toISOString().slice(0, 10); } p.vaccinations.push({ id: uid('v'), ...f }); Store.save(); close(); toast('Vaccination saved — we’ll remind you 🔔'); };
  });
  $('#addRem')?.addEventListener('click', () => {
    const { el, close } = openModal(`<h2>Add reminder</h2><form class="form" id="remForm"><label>What?<input name="title" required placeholder="Deworming, grooming…"></label><label>When?<input type="date" name="due" required></label><button class="btn btn-primary full">Save</button></form>`);
    $('#remForm', el).onsubmit = e => { e.preventDefault(); const f = formData(e.target); p.reminders = p.reminders || []; p.reminders.push({ id: uid('rm'), ...f, icon: 'calendar' }); Store.save(); close(); };
  });
  $$('[data-delrec]').forEach(b => b.onclick = () => { p.records = p.records.filter(r => r.id !== b.dataset.delrec); Store.save(); });
  $$('[data-delrem]').forEach(b => b.onclick = () => { p.reminders = p.reminders.filter(r => r.id !== b.dataset.delrem); Store.save(); });
  $$('[data-donevac]').forEach(b => b.onclick = () => { const v = p.vaccinations.find(x => x.id === b.dataset.donevac); v.date = new Date().toISOString().slice(0, 10); const d = new Date(); d.setFullYear(d.getFullYear() + 1); v.due = d.toISOString().slice(0, 10); Store.save(); toast('Updated ✓ Next dose in 1 year'); });
}

/* ---------- Report an animal (I found an animal) ---------- */
const CONDITIONS = ['Bleeding', 'Accident', 'Limping', 'Not moving', 'Wound', 'Maggot wound', 'Sick / weak', 'Hungry', 'Abandoned babies', 'Eye problem', 'Trapped / stuck', 'Poisoning', 'Breathing trouble', 'Burns', 'Scared / aggressive'];
const COND_TEXT = { 'Not moving': 'unconscious not moving', 'Sick / weak': 'weak', 'Abandoned babies': 'abandoned puppies kitten', 'Eye problem': 'eye', 'Breathing trouble': 'breathing', 'Maggot wound': 'maggot', 'Poisoning': 'poison', 'Burns': 'burn' };
let reportDraft = null;

function pageReport() {
  const me = Store.me;
  reportDraft = reportDraft || { animal: 'Dog', cond: [], media: [], loc: null, address: '' };
  return `
  <div class="page-head"><div><h1>Report an Animal in Need</h1><p class="muted">You stopping to help is already the bravest part. We’ll do the rest together 💛</p></div></div>
  <div class="report-grid">
    <form class="card form" id="reportForm">
      <div class="step"><span class="step-n">1</span><h3>Where is the animal?</h3></div>
      <div class="loc-box">
        <div class="map-box sm" id="reportMap"></div>
        <div class="loc-info"><p id="locText">${icon('locate', 16)} Getting your GPS location…</p>
          <button type="button" class="btn btn-soft sm" id="relocate">${icon('locate', 15)} Use my current location</button></div>
      </div>
      <label>Landmark / exact spot<input name="address" id="addrIn" placeholder="e.g. Opposite the bakery, under the parked car" value="${esc(reportDraft.address)}"></label>

      <div class="step"><span class="step-n">2</span><h3>Which animal?</h3></div>
      <div class="chips" id="animalChips">${['Dog', 'Cat', 'Cow', 'Bird', 'Monkey', 'Other'].map(a => `<button type="button" class="chip ${reportDraft.animal === a ? 'on' : ''}" data-a="${a}">${{ Dog: '🐕', Cat: '🐈', Cow: '🐄', Bird: '🐦', Monkey: '🐒', Other: '🐾' }[a]} ${a}</button>`).join('')}</div>

      <div class="step"><span class="step-n">3</span><h3>What’s wrong? <small class="muted">(pick all that apply)</small></h3></div>
      <div class="chips" id="condChips">${CONDITIONS.map(c => `<button type="button" class="chip ${reportDraft.cond.includes(c) ? 'on' : ''}" data-c="${c}">${c}</button>`).join('')}</div>
      <label>Describe what you see <span class="mic-wrap"><button type="button" class="icon-btn sm" id="micBtn" title="Speak (Hindi/English)">${icon('mic', 16)}</button></span>
        <textarea name="description" id="descIn" rows="3" required placeholder="e.g. Brown dog bleeding from back leg, can’t walk, very scared…">${esc(reportDraft.description || '')}</textarea></label>

      <div class="step"><span class="step-n">4</span><h3>Add photos / video</h3></div>
      <p class="muted small">A clear photo or a 10-second video helps rescuers and vets prepare before they arrive.</p>
      <div class="upload-row">
        <label class="upload-tile">${icon('camera', 26)}<span>Take / add photo</span><input type="file" accept="image/*" capture="environment" multiple hidden id="photoIn"></label>
        <label class="upload-tile">${icon('video', 26)}<span>Record / add video</span><input type="file" accept="video/*" capture="environment" hidden id="videoIn"></label>
        <div class="media-prev" id="mediaPrev"></div>
      </div>

      <div class="step"><span class="step-n">5</span><h3>Your contact</h3></div>
      <div class="grid2"><label>Name<input name="name" value="${esc(me.name)}" required></label><label>Phone<input name="phone" value="${esc(me.phone)}" required></label></div>
      <button class="btn btn-danger full big" id="submitReport">${icon('megaphone', 18)} Send alert to nearby rescuers</button>
    </form>

    <aside class="report-side">
      <div class="card ai-live"><div class="sec-head"><h2>${icon('sparkle', 18)} AI quick steps</h2><span class="badge lvl-moderate" id="lvlBadge">Waiting</span></div>
        <div id="aiLive"><p class="muted">Select what’s wrong — emergency steps will appear here instantly so you can help while a rescuer is on the way.</p>${safetyBlock()}</div>
      </div>
      <div class="card"><h2>Nearest rescuers</h2><div id="nearRescuers">${nearestHelpers(4).map(p => placeRow(p, { message: false })).join('')}</div></div>
    </aside>
  </div>`;
}

function nearestHelpers(n = 4) { return directory().filter(p => ['rescuer', 'ngo'].includes(p.type) && p.hours !== 'Off duty').slice(0, n); }

function bindReport() {
  const d = reportDraft;
  const drawMap = () => {
    const l = d.loc || Geo.current();
    const m = Maps.make('reportMap', { center: l, zoom: 16, showMe: false, fit: false });
    if (m) {
      const mk = L.marker([l.lat, l.lng], { icon: pinIcon('case'), draggable: true }).addTo(m).bindPopup('Drag me to the exact spot').openPopup();
      mk.on('dragend', () => { const p = mk.getLatLng(); d.loc = { lat: p.lat, lng: p.lng }; setLoc(); });
    }
  };
  const setLoc = async () => {
    const l = d.loc || Geo.current();
    $('#locText').innerHTML = `${icon('pin', 16)} <b>${l.lat.toFixed(5)}, ${l.lng.toFixed(5)}</b> ${Geo.loc ? `<small class="muted">(GPS ±${Geo.loc.acc || '?'} m)</small>` : '<small class="muted">(approximate – allow location for accuracy)</small>'}`;
    const a = await Geo.reverse(l);
    if (location.hash.startsWith('#/report') && $('#locText')) $('#locText').innerHTML += `<br><small>${esc(a)}</small>`;
    d.geoAddress = a;
  };
  const getGPS = async () => { $('#locText').innerHTML = `${icon('locate', 16)} Getting your GPS location…`; const l = await Geo.locate(); d.loc = { lat: l.lat, lng: l.lng }; drawMap(); setLoc(); $('#nearRescuers').innerHTML = nearestHelpers(4).map(p => placeRow(p, { message: false })).join(''); };
  if (!d.loc) getGPS(); else { drawMap(); setLoc(); }
  $('#relocate').onclick = getGPS;

  $$('#animalChips .chip').forEach(b => b.onclick = () => { d.animal = b.dataset.a; $$('#animalChips .chip').forEach(x => x.classList.toggle('on', x === b)); });
  $$('#condChips .chip').forEach(b => b.onclick = () => {
    const c = b.dataset.c; d.cond = d.cond.includes(c) ? d.cond.filter(x => x !== c) : [...d.cond, c]; b.classList.toggle('on'); updateAI();
  });
  $('#descIn').oninput = e => { d.description = e.target.value; clearTimeout(d._t); d._t = setTimeout(updateAI, 350); };
  $('#addrIn').oninput = e => { d.address = e.target.value; };

  function updateAI() {
    const txt = (d.description || '') + ' ' + d.cond.map(c => COND_TEXT[c] || c).join(' ') + (d.animal === 'Bird' ? ' bird' : '');
    const tr = AI.triage(txt);
    const b = $('#lvlBadge'); if (!b) return; b.className = 'badge lvl-' + tr.level; b.textContent = { critical: 'Critical', urgent: 'Urgent', moderate: 'Moderate' }[tr.level];
    $('#aiLive').innerHTML = tr.topics.length ? `<p class="small"><b>${tr.label}</b></p>` + tr.topics.slice(0, 2).map(f => firstAidCard(f, true)).join('') + safetyBlock()
      : `<p class="muted">Tell us a little more and we’ll show the right first-aid steps.</p>${safetyBlock()}`;
  }
  if (d.cond.length || d.description) updateAI();

  const renderPrev = () => {
    $('#mediaPrev').innerHTML = d.media.map((m, i) => `<div class="mp">${Media._cache[m]?.type.startsWith('video') ? `<video src="${Media._cache[m].url}" muted></video><span class="vtag">${icon('video', 12)}</span>` : `<img src="${Media._cache[m]?.url}">`}<button type="button" data-rm="${i}">${icon('x', 12)}</button></div>`).join('');
    $$('#mediaPrev [data-rm]').forEach(b => b.onclick = () => { d.media.splice(+b.dataset.rm, 1); renderPrev(); });
  };
  renderPrev();
  const addFiles = async files => { for (const f of files) { if (f.size > 60e6) { toast('Video too large (max 60 MB)', 'warn'); continue; } d.media.push(await Media.put(f)); } renderPrev(); };
  $('#photoIn').onchange = e => addFiles(e.target.files);
  $('#videoIn').onchange = e => addFiles(e.target.files);

  // Voice input (Web Speech API)
  $('#micBtn').onclick = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return toast('Voice input is not supported in this browser (try Chrome).', 'warn');
    const r = new SR(); r.lang = 'en-IN'; r.interimResults = false;
    $('#micBtn').classList.add('rec'); toast('Listening… speak now 🎙️');
    r.onresult = ev => { const t = ev.results[0][0].transcript; $('#descIn').value = ($('#descIn').value + ' ' + t).trim(); d.description = $('#descIn').value; updateAI(); };
    r.onend = () => $('#micBtn')?.classList.remove('rec');
    r.start();
  };

  $('#reportForm').onsubmit = e => {
    e.preventDefault();
    const f = formData(e.target);
    if (!d.cond.length && !f.description) return toast('Please tell us what’s wrong with the animal.', 'warn');
    const loc = d.loc || Geo.current();
    const txt = f.description + ' ' + d.cond.map(c => COND_TEXT[c] || c).join(' ');
    const tr = AI.triage(txt);
    const needs = d.cond.includes('Hungry') && d.cond.length === 1 ? 'Food Needed' : d.cond.includes('Abandoned babies') ? 'Rescue Needed' : tr.level === 'critical' ? 'Urgent' : 'Medical Help';
    const c = {
      id: uid('c'), reporterId: Store.me.id, reporterName: f.name, reporterPhone: f.phone, animal: d.animal,
      title: `${d.cond.includes('Abandoned babies') ? (d.animal === 'Cat' ? 'Kittens' : 'Puppies') + ' (abandoned)' : (d.cond.some(x => ['Bleeding', 'Accident', 'Limping', 'Wound', 'Maggot wound', 'Burns'].includes(x)) ? 'Injured ' : d.cond.length ? 'Sick ' : '') + d.animal}`,
      needs, urgency: tr.level, condition: d.cond, description: f.description || d.cond.join(', '),
      lat: loc.lat, lng: loc.lng, address: [f.address, d.geoAddress].filter(Boolean).join(' — '), media: d.media, createdAt: now(), status: 'reported',
      timeline: [{ status: 'reported', at: now(), note: 'You reported this case' + (d.media.length ? ` with ${d.media.length} photo/video` : ''), by: f.name }],
    };
    c.aiSummary = AI.summary(c);
    Store.db.cases.unshift(c);
    Store.addActivity(Store.me.id, `You reported “${c.title}”`, 'megaphone');
    Store.db.users.filter(u => isRescuerSide(u) && u.id !== Store.me.id).forEach(u => Store.notify(u.id, `🚨 New ${tr.level} case ${Geo.dist({ lat: c.lat, lng: c.lng })} away: ${c.title}`, '#/case/' + c.id));
    Store.save();
    reportDraft = null;
    toast('Alert sent! Nearby rescuers have been notified 🙏');
    location.hash = '#/case/' + c.id;
  };
}

/* ---------- My reports ---------- */
function pageMyReports() {
  const mine = Store.db.cases.filter(c => c.reporterId === Store.me.id).sort((a, b) => b.createdAt - a.createdAt);
  return `<div class="page-head"><div><h1>My Reports</h1><p class="muted">Follow every animal you helped — from report to recovery.</p></div><a class="btn btn-danger" href="#/report">${icon('megaphone', 16)} New report</a></div>
  ${mine.length ? mine.map(c => `<a class="card case-track" href="#/case/${c.id}">${mediaTag(c.media[0], 'thumb lg')}
    <div class="grow"><div class="ct-top"><b>${esc(c.title)}</b>${needBadge(c)}<small class="muted">${timeAgo(c.createdAt)}</small></div>
    <small class="muted">${icon('pin', 13)} ${esc(c.address || 'GPS location')} ${c.rescuerName ? `• ${icon('hand', 13)} ${esc(c.rescuerName)}` : ''}</small>${tracker(c)}</div></a>`).join('')
    : emptyState('megaphone', 'No reports yet', 'When you find an animal in need, report it here — we’ll connect you to rescuers nearby.', '<a class="btn btn-primary" href="#/report">Report an animal</a>')}`;
}

/* ---------- Find nearby help ---------- */
let helpFilter = 'all';
function pageHelp() {
  const list = directory().filter(p => helpFilter === 'all' || p.type === helpFilter || (helpFilter === 'emergency' && p.emergency));
  const st = Geo.status;
  return `<div class="page-head"><div><h1>Find Nearby Help</h1><p class="muted">Verified vets, NGOs, shelters, rescuers & feeders around you.</p></div>
    <button class="btn btn-primary" id="gpsBtn">${icon('locate', 16)} ${Geo.loc ? 'Refresh my location' : 'Use my GPS location'}</button></div>
  ${st === 'denied' ? `<div class="alert warn">${icon('alert', 18)} Location permission is blocked. Click the 🔒 icon in your browser’s address bar → allow Location, then press “Use my GPS location”.</div>` : ''}
  <div class="chips">${[['all', 'All'], ['emergency', '🚨 24×7 Emergency'], ['vet', 'Vets'], ['ngo', 'NGOs'], ['shelter', 'Shelters'], ['rescuer', 'Rescuers'], ['feeder', 'Feeders']].map(([k, l]) => `<button class="chip ${helpFilter === k ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}</div>
  <div class="help-grid">
    <div class="card p0"><div class="map-box tall" id="helpMap"></div><div class="legend">${Object.entries(PLACE_META).map(([k, m]) => `<span><i style="background:${PIN_COLORS[k]}"></i>${m.label}</span>`).join('')}<span><i style="background:${PIN_COLORS.me}"></i>You</span></div></div>
    <div class="card list-scroll">${list.length ? list.map(p => placeRow(p, { full: true })).join('') : emptyState('search', 'Nothing in this filter', 'Try another category.')}</div>
  </div>`;
}
function bindHelp() {
  $$('[data-f]').forEach(b => b.onclick = () => { helpFilter = b.dataset.f; render(); });
  $('#gpsBtn').onclick = async () => { await Geo.locate(); render(); };
  const list = directory().filter(p => helpFilter === 'all' || p.type === helpFilter || (helpFilter === 'emergency' && p.emergency));
  Maps.make('helpMap', { zoom: 13, markers: list.slice(0, 40).map(p => ({ ...p, kind: p.type, popup: `<b>${esc(p.name)}</b><br>${PLACE_META[p.type]?.label} • ${Geo.dist(p)}<br>${p.phone ? `<a href="tel:${p.phone.replace(/\s/g, '')}">📞 ${esc(p.phone)}</a><br>` : ''}<a target="_blank" href="${Geo.directions(p)}">Get directions →</a>` })) });
  if (!Geo.loc && Geo.status === 'idle') Geo.locate({ silent: true }).then(() => { if (location.hash === '#/help') render(); });
}

/* ---------- Veterinary consultation ---------- */
function pageVet(params) {
  const me = Store.me;
  const pets = Store.db.pets.filter(p => p.ownerId === me.id);
  const vets = directory().filter(p => p.type === 'vet');
  const appts = Store.db.appointments.filter(a => a.ownerId === me.id).sort((a, b) => new Date(b.date) - new Date(a.date));
  const sel = params.get('pet');
  const slots = ['10:00', '10:30', '11:30', '12:00', '15:00', '16:30', '17:00', '18:30'];
  return `<div class="page-head"><div><h1>Book Veterinary Consultation</h1><p class="muted">Clinic visit, home visit or video call — your pet’s records are shared automatically.</p></div></div>
  <div class="grid-2-1">
    <form class="card form" id="vetForm">
      <div class="grid2">
        <label>Pet<select name="petId" required>${pets.length ? pets.map(p => `<option value="${p.id}" ${sel === p.id ? 'selected' : ''}>${esc(p.name)} (${esc(p.species)})</option>`).join('') : '<option value="">Add a pet first</option>'}<option value="stray">A stray / rescued animal</option></select></label>
        <label>Veterinarian<select name="vetId" required>${vets.map(v => `<option value="${v.id}">${esc(v.name)} — ${Geo.dist(v)}</option>`).join('')}</select></label>
      </div>
      <p class="label">Consultation type</p>
      <div class="role-pick three">${[['clinic', 'Clinic visit', 'hospital'], ['video', 'Video call', 'video'], ['home', 'Home visit', 'home2']].map(([v, l, ic], i) => `<label class="role-opt"><input type="radio" name="mode" value="${v}" ${i === 0 ? 'checked' : ''}><span>${icon(ic, 22)}${l}</span></label>`).join('')}</div>
      <div class="grid2"><label>Date<input type="date" name="date" required min="${new Date().toISOString().slice(0, 10)}" value="${dateIn(1)}"></label>
      <label>Time<select name="time">${slots.map(s => `<option>${s}</option>`).join('')}</select></label></div>
      <label>What’s the concern?<textarea name="reason" rows="3" required placeholder="Symptoms, since when, eating/drinking normally?"></textarea></label>
      <label>Photos / video of symptoms (optional)<input type="file" name="file" accept="image/*,video/*"></label>
      <label class="check"><input type="checkbox" name="share" checked> Share ${sel ? 'this pet’s' : 'my pet’s'} medical history with the vet</label>
      <button class="btn btn-primary full">${icon('calendar', 16)} Confirm booking</button>
    </form>
    <section class="card">
      <h2>My appointments</h2>
      ${appts.length ? appts.map(a => { const p = Store.db.pets.find(x => x.id === a.petId); const up = daysUntil(a.date) >= 0 && a.status !== 'cancelled'; return `
        <div class="appt ${a.status}"><div class="appt-date"><b>${new Date(a.date).getDate()}</b><small>${new Date(a.date).toLocaleString('en-IN', { month: 'short' })}</small></div>
        <div class="grow"><b>${esc(p?.name || 'Rescued animal')} • ${esc(a.vetName)}</b><small class="muted">${a.time} • ${{ clinic: 'Clinic visit', video: 'Video call', home: 'Home visit' }[a.mode]} • ${a.status}</small><small>${esc(a.reason)}</small>
        ${up ? `<div class="appt-act">${a.mode === 'video' ? `<a class="btn btn-primary sm" target="_blank" rel="noopener" href="https://meet.jit.si/BrunoVerse-${a.id}">${icon('video', 14)} Join video call</a>` : ''}<button class="link red small" data-cancel="${a.id}">Cancel</button></div>` : ''}</div></div>`; }).join('')
      : emptyState('calendar', 'No appointments', 'Book your first consultation.')}
      <div class="tip">${icon('info', 16)} <span>For emergencies don’t wait for a slot — <a href="#/help">call the nearest 24×7 vet</a>.</span></div>
    </section>
  </div>`;
}
function bindVet() {
  $('#vetForm').onsubmit = async e => {
    e.preventDefault();
    const f = formData(e.target);
    const v = directory().find(x => x.id === f.vetId);
    const file = e.target.file.files[0];
    const a = { id: uid('ap'), ownerId: Store.me.id, petId: f.petId, vetId: f.vetId, vetName: v?.name, mode: f.mode, date: f.date, time: f.time, reason: f.reason, file: file ? await Media.put(file) : '', status: 'confirmed', createdAt: now() };
    Store.db.appointments.push(a);
    const pet = Store.db.pets.find(p => p.id === f.petId);
    Store.addActivity(Store.me.id, `Booked a ${f.mode} consultation for ${pet?.name || 'a rescued animal'}`, 'steth');
    Store.notify(Store.me.id, `Appointment confirmed with ${v?.name} on ${fmtDate(f.date)} at ${f.time}`, '#/vet');
    // message thread with the vet including shared summary
    const memberId = v.userId || 'c:' + v.name;
    let th = Store.db.threads.find(t => t.members.includes(Store.me.id) && t.members.includes(memberId));
    if (!th) { th = { id: uid('th'), members: [Store.me.id, memberId], title: v.name, msgs: [] }; Store.db.threads.unshift(th); }
    th.msgs.push({ from: Store.me.id, text: `Booked ${f.mode} consultation for ${pet?.name || 'a rescued animal'} on ${fmtDate(f.date)} ${f.time}. Concern: ${f.reason}${f.share && pet ? `\n\nShared records: ${pet.breed || pet.species}, ${ageText(pet.dob)}, ${pet.weight} kg. Vaccines: ${(pet.vaccinations || []).map(x => x.name).join(', ') || '—'}. Notes: ${pet.notes || '—'}` : ''}`, at: now() });
    th.msgs.push({ from: memberId, text: `Thank you! Your ${f.mode === 'video' ? 'video consultation' : 'appointment'} is confirmed 🐾 ${f.mode === 'video' ? 'Join from “My appointments” at the scheduled time.' : 'Please carry previous prescriptions if any.'}`, at: now() + 1000 });
    Store.save();
    toast('Booking confirmed ✓ The vet has your pet’s details.');
  };
  $$('[data-cancel]').forEach(b => b.onclick = () => { const a = Store.db.appointments.find(x => x.id === b.dataset.cancel); a.status = 'cancelled'; Store.save(); toast('Appointment cancelled'); });
}
