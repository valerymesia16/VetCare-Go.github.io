/* Ingresar / Crear cuenta (simulado en el navegador, sin backend) */
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(location.search);
  const next = ['pago.html', 'mis-reservas.html', 'veterinarios.html'].includes(params.get('next')) ? params.get('next') : null;

  const tabs = { login: document.getElementById('tab-login'), registro: document.getElementById('tab-registro') };
  const forms = { login: document.getElementById('form-login'), registro: document.getElementById('form-registro') };

  function showTab(t) {
    Object.keys(tabs).forEach(k => {
      tabs[k].setAttribute('aria-selected', String(k === t));
      forms[k].hidden = k !== t;
    });
  }
  Object.keys(tabs).forEach(k => tabs[k].addEventListener('click', () => showTab(k)));
  showTab(params.get('tab') === 'registro' ? 'registro' : 'login');

  const setErr = (f, msg) => {
    const el = document.querySelector(`[data-f="${f}"]`);
    el.classList.toggle('error', !!msg);
    el.querySelector('.err').textContent = msg || '';
    return !msg;
  };
  document.querySelectorAll('.field input').forEach(i => i.addEventListener('input', () => i.closest('.field').classList.remove('error')));
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  document.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => {
    const i = document.getElementById(b.dataset.toggle);
    const show = i.type === 'password';
    i.type = show ? 'text' : 'password';
    b.textContent = show ? 'Ocultar' : 'Ver';
  }));

  function enter(user, msg) {
    VC.setUser({ name: user.name, email: user.email });
    VC.toast(msg, 'success');
    setTimeout(() => { location.href = next || 'index.html'; }, 700);
  }

  // Ingresar
  forms.login.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('l-email').value.trim().toLowerCase();
    const pass = document.getElementById('l-pass').value;
    let ok = setErr('l-email', emailOk(email) ? '' : 'Ingresa un correo válido.');
    ok = setErr('l-pass', pass ? '' : 'Ingresa tu contraseña.') && ok;
    if (!ok) return;

    const u = VC.users.find(email);
    if (!u || u.password !== pass) { setErr('l-pass', 'Correo o contraseña incorrectos.'); return; }
    enter(u, '¡Hola, ' + u.name.split(' ')[0] + '! Sesión iniciada');
  });

  document.getElementById('demo-btn').addEventListener('click', () => {
    document.getElementById('l-email').value = 'demo@vetcare.pe';
    document.getElementById('l-pass').value = 'demo1234';
    forms.login.requestSubmit();
  });

  // Crear cuenta
  forms.registro.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('r-name').value.trim();
    const email = document.getElementById('r-email').value.trim().toLowerCase();
    const pass = document.getElementById('r-pass').value;
    let ok = setErr('r-name', name.length >= 3 ? '' : 'Ingresa tu nombre completo.');
    ok = setErr('r-email', emailOk(email) ? '' : 'Ingresa un correo válido.') && ok;
    ok = setErr('r-pass', pass.length >= 6 ? '' : 'Mínimo 6 caracteres.') && ok;
    if (!ok) return;

    if (VC.users.find(email)) { setErr('r-email', 'Ya existe una cuenta con este correo.'); return; }
    const user = { name, email, password: pass };
    VC.users.add(user);
    enter(user, '¡Cuenta creada! Tu 50% de descuento ya está activo');
  });
});
