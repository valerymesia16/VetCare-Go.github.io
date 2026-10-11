/* Veterinarios: listado con filtros (fecha, zona, orden) */
document.addEventListener('DOMContentLoaded', () => {
  const saved = VC.store.get('search', {});
  const state = {
    fecha: saved.fecha || 'hoy',
    zona: saved.zone || 'San Isidro',
    orden: saved.orden || 'rating',
    serviceId: saved.serviceId || null
  };

  const list = document.getElementById('vet-list');
  const title = document.getElementById('vets-title');
  const sub = document.getElementById('vets-sub');

  function persist() {
    VC.store.set('search', { serviceId: state.serviceId, zone: state.zona, fecha: state.fecha, orden: state.orden });
  }

  function getResults() {
    let vets = VC.data.vets.filter(v => v.zones.includes(state.zona));
    if (state.fecha === 'hoy') vets = vets.filter(VC.hasToday);
    vets.sort((a, b) => state.orden === 'precio' ? a.price - b.price : b.rating - a.rating || b.reviews - a.reviews);
    // Los que coinciden con el servicio buscado van primero
    if (state.serviceId) vets.sort((a, b) => (b.serviceId === state.serviceId) - (a.serviceId === state.serviceId));
    return vets;
  }

  function render() {
    // chips
    document.querySelectorAll('.chip-row').forEach(row => {
      row.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(state[row.dataset.group] === c.dataset.value)));
    });

    const vets = getResults();
    const n = vets.length;
    title.textContent = n === 1 ? '1 veterinario disponible' : n + ' veterinarios disponibles';
    const svc = state.serviceId ? VC.serviceById(state.serviceId) : null;
    sub.textContent = `${svc ? svc.name : 'Medicina general'} y más en ${state.zona} · precios por consulta`;

    if (!n) {
      list.innerHTML = `<div class="empty"><div class="big">🐾</div><h3>No hay veterinarios para hoy</h3>
        <p>Prueba con “Esta semana” o cambia de zona para ver más opciones.</p>
        <button class="btn btn-primary" id="see-week">Ver esta semana</button></div>`;
      document.getElementById('see-week').onclick = () => { state.fecha = 'semana'; persist(); render(); };
      return;
    }

    list.innerHTML = vets.map(v => {
      const next = state.fecha === 'hoy' && VC.hasToday(v) ? { label: 'Hoy ' + v.slots[0][0] } : VC.nextSlot(v);
      const match = state.serviceId && v.serviceId === state.serviceId;
      return `
      <article class="vet-card">
        ${VC.avatar(v)}
        <div class="vet-info">
          <h3>${VC.esc(v.name)}${match ? '<span class="match">Coincide con tu búsqueda</span>' : ''}</h3>
          <p class="vet-meta">${VC.esc(v.specialty)} · ★ ${v.rating.toFixed(1)} (${v.reviews} reseñas)</p>
          <p class="vet-sub">Cubre ${v.zones.join(' y ')} · Próxima disponibilidad: ${next ? VC.esc(next.label) : '—'}</p>
        </div>
        <div class="vet-price"><small>Consulta</small><strong>${VC.money(v.price)}</strong></div>
        <div class="vet-actions">
          <button class="btn btn-primary" data-reserve="${v.id}">Reservar</button>
          <a class="btn btn-outline" href="perfil.html?id=${v.id}">Ver perfil</a>
        </div>
      </article>`;
    }).join('');
  }

  // Filtros
  document.querySelectorAll('.chip-row').forEach(row => row.addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    state[row.dataset.group] = c.dataset.value;
    persist(); render();
  }));

  // Reservar rápido: toma la primera hora libre según la fecha elegida
  list.addEventListener('click', e => {
    const b = e.target.closest('[data-reserve]'); if (!b) return;
    const vet = VC.vetById(b.dataset.reserve);
    const slot = state.fecha === 'hoy' && VC.hasToday(vet) ? { offset: 0, time: vet.slots[0][0] } : VC.nextSlot(vet);
    if (!slot) { VC.toast('Este veterinario no tiene horarios libres', 'error'); return; }
    VC.store.set('booking', {
      vetId: vet.id, date: VC.iso(VC.dateFromOffset(slot.offset)), time: slot.time,
      zone: state.zona
    });
    location.href = 'pago.html';
  });

  persist();
  render();
});
