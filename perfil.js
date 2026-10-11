/* Perfil del veterinario + panel de reserva */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('profile-root');
  const id = new URLSearchParams(location.search).get('id');
  const vet = VC.vetById(id);

  if (!vet) {
    root.innerHTML = `<div class="empty" style="margin:30px 0 70px"><div class="big">🔍</div><h3>No encontramos a este veterinario</h3>
      <p>Puede que el enlace haya cambiado. Vuelve al listado para elegir otro profesional.</p>
      <a class="btn btn-primary" href="veterinarios.html">Ver veterinarios</a></div>`;
    return;
  }
  document.title = vet.name + ' · VetCare Go';

  const search = VC.store.get('search', {});
  const sel = {
    offset: null,
    time: null,
    zone: vet.zones.includes(search.zone) ? search.zone : vet.zones[0]
  };
  const offsets = [0, 1, 2];
  sel.offset = offsets.find(o => vet.slots[o] && vet.slots[o].length);
  sel.time = vet.slots[sel.offset][0];

  root.innerHTML = `
  <div class="profile-layout">
    <div>
      <div class="card profile-head">
        ${VC.avatar(vet, 'lg')}
        <div>
          <h1>${VC.esc(vet.name)}</h1>
          <p class="muted">${VC.esc(vet.title)}</p>
          <span class="verified">✓ Colegiatura verificada</span>
        </div>
      </div>

      <div class="card stat-table">
        <div class="stat-row"><span>Calificación</span><b>★ ${vet.rating.toFixed(1)} (${vet.reviews} reseñas)</b></div>
        <div class="stat-row"><span>Zona de cobertura</span><b>${vet.zones.join(', ')}</b></div>
        <div class="stat-row"><span>Precio consulta</span><b>${VC.money(vet.price)}</b></div>
      </div>

      <p class="about">${VC.esc(vet.bio)}</p>

      <h2>Lo que dicen sus clientes</h2>
      ${vet.comments.map(c => `
        <div class="card quote">
          <p>“${VC.esc(c.text)}”</p>
          <small>${VC.esc(c.by)}</small><span class="stars" aria-label="${c.stars} de 5">${VC.stars(c.stars)}</span>
        </div>`).join('')}
    </div>

    <aside class="card book-card" aria-label="Reservar">
      <h3>Reservar con ${VC.esc(vet.name)}</h3>
      <h4>Fecha</h4>
      <div class="chip-row" id="dates"></div>
      <h4>Hora</h4>
      <div class="chip-row" id="times"></div>
      <div id="zone-block"></div>
      <div class="book-row"><span>Servicio</span><b>${VC.money(vet.price)}</b></div>
      <button class="btn btn-accent btn-block btn-lg" id="book-btn">Reservar atención</button>
      <p class="book-note">Aún no se te cobra. Verás el total antes de pagar.</p>
    </aside>
  </div>`;

  const datesEl = document.getElementById('dates');
  const timesEl = document.getElementById('times');
  const zoneBlock = document.getElementById('zone-block');

  function renderDates() {
    datesEl.innerHTML = offsets.map(o => {
      const has = vet.slots[o] && vet.slots[o].length;
      return `<button class="chip" data-o="${o}" aria-pressed="${sel.offset === o}" ${has ? '' : 'disabled style="opacity:.45;cursor:not-allowed"'}>${VC.dayLabel(o)}</button>`;
    }).join('');
  }
  function renderTimes() {
    timesEl.innerHTML = (vet.slots[sel.offset] || []).map(t =>
      `<button class="chip" data-t="${t}" aria-pressed="${sel.time === t}">${t}</button>`).join('');
  }
  function renderZones() {
    if (vet.zones.length < 2) { zoneBlock.innerHTML = ''; return; }
    zoneBlock.innerHTML = '<h4>Zona de la visita</h4><div class="chip-row">' + vet.zones.map(z =>
      `<button class="chip" data-z="${z}" aria-pressed="${sel.zone === z}">${z}</button>`).join('') + '</div>';
  }

  datesEl.addEventListener('click', e => {
    const b = e.target.closest('[data-o]'); if (!b || b.disabled) return;
    sel.offset = +b.dataset.o; sel.time = vet.slots[sel.offset][0];
    renderDates(); renderTimes();
  });
  timesEl.addEventListener('click', e => {
    const b = e.target.closest('[data-t]'); if (!b) return;
    sel.time = b.dataset.t; renderTimes();
  });
  zoneBlock.addEventListener('click', e => {
    const b = e.target.closest('[data-z]'); if (!b) return;
    sel.zone = b.dataset.z; renderZones();
  });

  document.getElementById('book-btn').addEventListener('click', () => {
    VC.store.set('booking', {
      vetId: vet.id, date: VC.iso(VC.dateFromOffset(sel.offset)), time: sel.time, zone: sel.zone
    });
    location.href = 'pago.html';
  });

  renderDates(); renderTimes(); renderZones();
});
