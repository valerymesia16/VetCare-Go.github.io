/* Servicios: catálogo completo + preguntas frecuentes */
document.addEventListener('DOMContentLoaded', () => {
  const { services, faqs } = VC.data;

  const grid = document.getElementById('services-grid');
  grid.innerHTML = services.map(s => `
    <article class="card service-full">
      <div class="ico" aria-hidden="true">${s.icon}</div>
      <h3 style="font-family:var(--sans);font-size:1.1rem;font-weight:700">${VC.esc(s.name)}</h3>
      <p class="muted" style="font-size:.9rem">${VC.esc(s.desc)}</p>
      <ul>${s.items.map(i => `<li>${VC.esc(i)}</li>`).join('')}</ul>
      <div class="foot">
        <span class="price">Desde ${VC.money(s.from)}</span>
        <button class="btn btn-outline" data-service="${s.id}">Ver veterinarios</button>
      </div>
    </article>`).join('');

  grid.addEventListener('click', e => {
    const b = e.target.closest('[data-service]');
    if (!b) return;
    VC.store.set('search', { ...VC.store.get('search', {}), serviceId: b.dataset.service });
    location.href = 'veterinarios.html';
  });

  document.getElementById('faq').innerHTML = faqs.map(f =>
    `<details><summary>${VC.esc(f.q)}</summary><p>${VC.esc(f.a)}</p></details>`).join('');
});

