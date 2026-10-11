/* ==========================================================
   VetCare Go · utilidades compartidas
   (almacenamiento, fechas, sesión, header/footer, modal, toast)
   ========================================================== */
(function () {
  const VC = window.VC;
  const DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  /* ---------- Almacenamiento (localStorage) ---------- */
  VC.store = {
    get(k, d) { try { const v = localStorage.getItem('vc_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('vc_' + k, JSON.stringify(v)); } catch (e) {} },
    remove(k) { try { localStorage.removeItem('vc_' + k); } catch (e) {} }
  };

  /* ---------- Helpers ---------- */
  VC.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  VC.money = n => 'S/ ' + n;
  VC.stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
  VC.vetById = id => VC.data.vets.find(v => v.id === id);
  VC.serviceById = id => VC.data.services.find(s => s.id === id);

  /* ---------- Fechas ---------- */
  VC.startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  VC.dateFromOffset = n => { const d = VC.startOfToday(); d.setDate(d.getDate() + n); return d; };
  VC.iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  VC.parseISO = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  VC.offsetFromISO = s => Math.round((VC.parseISO(s) - VC.startOfToday()) / 864e5);
  VC.dayLabel = off => {
    if (off === 0) return 'Hoy';
    if (off === 1) return 'Mañana';
    const d = VC.dateFromOffset(off);
    return DAYS[d.getDay()] + ' ' + d.getDate();
  };
  VC.bookingLabel = (iso, time) => { const d = VC.parseISO(iso); return DAYS[d.getDay()] + ' ' + d.getDate() + ', ' + time; };

  // Próxima disponibilidad de un veterinario
  VC.nextSlot = vet => {
    for (let o = 0; o <= 6; o++) {
      const s = vet.slots[o];
      if (s && s.length) return { offset: o, time: s[0], label: VC.dayLabel(o) + ' ' + s[0] };
    }
    return null;
  };
  VC.hasToday = vet => !!(vet.slots[0] && vet.slots[0].length);

  VC.avatar = (vet, size) =>
    '<div class="avatar ' + (size || '') + '"><span>' + VC.esc(vet.initials) + '</span>' +
    '<img src="' + VC.esc(vet.photo) + '" alt="' + VC.esc(vet.name) + '" onerror="this.remove()"></div>';

  /* ---------- Sesión (simulada, solo front) ---------- */
  VC.getUser = () => VC.store.get('user', null);
  VC.setUser = u => VC.store.set('user', u);
  VC.logout = () => { VC.store.remove('user'); };
  VC.users = {
    all() {
      const list = VC.store.get('users', null);
      if (list) return list;
      const seed = [{ name: 'Cliente Demo', email: 'demo@vetcare.pe', password: 'demo1234' }];
      VC.store.set('users', seed);
      return seed;
    },
    add(u) { const l = VC.users.all(); l.push(u); VC.store.set('users', l); },
    find(email) { return VC.users.all().find(u => u.email === email.toLowerCase()); }
  };

  /* ---------- Reservas ---------- */
  VC.reservas = {
    all() { return VC.store.get('reservas', []); },
    mine() {
      const u = VC.getUser(); const owner = u ? u.email : 'invitado';
      return VC.reservas.all().filter(r => r.owner === owner).sort((a, b) => b.createdAt - a.createdAt);
    },
    upsert(r) {
      const l = VC.reservas.all(); const i = l.findIndex(x => x.id === r.id);
      if (i >= 0) l[i] = r; else l.push(r);
      VC.store.set('reservas', l);
    },
    remove(id) { VC.store.set('reservas', VC.reservas.all().filter(r => r.id !== id)); }
  };
  // 50% en la primera reserva: solo con cuenta y sin reservas confirmadas
  VC.firstBookingEligible = () => {
    const u = VC.getUser(); if (!u) return false;
    return !VC.reservas.mine().some(r => r.status === 'confirmada');
  };

  /* ---------- Toast ---------- */
  VC.toast = (msg, type) => {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; wrap.setAttribute('aria-live', 'polite'); document.body.appendChild(wrap); }
    const t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .3s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
  };

  /* ---------- Modal centrado ---------- */
  VC.modal = opts => {
    const type = opts.type || 'info';
    const icons = { error: '✕', success: '✓', info: '!' };
    const prevFocus = document.activeElement;
    const ov = document.createElement('div');
    ov.className = 'modal-overlay';
    ov.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
      '<div class="modal-icon ' + type + '">' + icons[type] + '</div>' +
      '<h2 id="modal-title">' + VC.esc(opts.title) + '</h2>' +
      '<p>' + VC.esc(opts.text) + '</p><div class="modal-actions"></div></div>';
    const box = ov.querySelector('.modal-actions');

    function close() {
      document.removeEventListener('keydown', onKey);
      ov.classList.add('closing');
      setTimeout(() => ov.remove(), 180);
      if (prevFocus && prevFocus.focus) prevFocus.focus();
      if (opts.onClose) opts.onClose();
    }
    function onKey(e) { if (e.key === 'Escape' && opts.dismissible !== false) close(); }

    (opts.actions || []).forEach(a => {
      const el = document.createElement(a.href ? 'a' : 'button');
      el.className = 'btn ' + (a.variant || 'btn-outline') + ' btn-block';
      el.textContent = a.label;
      if (a.href) el.href = a.href;
      el.addEventListener('click', () => { if (a.onClick) a.onClick(); if (!a.href) close(); });
      box.appendChild(el);
    });
    ov.addEventListener('click', e => { if (e.target === ov && opts.dismissible !== false) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
    const first = box.querySelector('.btn'); if (first) first.focus();
    return close;
  };

  VC.confirm = (title, text, okLabel, onOk) =>
    VC.modal({ type: 'info', title, text, actions: [
      { label: okLabel, variant: 'btn-danger', onClick: onOk },
      { label: 'Cancelar', variant: 'btn-outline' }
    ] });

  /* ---------- Header y footer ---------- */
  function renderChrome() {
    const nav = document.body.dataset.nav || '';
    const user = VC.getUser();
    const link = (href, key, label) => '<a href="' + href + '"' + (nav === key ? ' class="active" aria-current="page"' : '') + '>' + label + '</a>';

    const auth = user
      ? '<div class="user-wrap"><button class="btn btn-outline" id="user-btn" aria-haspopup="true" aria-expanded="false">Hola, ' + VC.esc(user.name.split(' ')[0]) + ' ▾</button>' +
        '<div class="user-menu" id="user-menu"><div class="who">' + VC.esc(user.email) + '</div>' +
        '<a href="mis-reservas.html">Mis reservas</a><button id="logout-btn">Cerrar sesión</button></div></div>'
      : '<a class="btn btn-outline" href="ingresar.html">Ingresar</a>';

    const header = document.getElementById('app-header');
    if (header) {
      header.className = 'site-header';
      header.innerHTML =
        '<div class="container nav">' +
        '<a class="logo" href="index.html" aria-label="VetCare Go, inicio">VetCare <span>Go</span></a>' +
        '<button class="burger" id="burger" aria-label="Abrir menú" aria-expanded="false"><span></span></button>' +
        '<div class="nav-panel"><nav class="nav-links" aria-label="Principal">' +
        link('index.html', 'inicio', 'Inicio') + link('servicios.html', 'servicios', 'Servicios') +
        link('veterinarios.html', 'veterinarios', 'Veterinarios') + link('mis-reservas.html', 'reservas', 'Mis reservas') +
        '</nav><div class="nav-actions">' + auth + '<a class="btn btn-accent" href="veterinarios.html">Reservar ahora</a></div></div></div>';

      const burger = header.querySelector('#burger');
      burger.addEventListener('click', () => {
        const open = header.classList.toggle('nav-open');
        burger.setAttribute('aria-expanded', open);
      });
      const ub = header.querySelector('#user-btn');
      if (ub) {
        const menu = header.querySelector('#user-menu');
        ub.addEventListener('click', e => { e.stopPropagation(); const o = menu.classList.toggle('open'); ub.setAttribute('aria-expanded', o); });
        document.addEventListener('click', () => { menu.classList.remove('open'); ub.setAttribute('aria-expanded', 'false'); });
        header.querySelector('#logout-btn').addEventListener('click', () => {
          VC.logout(); VC.toast('Sesión cerrada', 'success');
          setTimeout(() => location.href = 'index.html', 600);
        });
      }
    }

    const footer = document.getElementById('app-footer');
    if (footer) {
      footer.className = 'site-footer';
      footer.innerHTML = '<div class="container"><span>© ' + new Date().getFullYear() + ' VetCare Go · Atención veterinaria a domicilio</span><span>San Isidro · Miraflores</span></div>';
    }
  }

  /* ---------- Animación al hacer scroll ---------- */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12 });
    els.forEach(e => io.observe(e));
  }

  document.addEventListener('DOMContentLoaded', () => { renderChrome(); initReveal(); });
})();
