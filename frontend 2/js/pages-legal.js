/* =========================================================
   Privacy Policy, Terms of Use (public) and Admin page
   Edit the operator/contact details in js/config.js
   ========================================================= */
const LEGAL = () => window.BRUNOVERSE_LEGAL || { operator: '[Operator name]', email: '[contact email]', city: '[City, India]', updated: '[date]' };

function legalShell(title, body) {
  const L = LEGAL();
  return `<article class="card legal">
    <a class="back" href="${Store.me ? '#/settings' : '#/login'}">${icon('arrowL', 16)} Back</a>
    <h1>${title}</h1><p class="muted small">Last updated: ${esc(L.updated)} · Operated by ${esc(L.operator)}, ${esc(L.city)}</p>
    ${body}
    <p class="muted small">Questions? Write to <b>${esc(L.email)}</b>.</p>
  </article>`;
}

function pagePrivacy() {
  const L = LEGAL();
  return legalShell('Privacy Policy', `
    <p>BrunoVerse helps people get help for animals. This policy explains what we collect, why, who can see it and how you control it. We follow India’s Digital Personal Data Protection Act, 2023.</p>
    <h2>What we collect</h2>
    <ul>
      <li><b>Account details:</b> name, email, phone number, city, account type and an optional photo.</li>
      <li><b>Location:</b> your GPS position when you report an animal or open “Find Help”, and, for rescuers/vets/NGOs/feeders who are marked available, an approximate location so people nearby can find them.</li>
      <li><b>Reports:</b> photos, videos, descriptions and the location of animals you report, and updates on the rescue.</li>
      <li><b>Pet records:</b> profiles, vaccinations, medical records and reminders you add.</li>
      <li><b>Messages and community posts</b> you send or publish.</li>
    </ul>
    <h2>Why we use it</h2>
    <ul>
      <li>To connect an animal in need with the nearest rescuers, vets and NGOs.</li>
      <li>To show rescue progress to the person who reported it.</li>
      <li>To keep your pets’ health records and remind you of vaccinations.</li>
      <li>To keep the platform safe (preventing fake reports and misuse).</li>
    </ul>
    <p>We do not sell your data and we do not show ads.</p>
    <h2>Who can see what</h2>
    <ul>
      <li>When you report an animal, the case details, its location and your name and phone number are visible to logged-in rescuers, vets and NGOs, so they can reach you.</li>
      <li>If you register as a rescuer, vet, NGO or feeder and stay “Available”, your name, phone and approximate location are shown in the help directory. Turn “Available” off in Settings to hide them.</li>
      <li>Your pets, appointments, notifications and private messages are visible only to you and the people in that conversation.</li>
      <li>Community posts are visible to all users.</li>
    </ul>
    <h2>Storage and security</h2>
    <p>Data is stored on secure cloud servers. Passwords are stored only as encrypted hashes. Photos and videos you upload are stored with the case or record they belong to.</p>
    <h2>How long we keep it</h2>
    <p>We keep your data while your account is active. Resolved rescue cases may be kept to show the community’s impact, without your contact details once the case is closed for more than 12 months. When you delete your account we erase your personal data within 30 days, except where the law requires us to keep it.</p>
    <h2>Your rights</h2>
    <p>You can ask to access, correct or erase your personal data, withdraw consent, and nominate someone to exercise these rights for you. Email <b>${esc(L.email)}</b>. We reply within 30 days.</p>
    <h2>Grievance officer</h2>
    <p>${esc(L.operator)} — <b>${esc(L.email)}</b>. If you are not satisfied with our reply, you may approach the Data Protection Board of India.</p>
    <h2>Children</h2>
    <p>BrunoVerse is for people aged 18 and over. Younger users may use it only with the consent of a parent or guardian.</p>
    <h2>Browser storage</h2>
    <p>We store your login and some settings in your browser so the app works quickly and offline. We do not use advertising or tracking cookies.</p>
    <h2>Changes</h2>
    <p>If we change this policy we will update the date above and tell you in the app.</p>`);
}

function pageTerms() {
  const L = LEGAL();
  return legalShell('Terms of Use', `
    <div class="alert warn">${icon('alert', 18)} BrunoVerse is not an emergency service. If a person is in danger, call 112. For an animal in a life-threatening condition, also call the nearest vet or animal ambulance directly.</div>
    <h2>1. What BrunoVerse is</h2>
    <p>BrunoVerse is a free platform that connects people who find animals in need with volunteer rescuers, veterinarians, NGOs and shelters, and helps pet owners keep health records.</p>
    <h2>2. First-aid guidance is not veterinary advice</h2>
    <p>The AI first-aid assistant gives general guidance for emergencies. It is not a diagnosis or treatment and does not replace a qualified veterinarian. Always get the animal checked by a vet.</p>
    <h2>3. Rescuers, vets and NGOs</h2>
    <p>Rescuers and organisations on BrunoVerse are independent. A <b>Verified</b> badge means we checked their identity or registration documents; it is not a guarantee of their service. BrunoVerse does not guarantee that someone will respond to a report or how quickly.</p>
    <h2>4. Your responsibilities</h2>
    <ul>
      <li>Give true information. Do not make false or prank reports.</li>
      <li>Put your own safety first. Do not enter traffic or handle an aggressive animal.</li>
      <li>Do not post content showing cruelty for entertainment, or anything illegal, abusive or misleading.</li>
      <li>Do not use other people’s phone numbers or data for anything other than helping the animal.</li>
      <li>Keep your password private.</li>
    </ul>
    <h2>5. Content you share</h2>
    <p>You keep ownership of photos, videos and posts you share. You allow BrunoVerse to show them to other users to help the animal and to share rescue stories, without your contact details.</p>
    <h2>6. Accounts</h2>
    <p>We may suspend accounts that make false reports, misuse contact details or break these terms.</p>
    <h2>7. Liability</h2>
    <p>BrunoVerse is provided “as is”. To the extent the law allows, ${esc(L.operator)} is not liable for injury, loss or costs arising from rescues, treatment, or information shared by users.</p>
    <h2>8. Law</h2>
    <p>These terms are governed by the laws of India. Courts in ${esc(L.city)} have jurisdiction.</p>`);
}

/* ---------- Admin: verify organisations and helpers ---------- */
function pageAdmin() {
  if (!Api.admin) return emptyState('shield', 'Admins only', 'Add your email to ADMIN_EMAILS on the server to get access.');
  const pendingPlaces = Store.db.places.filter(p => !p.verified && !p.osm);
  const pendingUsers = Store.db.users.filter(u => ['rescuer', 'vet', 'ngo', 'feeder'].includes(u.role) && !u.verified);
  const byRole = r => Store.db.users.filter(u => u.role === r).length;
  const cases = s => Store.db.cases.filter(c => c.status === s).length;
  return `<div class="page-head"><div><h1>${icon('shield', 26)} Admin</h1><p class="muted">Check documents or call before verifying. Verified helpers get a ✓ badge.</p></div>
    <button class="btn btn-primary" id="addOrg">${icon('plus', 16)} Add verified organisation</button></div>
  <section class="stats4">
    <div class="stat c-mint"><div><small>Pet owners</small><b>${byRole('owner')}</b></div></div>
    <div class="stat c-blue"><div><small>Rescuers · Vets · NGOs</small><b>${byRole('rescuer') + byRole('vet') + byRole('ngo')}</b></div></div>
    <div class="stat c-pink"><div><small>Open cases</small><b>${Store.db.cases.length - cases('resolved')}</b></div></div>
    <div class="stat c-lav"><div><small>Resolved cases</small><b>${cases('resolved')}</b></div></div>
  </section>
  <section class="card"><h2>People waiting for verification (${pendingUsers.length})</h2>
    ${pendingUsers.length ? pendingUsers.map(u => `<div class="place-row">${avatar(u, 40)}<div class="grow"><b>${esc(u.name)}</b><small>${ROLE_LABEL[u.role]} • ${esc(u.city || '')} • ${esc(u.phone || '')}</small></div>
      <div class="row-actions"><button class="btn btn-primary sm" data-vuser="${u.id}">${icon('check', 14)} Verify</button></div></div>`).join('') : '<p class="muted">Nobody waiting.</p>'}
  </section>
  <section class="card"><h2>Organisations waiting for verification (${pendingPlaces.length})</h2>
    ${pendingPlaces.length ? pendingPlaces.map(p => `<div class="place-row"><span class="place-ic c-${(PLACE_META[p.type] || PLACE_META.vet).color}">${icon((PLACE_META[p.type] || PLACE_META.vet).ic, 20)}</span><div class="grow"><b>${esc(p.name)}</b><small>${(PLACE_META[p.type] || PLACE_META.vet).label} • ${esc(p.phone || '')} • ${esc(p.services || '')}</small></div>
      <div class="row-actions"><button class="btn btn-primary sm" data-vplace="${p.id}">${icon('check', 14)} Verify</button><button class="btn btn-ghost sm red" data-dplace="${p.id}">Remove</button></div></div>`).join('') : '<p class="muted">Nothing waiting.</p>'}
  </section>`;
}
function bindAdmin() {
  $$('[data-vuser]').forEach(b => b.onclick = () => { const u = Store.user(b.dataset.vuser); u.verified = true; Store.save(); toast(`${esc(u.name)} verified ✓`); });
  $$('[data-vplace]').forEach(b => b.onclick = () => { const p = Store.db.places.find(x => x.id === b.dataset.vplace); p.verified = true; Store.save(); toast(`${esc(p.name)} verified ✓`); });
  $$('[data-dplace]').forEach(b => b.onclick = () => askConfirm('Remove this organisation from BrunoVerse?', 'Remove', () => { Store.db.places = Store.db.places.filter(x => x.id !== b.dataset.dplace); Store.save(); }));
  $('#addOrg')?.addEventListener('click', () => {
    const { el, close } = openModal(`<h2>Add a verified organisation</h2><p class="muted small">Use the address search on Google Maps, right-click the exact spot and copy the two numbers (latitude, longitude).</p>
      <form class="form" id="admOrg"><div class="grid2"><label>Name<input name="name" required></label><label>Type<select name="type"><option value="vet">Veterinary clinic</option><option value="ngo">NGO</option><option value="shelter">Shelter</option><option value="rescuer">Rescue group</option><option value="feeder">Feeding group</option></select></label></div>
      <div class="grid2"><label>Phone<input name="phone" required></label><label>Hours<input name="hours" placeholder="9 AM – 9 PM or 24 × 7"></label></div>
      <label>Services<input name="services" placeholder="OPD, Surgery, Ambulance…"></label>
      <label>Latitude, longitude<input name="ll" required placeholder="28.5706, 77.3261" pattern="\\s*-?\\d+(\\.\\d+)?\\s*,\\s*-?\\d+(\\.\\d+)?\\s*"></label>
      <label class="check"><input type="checkbox" name="emergency"> Handles emergencies 24 × 7</label>
      <button class="btn btn-primary full">Add & verify</button></form>`);
    $('#admOrg', el).onsubmit = e => {
      e.preventDefault(); const f = formData(e.target); const [lat, lng] = f.ll.split(',').map(x => +x.trim());
      Store.db.places.push({ id: uid('p'), type: f.type, name: f.name, phone: f.phone, hours: f.hours, services: f.services, emergency: !!f.emergency, lat, lng, verified: true, rating: null });
      Store.save(); close(); toast('Organisation added ✓');
    };
  });
}
