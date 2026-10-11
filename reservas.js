/* Mis reservas: listado, filtros, reintentar pago y eliminar */
document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('res-list');
  const sub = document.getElementById('res-sub');
  let filter = 'todas';

  const STATUS = { cancelado: 'Pago cancelado', confirmada: 'Confirmada', pendiente: 'Pendiente' };
  const METHOD = { yape: 'Yape', plin: 'Plin', tarjeta: 'Tarjeta' };

  function render() {
    const all = VC.reservas.mine();
    const items = filter === 'todas' ? all : all.filter(r => r.status === filter);

    document.querySelectorAll('#res-filters .chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.value === filter)));
    sub.textContent = all.length ? `Tienes ${all.length} ${all.length === 1 ? 'reserva' : 'reservas'}.` : 'Revisa el estado de tus atenciones y pagos.';

    if (!items.length) {
      list.innerHTML = `<div class="empty"><div class="big">📋</div>
        <h3>${all.length ? 'No hay reservas con este estado' : 'Aún no tienes reservas'}</h3>
        <p>${all.length ? 'Prueba con otro filtro.' : 'Cuando reserves una atención, aparecerá aquí con su estado de pago.'}</p>
        <a class="btn btn-primary" href="veterinarios.html">Reservar ahora</a></div>`;
      return;
    }

    list.innerHTML = items.map(r => {
      const v = VC.vetById(r.vetId);
      if (!v) return '';
      const canRetry = r.status !== 'confirmada';
      return `
      <article class="card res-card" data-id="${VC.esc(r.id)}">
        ${VC.avatar(v, 'sm')}
        <div>
          <h3>${VC.esc(v.name)} <span class="status ${r.status}">${STATUS[r.status] || r.status}</span></h3>
          <div class="res-meta">
            <span>📅 ${VC.bookingLabel(r.date, r.time)} · ${VC.esc(v.specialty)}</span>
            <span>📍 ${VC.esc(r.address)}, ${VC.esc(r.zone)}</span>
            <span>🐾 ${VC.esc(r.pet)} · ${METHOD[r.method] || ''} · N.º ${VC.esc(r.id)}</span>
          </div>
        </div>
        <div class="res-side">
          <strong>${VC.money(r.total)}</strong>
          <div class="res-actions">
            ${canRetry ? '<button class="btn btn-accent" data-act="retry">Reintentar pago</button>' : ''}
            <button class="btn btn-outline" data-act="delete">Eliminar</button>
          </div>
        </div>
      </article>`;
    }).join('');
  }

  list.addEventListener('click', e => {
    const btn = e.target.closest('[data-act]'); if (!btn) return;
    const id = btn.closest('.res-card').dataset.id;
    const r = VC.reservas.all().find(x => x.id === id);
    if (!r) return;

    if (btn.dataset.act === 'retry') {
      VC.store.set('booking', { vetId: r.vetId, date: r.date, time: r.time, zone: r.zone, address: r.address, pet: r.pet, ref: r.ref, method: r.method, resId: r.id });
      location.href = 'pago.html';
    } else {
      VC.confirm('¿Eliminar esta reserva?', 'Se quitará de tu lista. Esta acción no se puede deshacer.', 'Sí, eliminar', () => {
        VC.reservas.remove(id); render(); VC.toast('Reserva eliminada', 'success');
      });
    }
  });

  document.getElementById('res-filters').addEventListener('click', e => {
    const c = e.target.closest('.chip'); if (!c) return;
    filter = c.dataset.value; render();
  });

  render();
});
