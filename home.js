/* Inicio: buscador, servicios destacados y reseñas */
document.addEventListener('DOMContentLoaded', () => {
  const { services, zones, homeReviews } = VC.data;
  const saved = VC.store.get('search', {});

  const selService = document.getElementById('f-service');
  const selZone = document.getElementById('f-zone');
  const selDate = document.getElementById('f-date');

  selService.innerHTML = services.map(s => `<option value="${s.id}">${VC.esc(s.name)}</option>`).join('');
  selZone.innerHTML = zones.map(z => `<option>${VC.esc(z)}</option>`).join('');
  if (saved.serviceId) selService.value = saved.serviceId;
  if (saved.zone) selZone.value = saved.zone;
  if (saved.fecha) selDate.value = saved.fecha;

  document.getElementById('search-form').addEventListener('submit', e => {
    e.preventDefault();
    VC.store.set('search', { serviceId: selService.value, zone: selZone.value, fecha: selDate.value });
    location.href = 'veterinarios.html';
  });

  // Servicios destacados (los 3 primeros)
  const box = document.getElementById('home-services');
  box.innerHTML = services.slice(0, 3).map(s => `
    <a class="card service-card reveal" href="veterinarios.html" data-service="${s.id}">
      <h3>${VC.esc(s.name)}</h3>
      <p>${VC.esc(s.desc)}</p>
      <span class="from">Desde ${VC.money(s.from)}</span>
    </a>`).join('');
  box.querySelectorAll('.service-card').forEach(c => c.addEventListener('click', () => {
    VC.store.set('search', { ...VC.store.get('search', {}), serviceId: c.dataset.service });
  }));

  // Reseñas
  document.getElementById('home-reviews').innerHTML = homeReviews.map(r => `
    <div class="card review reveal">
      <p>“${VC.esc(r.text)}”</p>
      <span class="who">${VC.esc(r.by)} · <span class="stars" aria-label="${r.stars} de 5 estrellas">${VC.stars(r.stars)}</span></span>
    </div>`).join('');

  // Si ya tiene sesión, el botón de promo lleva a reservar
  if (VC.getUser()) {
    const b = document.getElementById('promo-btn');
    b.textContent = 'Reservar con 50% off';
    b.href = 'veterinarios.html';
  }

  // Re-observar elementos que se crearon dinámicamente
  document.querySelectorAll('.reveal:not(.in)').forEach(el => {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12 });
    io.observe(el);
  });
});

