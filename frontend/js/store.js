/* =========================================================
   BrunoVerse data layer
   - App data  -> localStorage  (shared across tabs: open Owner in one
                  tab and Rescuer in another and they update live)
   - Login     -> sessionStorage (each tab can be a different user)
   - Photos/videos -> IndexedDB (large files)
   In production this maps 1:1 to Spring Boot REST + MySQL tables.
   ========================================================= */

const DB_KEY = 'bv_db_v2';
const SESSION_KEY = 'bv_session';
const DEFAULT_LOC = { lat: 28.5700, lng: 77.3260 }; // Noida (used until GPS is allowed)

// Natural animal photos (Unsplash, loaded at runtime). Any image that fails falls back to a soft paw placeholder.
const PHOTOS = {
  bruno: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=70&auto=format&fit=crop',
  misty: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&q=70&auto=format&fit=crop',
  injuredDog: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=70&auto=format&fit=crop',
  strayCat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=70&auto=format&fit=crop',
  cow: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400&q=70&auto=format&fit=crop',
  puppies: 'https://images.unsplash.com/photo-1591160690555-5debfba289f0?w=400&q=70&auto=format&fit=crop',
  puppy: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=70&auto=format&fit=crop',
  feeding: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=70&auto=format&fit=crop',
  adoptCat: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=400&q=70&auto=format&fit=crop',
  heroOwner: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=900&q=70&auto=format&fit=crop',
  heroRescuer: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=900&q=70&auto=format&fit=crop',
  story1: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=500&q=70&auto=format&fit=crop',
  story2: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=500&q=70&auto=format&fit=crop',
};

const uid = (p = 'id') => p + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const now = () => Date.now();
const H = 3600e3, D = 24 * H;

/* ---------------- Seed data ---------------- */
function seedData() {
  const t = now();
  // dLat/dLng are offsets from the user's location so the demo is always "nearby"
  const places = [
    { id: 'p1', type: 'vet', name: "Dr. Sharma's Pet Clinic", phone: '+91 90000 11001', dLat: 0.0085, dLng: 0.0052, hours: '9 AM – 9 PM', verified: true, services: 'OPD, Vaccination, Surgery', rating: 4.8, emergency: true },
    { id: 'p2', type: 'vet', name: 'Dr. Mehta Veterinary Hospital', phone: '+91 90000 11002', dLat: -0.0155, dLng: 0.0121, hours: '24 × 7', verified: true, services: 'Emergency, X-Ray, ICU', rating: 4.7, emergency: true },
    { id: 'p3', type: 'shelter', name: 'Happy Paws Shelter', phone: '+91 90000 11003', dLat: 0.0201, dLng: -0.0098, hours: '8 AM – 7 PM', verified: true, services: 'Shelter, Adoption, Foster', rating: 4.6 },
    { id: 'p4', type: 'ngo', name: 'Paw Care Foundation', phone: '+91 90000 11004', dLat: -0.0242, dLng: -0.0187, hours: '24 × 7 helpline', verified: true, services: 'Rescue, Ambulance, Sterilisation', rating: 4.9, emergency: true },
    { id: 'p5', type: 'rescuer', name: 'Rohan (Volunteer)', phone: '+91 90000 11005', dLat: 0.0282, dLng: 0.0113, hours: 'Evenings', verified: true, services: 'Feeder / Rescuer', rating: 4.8 },
    { id: 'p6', type: 'rescuer', name: 'Priya – Street Paws Squad', phone: '+91 90000 11006', dLat: -0.0091, dLng: -0.0224, hours: '7 AM – 11 PM', verified: true, services: 'Rescue, First Aid, Transport', rating: 4.9, emergency: true },
    { id: 'p7', type: 'ngo', name: 'City Animal Ambulance', phone: '+91 90000 11007', dLat: 0.0365, dLng: -0.0305, hours: '24 × 7', verified: true, services: 'Animal ambulance', rating: 4.5, emergency: true },
    { id: 'p8', type: 'feeder', name: 'Gentle Hearts Feeders', phone: '+91 90000 11008', dLat: 0.0123, dLng: 0.0287, hours: '6 – 9 PM', verified: false, services: 'Daily feeding, Water bowls', rating: 4.4 },
    { id: 'p9', type: 'vet', name: 'Care & Cure Animal Clinic', phone: '+91 90000 11009', dLat: -0.0322, dLng: 0.0254, hours: '10 AM – 8 PM', verified: true, services: 'OPD, Dental, Grooming', rating: 4.3 },
  ];

  const users = [
    { id: 'u_anushka', name: 'Anushka Gupta', email: 'anushka@demo.in', password: 'demo123', phone: '+91 90000 00001', role: 'owner', city: 'Noida', avatar: '', joined: t - 120 * D },
    { id: 'u_rohit', name: 'Rohit Sharma', email: 'rohit@demo.in', password: 'demo123', phone: '+91 90000 00002', role: 'rescuer', city: 'Noida', avatar: '', joined: t - 400 * D, available: true, verified: true, baseCompleted: 11, baseHelped: 13, dLat: 0.0061, dLng: -0.0072 },
  ];

  const tl = (status, at, note, by) => ({ status, at, note, by });
  const cases = [
    { id: 'c1', reporterId: 'u_other1', reporterName: 'Kavya M.', reporterPhone: '+91 90000 22001', animal: 'Dog', title: 'Injured Dog', needs: 'Urgent', urgency: 'critical',
      condition: ['Bleeding', 'Limping'], description: 'Brown street dog with a deep cut on the back leg, bleeding slightly and not putting weight on it. Very scared, hiding under a parked car.',
      dLat: 0.0108, dLng: 0.0004, address: 'Near Market Road, opposite the bakery', media: [PHOTOS.injuredDog], createdAt: t - 35 * 60e3, status: 'reported', timeline: [tl('reported', t - 35 * 60e3, 'Case reported with photo', 'Kavya M.')] },
    { id: 'c2', reporterId: 'u_other2', reporterName: 'Aman V.', reporterPhone: '+91 90000 22002', animal: 'Cat', title: 'Stray Cat (sick)', needs: 'Medical Help', urgency: 'urgent',
      condition: ['Not eating', 'Eye infection'], description: 'Young cat with swollen eyes and discharge, very weak and not eating since yesterday.',
      dLat: -0.0285, dLng: 0.0141, address: 'Residential Block C, near the park gate', media: [PHOTOS.strayCat], createdAt: t - 2.5 * H, status: 'reported', timeline: [tl('reported', t - 2.5 * H, 'Case reported', 'Aman V.')] },
    { id: 'c3', reporterId: 'u_other3', reporterName: 'Sunita R.', reporterPhone: '+91 90000 22003', animal: 'Cow', title: 'Cow (injured)', needs: 'Needs Shelter', urgency: 'urgent',
      condition: ['Wound', 'Weak'], description: 'Cow with a wound on the neck (possibly from a plastic rope). Sitting by the roadside, needs shelter and treatment.',
      dLat: 0.0402, dLng: -0.0221, address: 'Service road, near the flyover', media: [PHOTOS.cow], createdAt: t - 5 * H, status: 'reported', timeline: [tl('reported', t - 5 * H, 'Case reported', 'Sunita R.')] },
    { id: 'c4', reporterId: 'u_other4', reporterName: 'Neha K.', reporterPhone: '+91 90000 22004', animal: 'Dog', title: 'Puppies (abandoned)', needs: 'Food Needed', urgency: 'moderate',
      condition: ['Abandoned', 'Hungry'], description: 'Four puppies (~5 weeks) left in a cardboard box. Mother not around. They look hungry but active.',
      dLat: -0.0485, dLng: -0.0362, address: 'Behind the metro station parking', media: [PHOTOS.puppies], createdAt: t - 8 * H, status: 'reported', timeline: [tl('reported', t - 8 * H, 'Case reported', 'Neha K.')] },
    { id: 'c5', reporterId: 'u_anushka', reporterName: 'Anushka Gupta', reporterPhone: '+91 90000 00001', animal: 'Dog', title: 'Stray puppy with injured paw', needs: 'Rescue Needed', urgency: 'urgent',
      condition: ['Limping', 'Wound'], description: 'Small puppy near the community park with an injured front paw. Gave water and kept it in shade.',
      dLat: 0.0052, dLng: -0.0081, address: 'Community park, Gate 2', media: [PHOTOS.puppy], createdAt: t - 70 * 60e3, status: 'on_the_way', rescuerId: 'u_rohit', rescuerName: 'Rohit Sharma', rescuerPhone: '+91 90000 00002',
      timeline: [tl('reported', t - 70 * 60e3, 'You reported this case', 'Anushka Gupta'), tl('accepted', t - 55 * 60e3, 'Rohit accepted your request', 'Rohit Sharma'), tl('on_the_way', t - 40 * 60e3, 'Rohit is on the way with a first-aid kit', 'Rohit Sharma')] },
    { id: 'c6', reporterId: 'u_other5', reporterName: 'Vikram S.', reporterPhone: '+91 90000 22005', animal: 'Dog', title: 'Injured Dog', needs: 'Resolved', urgency: 'urgent',
      condition: ['Accident'], description: 'Hit by a bike, minor injuries.', dLat: 0.0151, dLng: 0.0201, address: 'Main crossing', media: [PHOTOS.story2], createdAt: t - 26 * H, status: 'resolved', rescuerId: 'u_rohit', rescuerName: 'Rohit Sharma',
      timeline: [tl('reported', t - 26 * H, 'Reported', 'Vikram S.'), tl('accepted', t - 25.5 * H, 'Accepted', 'Rohit Sharma'), tl('resolved', t - 2 * H, 'Treated at Dr. Mehta Hospital & released after recovery', 'Rohit Sharma')] },
  ];

  const pets = [
    { id: 'pet_bruno', ownerId: 'u_anushka', name: 'Bruno', species: 'Dog', breed: 'Golden Retriever', gender: 'Male', dob: '2023-06-12', weight: 29, color: 'Golden', photo: PHOTOS.bruno, health: 'Healthy', microchip: '9810 2233 4455',
      notes: 'Loves fetch, scared of fireworks. Allergic to chicken.',
      vaccinations: [
        { id: uid('v'), name: 'Rabies', date: '2025-11-03', due: dateIn(12), },
        { id: uid('v'), name: 'DHPPi (5-in-1)', date: '2026-02-10', due: '2027-02-10' },
        { id: uid('v'), name: 'Leptospirosis', date: '2026-02-10', due: '2027-02-10' },
      ],
      records: [
        { id: uid('r'), date: '2026-08-14', type: 'Checkup', title: 'Annual health check', vet: "Dr. Sharma's Pet Clinic", notes: 'All vitals normal. Weight 29 kg. Teeth cleaning advised.' },
        { id: uid('r'), date: '2026-05-02', type: 'Treatment', title: 'Ear infection', vet: "Dr. Sharma's Pet Clinic", notes: 'Ear drops for 7 days. Fully recovered.' },
        { id: uid('r'), date: '2026-03-20', type: 'Deworming', title: 'Deworming tablet', vet: 'Home', notes: 'Drontal Plus – 1 tab' },
      ],
      reminders: [{ id: uid('rm'), title: 'Vet Checkup', due: dateIn(60), icon: 'calendar' }] },
    { id: 'pet_misty', ownerId: 'u_anushka', name: 'Misty', species: 'Cat', breed: 'Indian Tabby', gender: 'Female', dob: '2024-07-01', weight: 3.8, color: 'Grey tabby', photo: PHOTOS.misty, health: 'Next Vaccination in 2 months',
      notes: 'Indoor cat. Rescued from our building parking in 2024 💛',
      vaccinations: [{ id: uid('v'), name: 'FVRCP', date: '2025-12-20', due: dateIn(58) }],
      records: [{ id: uid('r'), date: '2026-01-15', type: 'Surgery', title: 'Spay surgery', vet: 'Dr. Mehta Veterinary Hospital', notes: 'Healed well, stitches removed after 10 days.' }],
      reminders: [{ id: uid('rm'), title: 'Deworming', due: dateIn(30), icon: 'pill' }] },
  ];

  const appointments = [
    { id: 'ap1', ownerId: 'u_anushka', petId: 'pet_bruno', vetId: 'p1', vetName: "Dr. Sharma's Pet Clinic", mode: 'clinic', date: dateIn(3), time: '11:30', reason: 'Teeth cleaning & general checkup', status: 'confirmed', createdAt: t - 2 * D },
  ];

  const threads = [
    { id: 'th1', members: ['u_rohit', 'c:Dr. Mehta (Veterinarian)'], title: 'Dr. Mehta (Veterinarian)', avatar: 'DM', msgs: [
      { from: 'c:Dr. Mehta (Veterinarian)', text: 'Hi Rohit, thanks for bringing the dog in yesterday. He is recovering well.', at: t - 3 * H },
      { from: 'c:Dr. Mehta (Veterinarian)', text: 'Can you share the photos of the injured dog from Market Road?', at: t - 2 * 60e3 }] },
    { id: 'th2', members: ['u_rohit', 'c:Paw Care Foundation (NGO)'], title: 'Paw Care Foundation (NGO)', avatar: 'PC', msgs: [
      { from: 'u_rohit', text: 'We found a cow with a neck wound near the flyover. Any shelter space?', at: t - 2 * H },
      { from: 'c:Paw Care Foundation (NGO)', text: 'We can provide a temporary shelter if needed.', at: t - 1 * H }] },
    { id: 'th3', members: ['u_rohit', 'c:Volunteer Group'], title: 'Volunteer Group', avatar: 'VG', msgs: [
      { from: 'c:Volunteer Group', text: '3 more volunteers are available today.', at: t - 3 * H }] },
    { id: 'th4', members: ['u_anushka', 'u_rohit'], caseId: 'c5', title: 'Rescue: Stray puppy', msgs: [
      { from: 'u_rohit', text: 'Hi Anushka, I have accepted your request. Please stay near the puppy if you can 🙏', at: t - 54 * 60e3 },
      { from: 'u_anushka', text: 'Thank you so much! I have given it some water and kept it in the shade.', at: t - 50 * 60e3 },
      { from: 'u_rohit', text: 'Perfect. I am on my way, ~10 minutes.', at: t - 40 * 60e3 }] },
    { id: 'th5', members: ['u_anushka', "c:Dr. Sharma's Pet Clinic"], title: "Dr. Sharma's Pet Clinic", avatar: 'DS', msgs: [
      { from: "c:Dr. Sharma's Pet Clinic", text: 'Your appointment for Bruno is confirmed. See you soon! 🐾', at: t - 2 * D }] },
  ];

  const posts = [
    { id: 'po1', author: 'Riya S.', text: 'Found a stray puppy near Sector 12. Very friendly but has a small wound on the ear. Anyone nearby who can help?', tag: 'Rescue Needed', image: PHOTOS.puppy, at: t - 2 * H, likes: 24, comments: 6 },
    { id: 'po2', author: 'Arjun P.', text: 'Looking for a good vet for my cat — she has been sneezing for 3 days. Urgent please!', tag: 'Medical Help', image: PHOTOS.strayCat, at: t - 4 * H, likes: 11, comments: 9 },
    { id: 'po3', author: 'Gentle Hearts Feeders', text: 'Feeding drive at City Park today 6 PM. Bring rice, curd & clean water bowls. Everyone welcome! 🍚', tag: 'Feeding', image: PHOTOS.feeding, at: t - 6 * H, likes: 58, comments: 14 },
    { id: 'po4', author: 'Happy Paws Shelter', text: 'Meet Daisy 💛 3 months old, vaccinated and litter trained. Looking for a forever home.', tag: 'Adoption', image: PHOTOS.adoptCat, at: t - 8 * H, likes: 92, comments: 21 },
  ];

  const activity = [
    { userId: 'u_rohit', text: 'You marked the case “Injured Dog” as resolved', at: t - 2 * H, icon: 'check' },
    { userId: 'u_rohit', text: 'You contacted NGO “Paw Care Foundation”', at: t - 4 * H, icon: 'msg' },
    { userId: 'u_rohit', text: 'You updated the status for “Stray Cat (sick)”', at: t - 5 * H, icon: 'edit' },
    { userId: 'u_rohit', text: 'You completed a rescue near the main crossing', at: t - 1 * D, icon: 'heart' },
    { userId: 'u_anushka', text: 'You reported “Stray puppy with injured paw”', at: t - 70 * 60e3, icon: 'megaphone' },
    { userId: 'u_anushka', text: 'Booked a consultation for Bruno', at: t - 2 * D, icon: 'steth' },
  ];

  const notifications = [
    { id: uid('n'), userId: 'u_anushka', text: 'Rohit is on the way to the puppy you reported 🚶', at: t - 40 * 60e3, read: false, link: '#/reports' },
    { id: uid('n'), userId: 'u_anushka', text: "Bruno's Rabies vaccine is due in 12 days", at: t - 5 * H, read: false, link: '#/pets' },
    { id: uid('n'), userId: 'u_rohit', text: 'New urgent case 1.2 km away: Injured Dog', at: t - 35 * 60e3, read: false, link: '#/requests' },
  ];

  activity.forEach(a => { a.id = uid('a'); });
  return {
    version: 2, anchor: null, users, places, cases, pets, appointments, threads, posts, activity, notifications,
    signups: [], teams: [], orgRequests: [],
    settings: { aiKey: '', aiModel: 'gemini-2.0-flash' },
  };
}

function dateIn(days) { const d = new Date(Date.now() + days * D); return d.toISOString().slice(0, 10); }

/* ---------------- Store ---------------- */
const Store = {
  db: null,
  listeners: new Set(),
  load() {
    try { this.db = JSON.parse(localStorage.getItem(DB_KEY)); } catch (e) { this.db = null; }
    if (!this.db || this.db.version !== 2) { this.db = seedData(); this.save(false); }
    this.relocate(this.db.anchor || DEFAULT_LOC, false);
  },
  save(notify = true) {
    try { localStorage.setItem(DB_KEY, JSON.stringify(this.db)); }
    catch (e) { console.warn('Save failed', e); toast('Storage is full — try removing some photos/videos.', 'error'); }
    if (typeof Api !== 'undefined') Api.changed();
    if (notify) this.emit();
  },
  reset() { try { localStorage.removeItem(DB_KEY); } catch (e) {} this.load(); },
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  emit() { this.listeners.forEach(fn => { try { fn(); } catch (e) { console.error(e); } }); },

  // Place seeded items (which have dLat/dLng offsets) around a location
  relocate(loc, save = true) {
    const all = [...this.db.places, ...this.db.cases, ...this.db.users];
    all.forEach(o => { if (o.dLat !== undefined) { o.lat = +(loc.lat + o.dLat).toFixed(6); o.lng = +(loc.lng + o.dLng).toFixed(6); } });
    this.db.anchor = { lat: loc.lat, lng: loc.lng, gps: !!loc.gps };
    if (save) this.save(false);
  },

  /* session */
  _sid: null,
  get me() { let id = this._sid; try { id = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || id; } catch (e) {} return this.db.users.find(u => u.id === id) || null; },
  login(id, remember = true) { this._sid = id; try { sessionStorage.setItem(SESSION_KEY, id); if (remember) localStorage.setItem(SESSION_KEY, id); } catch (e) {} },
  logout() { if (typeof Api !== 'undefined' && Api.token) Api.clearToken(); this._sid = null; try { sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); } catch (e) {} },
  user(id) { return this.db.users.find(u => u.id === id); },

  addActivity(userId, text, icon = 'paw') { this.db.activity.unshift({ id: uid('a'), userId, text, at: now(), icon }); },
  notify(userId, text, link = '#/home') { this.db.notifications.unshift({ id: uid('n'), userId, text, at: now(), read: false, link }); },
};

/* ---------------- Media (IndexedDB) ---------------- */
const Media = {
  _db: null, _cache: {},
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('bv_media', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('files');
      r.onsuccess = () => { this._db = r.result; res(this._db); };
      r.onerror = () => rej(r.error);
    });
  },
  async put(file) {
    // Cloudinary (free hosting): upload straight from the browser, everyone gets a permanent URL
    const cl = window.BRUNOVERSE_CLOUDINARY;
    if (cl && cl.cloudName && cl.uploadPreset) {
      try {
        const fd = new FormData(); fd.append('file', file); fd.append('upload_preset', cl.uploadPreset); fd.append('folder', 'brunoverse');
        const r = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cl.cloudName)}/auto/upload`, { method: 'POST', body: fd });
        const j = await r.json();
        if (!r.ok || !j.secure_url) throw new Error(j.error?.message || 'Upload failed');
        this._cache[j.secure_url] = { url: URL.createObjectURL(file), type: file.type };
        return j.secure_url;
      } catch (e) { console.warn('Cloudinary upload failed', e); toast('Photo/video upload failed: ' + esc(e.message), 'warn'); }
    }
    // With the backend running, upload so rescuers on other devices can see the photo/video
    if (typeof Api !== 'undefined' && Api.online) {
      try {
        const url = await Api.upload(file);
        this._cache[url] = { url: URL.createObjectURL(file), type: file.type };
        return url;
      } catch (e) { console.warn('Upload failed, keeping file on this device', e); }
    }
    const id = 'media:' + uid('m');
    const db = await this.open();
    await new Promise((res, rej) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put({ blob: file, type: file.type, name: file.name }, id); tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
    this._cache[id] = { url: URL.createObjectURL(file), type: file.type };
    return id;
  },
  async get(id) {
    if (this._cache[id]) return this._cache[id];
    const db = await this.open();
    const rec = await new Promise(res => { const r = db.transaction('files').objectStore('files').get(id); r.onsuccess = () => res(r.result); r.onerror = () => res(null); });
    if (!rec) return null;
    this._cache[id] = { url: URL.createObjectURL(rec.blob), type: rec.type };
    return this._cache[id];
  },
  isVideo(ref) { return typeof ref === 'string' && (this._cache[ref]?.type || '').startsWith('video'); },
};

// Fill <img data-media> / <video data-media> elements after render
async function hydrateMedia(root = document) {
  const els = root.querySelectorAll('[data-media]');
  for (const el of els) {
    const ref = el.getAttribute('data-media');
    if (!ref) continue;
    if (!ref.startsWith('media:')) { if (!el.src) el.src = ref; continue; }
    const m = await Media.get(ref).catch(() => null);
    if (!m) continue;
    if (m.type.startsWith('video') && el.tagName === 'IMG') {
      const v = document.createElement('video');
      v.src = m.url; v.className = el.className; v.muted = true; v.playsInline = true; v.controls = el.hasAttribute('data-controls');
      if (!v.controls) { v.loop = true; v.autoplay = true; }
      el.replaceWith(v);
    } else el.src = m.url;
  }
}

// Soft fallback for images that fail to load (offline / blocked)
const FALLBACK_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4ead8"/><stop offset="1" stop-color="#e3efe0"/></linearGradient></defs><rect width="200" height="160" fill="url(#g)"/><g fill="#9bb89f" transform="translate(70 45)"><circle cx="10" cy="28" r="9"/><circle cx="24" cy="10" r="9"/><circle cx="46" cy="10" r="9"/><circle cx="60" cy="28" r="9"/><path d="M35 34c-12 0-24 15-24 25 0 8 7 11 13 11 4 0 7-2 11-2s7 2 11 2c6 0 13-3 13-11 0-10-12-25-24-25z"/></g></svg>');
document.addEventListener('error', e => {
  const el = e.target;
  if (el && el.tagName === 'IMG' && !el.dataset.fallback) { el.dataset.fallback = '1'; el.src = FALLBACK_IMG; }
}, true);
