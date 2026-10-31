/* =========================================================
   BrunoVerse API client (Spring Boot backend)
   - Finds the backend automatically (same origin, window.BRUNOVERSE_API, or localhost:8080)
   - Logs in with a signed token (Authorization: Bearer …)
   - Demo servers get sample data; real (production) servers start clean
   - Every local change is synced (PUT/DELETE /api/data/{collection}/{id});
     the server checks who may change what
   - Polls the server so other devices see new cases, status changes and messages
   - If no backend is running the app keeps working offline (localStorage)
   ========================================================= */
const SYNC_KEYS = ['users', 'places', 'cases', 'pets', 'appointments', 'threads', 'posts', 'activity', 'notifications', 'signups', 'teams'];
const TOKEN_KEY = 'bv_token';

const Api = {
  base: null,
  online: false,
  demo: true,        // false on a real (production) server
  admin: false,
  token: null,
  applying: false,
  snap: {},          // collection -> { id -> json } as last seen on the server
  ver: 0,            // bumps on every local change
  pushing: 0,
  timer: null,
  pollTimer: null,

  candidates() {
    const list = [];
    if (window.BRUNOVERSE_API) list.push(String(window.BRUNOVERSE_API).replace(/\/$/, ''));
    if (location.protocol.startsWith('http')) list.push(location.origin);
    list.push('http://localhost:8080');
    return [...new Set(list)];
  },

  async detect() {
    for (const b of this.candidates()) {
      try {
        const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 2500);
        const r = await fetch(b + '/api/health', { signal: ctl.signal });
        clearTimeout(t);
        const j = r.ok ? await r.json() : null;
        if (j && j.app === 'BrunoVerse') { this.base = b; this.online = true; this.demo = j.demo !== false; return true; }
      } catch (e) { /* try next */ }
    }
    return false;
  },

  loadToken() { try { this.token = localStorage.getItem(TOKEN_KEY); } catch (e) { this.token = null; } },
  setToken(t) { this.token = t; try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} },
  clearToken() { this.setToken(null); this.admin = false; },

  async req(method, path, body) {
    const headers = {};
    if (body) headers['Content-Type'] = 'application/json';
    if (this.token) headers.Authorization = 'Bearer ' + this.token;
    const r = await fetch(this.base + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const text = await r.text();
    let data = null; try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
    if (r.status === 401 && this.token && !path.startsWith('/api/auth/')) this.sessionExpired();
    if (!r.ok) { const err = new Error(data?.error || ('Server error ' + r.status)); err.status = r.status; throw err; }
    return data;
  },

  sessionExpired() {
    this.clearToken();
    Store.logout();
    toast('Your session ended. Please log in again.', 'warn');
    location.hash = '#/login';
  },

  async init() {
    this.loadToken();
    if (!(await this.detect())) return false;
    try {
      if (this.token) {
        try { const s = await this.req('GET', '/api/auth/me'); this.admin = !!s.admin; Store.login(s.user.id); }
        catch (e) { this.clearToken(); Store.logout(); }
      } else if (!this.demo) {
        Store.logout(); // real server: a login made in offline/demo mode is not valid here
      }
      await this.refresh(true);
      this.pollTimer = setInterval(() => this.poll(), 4000);
      return true;
    } catch (e) {
      console.warn('Backend error, working offline', e);
      this.online = false;
      return false;
    }
  },

  // Load everything this user may see; demo servers get the sample data on first run
  async refresh(first = false) {
    let data = await this.req('GET', '/api/bootstrap');
    if (first && this.demo && (!data.users || !data.users.length)) {
      const payload = { anchor: Store.db.anchor };
      SYNC_KEYS.forEach(k => { payload[k] = Store.db[k] || []; });
      try { await this.req('POST', '/api/bootstrap/import', payload); } catch (e) { /* someone else imported first */ }
      data = await this.req('GET', '/api/bootstrap');
    }
    this.apply(data);
  },

  snapshotOf(db) {
    const s = {};
    SYNC_KEYS.forEach(k => { s[k] = {}; (db[k] || []).forEach(o => { if (o && o.id) s[k][o.id] = JSON.stringify(o); }); });
    return s;
  },

  // Replace local data with server data (keeps per-browser settings like the AI key)
  apply(data) {
    this.applying = true;
    SYNC_KEYS.forEach(k => { Store.db[k] = data[k] || []; });
    if (data.anchor) Store.db.anchor = data.anchor;
    Store.relocate(Store.db.anchor || DEFAULT_LOC, false);
    this.snap = this.snapshotOf(Store.db);
    Store.save(false);
    this.applying = false;
  },

  // Called by Store.save()
  changed() {
    if (!this.online || this.applying || !this.token) return;
    this.ver++;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.push(), 250);
  },

  async push() {
    this.timer = null;
    this.pushing++;
    let refused = 0;
    try {
      const now = this.snapshotOf(Store.db);
      const jobs = [];
      const done = (k, id, json) => () => { (this.snap[k] = this.snap[k] || {}); if (json === null) delete this.snap[k][id]; else this.snap[k][id] = json; };
      const onErr = (k, id, json) => err => { if (err.status === 403) { refused++; done(k, id, json)(); } else throw err; };
      SYNC_KEYS.forEach(k => {
        const before = this.snap[k] || {}, after = now[k];
        Object.entries(after).forEach(([id, json]) => {
          if (before[id] !== json) jobs.push(this.req('PUT', `/api/data/${k}/${encodeURIComponent(id)}`, JSON.parse(json)).then(done(k, id, json), onErr(k, id, json)));
        });
        Object.keys(before).forEach(id => {
          if (!(id in after)) jobs.push(this.req('DELETE', `/api/data/${k}/${encodeURIComponent(id)}`).then(done(k, id, null), onErr(k, id, null)));
        });
      });
      const res = await Promise.allSettled(jobs);
      const failed = res.filter(r => r.status === 'rejected');
      if (failed.length) console.warn('Sync failed for', failed.length, 'records', failed[0].reason);
    } finally { this.pushing--; }
    if (refused) { toast('Some changes were not allowed and have been undone.', 'warn'); this.refresh().then(() => window.syncRender?.()).catch(() => {}); }
  },

  async poll() {
    if (!this.online || this.pushing || this.timer) return;
    const v = this.ver;
    try {
      const data = await this.req('GET', '/api/bootstrap');
      if (v !== this.ver || this.pushing || this.timer) return; // local edits happened meanwhile
      const incoming = JSON.stringify(this.snapshotOf(data));
      if (incoming === JSON.stringify(this.snap)) return;
      this.apply(data);
      window.syncRender?.();
    } catch (e) { /* server briefly unavailable */ }
  },

  async saveAnchor(anchor) { if (this.online && this.token) { try { await this.req('PUT', '/api/meta/anchor', anchor); } catch (e) {} } },

  async startSession(s) {
    this.setToken(s.token);
    this.admin = !!s.admin;
    await this.refresh();
    Store.login(s.user.id);
    return s.user;
  },

  async login(id, password) { return this.startSession(await this.req('POST', '/api/auth/login', { id, password })); },

  async signup(user) { return this.startSession(await this.req('POST', '/api/auth/signup', user)); },

  async accept(caseId) { return this.req('POST', `/api/cases/${encodeURIComponent(caseId)}/accept`, {}); },

  // Upload a photo/video; returns a URL other devices can open
  async upload(file) {
    const fd = new FormData(); fd.append('file', file);
    const r = await fetch(this.base + '/api/media', { method: 'POST', body: fd, headers: this.token ? { Authorization: 'Bearer ' + this.token } : {} });
    if (!r.ok) throw new Error('Upload failed');
    const j = await r.json();
    return this.base === location.origin ? j.url : this.base + j.url;
  },
};
