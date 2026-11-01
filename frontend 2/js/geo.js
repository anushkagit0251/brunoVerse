/* =========================================================
   GPS + maps (Leaflet / OpenStreetMap) + real nearby places (Overpass API)
   ========================================================= */
const Geo = {
  loc: null,          // {lat,lng,acc,gps}
  watchId: null,
  status: 'idle',     // idle | asking | ok | denied | unavailable

  current() { return this.loc || Store.db.anchor || DEFAULT_LOC; },

  lastError: '',

  // Ask the browser for the user's real location: precise GPS first, then a quicker Wi-Fi/network fix
  locate({ silent = false } = {}) {
    return new Promise(resolve => {
      if (!('geolocation' in navigator) || !window.isSecureContext) {
        this.status = 'unavailable';
        this.lastError = 'Location only works on https:// pages. Open the https link of BrunoVerse.';
        if (!silent) toast(this.lastError, 'warn');
        resolve(this.current()); return;
      }
      this.status = 'asking';
      const ok = pos => {
        this.status = 'ok'; this.lastError = '';
        this.loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: Math.round(pos.coords.accuracy), gps: true };
        const a = Store.db.anchor;
        // Re-anchor demo data around the real location (first fix or moved > 5 km)
        if (!a || !a.gps || this.km(a, this.loc) > 5) { Store.relocate(this.loc); if (typeof Api !== 'undefined') Api.saveAnchor(Store.db.anchor); }
        if (!silent) toast(`📍 Location found (±${this.loc.acc} m)`);
        this.fetchRealPlaces(this.loc);
        resolve(this.loc);
      };
      const fail = err => {
        this.status = err.code === 1 ? 'denied' : 'unavailable';
        const mac = /Mac/.test(navigator.platform || navigator.userAgent);
        this.lastError = err.code === 1
          ? 'Location permission is blocked. Tap the 🔒 / ⓘ icon next to the web address → Location → Allow, then press “Use my current location” again.'
          : err.code === 3
            ? 'Finding your location took too long. Turn on Wi-Fi or move near a window and try again, or search the place / drag the pin.'
            : (mac ? 'Your Mac could not find its location. Turn on System Settings → Privacy & Security → Location Services, and allow your browser there.'
                   : 'Your phone could not find its location. Turn on Location (GPS) in your phone settings and try again.');
        if (!silent) toast(this.lastError, 'warn');
        resolve(this.current());
      };
      navigator.geolocation.getCurrentPosition(ok, err => {
        if (err.code === 1) return fail(err);
        // Retry without high accuracy (laptops have no GPS chip; Wi-Fi location is enough)
        navigator.geolocation.getCurrentPosition(ok, fail, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    });
  },

  // Find a place by name (when GPS is unavailable)
  async search(q) {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=in&q=${encodeURIComponent(q)}`, { headers: { 'Accept-Language': 'en' } });
    const j = await r.json();
    return j[0] ? { lat: +j[0].lat, lng: +j[0].lon, name: j[0].display_name } : null;
  },

  watch(cb) {
    if (!('geolocation' in navigator)) return null;
    return navigator.geolocation.watchPosition(p => cb({ lat: p.coords.latitude, lng: p.coords.longitude }), () => {}, { enableHighAccuracy: true });
  },

  km(a, b) {
    if (!a || !b || a.lat == null || b.lat == null) return 0;
    const R = 6371, toR = x => x * Math.PI / 180;
    const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  },
  dist(o) { const k = this.km(this.current(), o); return k < 1 ? Math.round(k * 1000) + ' m' : k.toFixed(1) + ' km'; },
  eta(o) { const k = this.km(this.current(), o); return Math.max(3, Math.round(k / 20 * 60) + 2) + ' min'; }, // ~20 km/h city traffic

  directions(o) { return `https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`; },
  mapsLink(o) { return `https://maps.google.com/?q=${o.lat},${o.lng}`; },

  async reverse(o) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${o.lat}&lon=${o.lng}&zoom=17`, { headers: { 'Accept-Language': 'en' } });
      const j = await r.json();
      const a = j.address || {};
      return [a.road, a.neighbourhood || a.suburb, a.city || a.town || a.village].filter(Boolean).join(', ') || j.display_name;
    } catch (e) { return `${o.lat.toFixed(5)}, ${o.lng.toFixed(5)}`; }
  },

  // Real vets / shelters / animal NGOs near the user from OpenStreetMap
  async fetchRealPlaces(loc) {
    const key = `bv_osm_${loc.lat.toFixed(2)}_${loc.lng.toFixed(2)}`;
    if (this._fetched?.has(key)) return;
    (this._fetched = this._fetched || new Set()).add(key);
    const q = `[out:json][timeout:20];(node["amenity"="veterinary"](around:8000,${loc.lat},${loc.lng});way["amenity"="veterinary"](around:8000,${loc.lat},${loc.lng});node["amenity"="animal_shelter"](around:12000,${loc.lat},${loc.lng});way["amenity"="animal_shelter"](around:12000,${loc.lat},${loc.lng}););out center 40;`;
    try {
      const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: 'data=' + encodeURIComponent(q) });
      const j = await r.json();
      let added = 0;
      (j.elements || []).forEach(el => {
        const t = el.tags || {}; const lat = el.lat ?? el.center?.lat; const lng = el.lon ?? el.center?.lon;
        if (!t.name || lat == null) return;
        const id = 'osm_' + el.id;
        if (Store.db.places.some(p => p.id === id)) return;
        Store.db.places.push({ id, osm: true, type: t.amenity === 'veterinary' ? 'vet' : 'shelter', name: t.name, phone: t.phone || t['contact:phone'] || '', lat, lng,
          hours: t.opening_hours || 'Hours not listed', verified: false, services: t.amenity === 'veterinary' ? 'Veterinary clinic (OpenStreetMap)' : 'Animal shelter (OpenStreetMap)', rating: null });
        added++;
      });
      if (added) { Store.save(false); toast(`Found ${added} real vets/shelters near you from OpenStreetMap`); }
    } catch (e) { /* offline – demo data is used */ }
  },
};

/* ---------- Map helpers ---------- */
const PIN_COLORS = { vet: '#2c6a47', ngo: '#7a5bc4', shelter: '#d68a2f', rescuer: '#e05d50', feeder: '#3b8bc4', case: '#e05d50', caseDone: '#8aa38f', me: '#2f6fe0', rescuerLive: '#1f5135' };

function pinIcon(kind, label = '') {
  if (kind === 'me') return L.divIcon({ className: '', html: '<div class="me-dot"><span></span></div>', iconSize: [22, 22], iconAnchor: [11, 11] });
  const c = PIN_COLORS[kind] || '#e05d50';
  return L.divIcon({ className: '', iconSize: [30, 40], iconAnchor: [15, 38], popupAnchor: [0, -34],
    html: `<svg width="30" height="40" viewBox="0 0 30 40"><path d="M15 39s13-13.5 13-23.5A13 13 0 0 0 2 15.5C2 25.5 15 39 15 39z" fill="${c}" stroke="#fff" stroke-width="2"/><circle cx="15" cy="15" r="5.5" fill="#fff"/>${label ? `<text x="15" y="18.5" text-anchor="middle" font-size="9" font-weight="700" fill="${c}">${label}</text>` : ''}</svg>` });
}

const Maps = {
  instances: {},
  // Creates a map inside element #id. markers: [{lat,lng,kind,popup,onClick}]
  make(id, { center, zoom = 13, markers = [], showMe = true, fit = true } = {}) {
    const el = document.getElementById(id);
    if (!el) return null;
    if (typeof L === 'undefined') {
      el.innerHTML = `<div class="map-offline">${icon('map', 28)}<p>Map needs an internet connection.<br><small>Locations below are still sorted by distance.</small></p></div>`;
      return null;
    }
    if (this.instances[id]) { try { this.instances[id].remove(); } catch (e) {} }
    const c = center || Geo.current();
    const map = L.map(el, { zoomControl: true, attributionControl: true, scrollWheelZoom: false }).setView([c.lat, c.lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).on('tileerror', () => el.classList.add('no-tiles')).addTo(map);
    const pts = [];
    if (showMe) { const me = Geo.current(); L.marker([me.lat, me.lng], { icon: pinIcon('me'), zIndexOffset: 1000 }).addTo(map).bindPopup('You are here'); pts.push([me.lat, me.lng]); }
    markers.forEach(m => {
      if (m.lat == null) return;
      const mk = L.marker([m.lat, m.lng], { icon: pinIcon(m.kind, m.label) }).addTo(map);
      if (m.popup) mk.bindPopup(m.popup);
      if (m.onClick) mk.on('click', m.onClick);
      pts.push([m.lat, m.lng]);
    });
    if (fit && pts.length > 1) map.fitBounds(pts, { padding: [28, 28], maxZoom: 15 });
    this.instances[id] = map;
    setTimeout(() => map.invalidateSize(), 120);
    return map;
  },
  clear() { Object.values(this.instances).forEach(m => { try { m.remove(); } catch (e) {} }); this.instances = {}; },
};
