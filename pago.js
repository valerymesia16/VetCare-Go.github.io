/* Pago: validación, resumen dinámico y aviso "Pago cancelado" */
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('pago-root');
  const booking = VC.store.get('booking', null);
  const vet = booking && VC.vetById(booking.vetId);

  if (!booking || !vet) {
    root.innerHTML = `<div class="empty" style="margin:60px 0 80px"><div class="big">🗓️</div><h3>Aún no elegiste una atención</h3>
      <p>Escoge un veterinario, día y hora para continuar con el pago.</p>
      <a class="btn btn-primary" href="veterinarios.html">Elegir veterinario</a></div>`;
    return;
  }

  const zones = VC.data.zones;
  const district = zones.includes(booking.zone) ? booking.zone : zones[0];
  const method0 = booking.method || 'yape';

  root.innerHTML = `
    <div class="stepper" aria-label="Progreso">
      <span class="s"><i>1</i>Elegir veterinario</span>
      <span class="s"><i>2</i>Revisar reserva</span>
      <span class="s now" aria-current="step"><i>3</i>Pagar</span>
    </div>

    <div class="pay-layout">
      <div>
        <h1>Confirma y paga</h1>

        <form id="pay-form" novalidate>
          <section class="card pay-card">
            <h2>Dirección de la visita</h2>
            <div class="form-grid">
              <label class="field full" data-f="address"><span class="label">Dirección</span>
                <input id="address" type="text" placeholder="Av. / calle y número" autocomplete="street-address" value="${VC.esc(booking.address || '')}">
                <span class="err"></span></label>
              <label class="field" data-f="district"><span class="label">Distrito</span>
                <select id="district">${zones.map(z => `<option ${z === district ? 'selected' : ''}>${z}</option>`).join('')}</select>
                <span class="err"></span></label>
              <label class="field" data-f="pet"><span class="label">Mascota</span>
                <input id="pet" type="text" placeholder="Nombre y especie (ej. Luna, perrita)" value="${VC.esc(booking.pet || '')}">
                <span class="err"></span></label>
              <label class="field full" data-f="ref"><span class="label">Referencia (opcional)</span>
                <input id="ref" type="text" placeholder="Piso, interior, cerca de…" value="${VC.esc(booking.ref || '')}">
                <span class="err"></span></label>
            </div>
          </section>

          <section class="card pay-card">
            <h2>Método de pago</h2>
            <div role="radiogroup" aria-label="Método de pago" id="methods">
              <button type="button" class="method" role="radio" data-m="yape"><span class="dot"></span>Yape</button>
              <div class="method-extra" data-x="yape">
                <label class="field" data-f="phone-yape"><span class="label">Celular asociado a Yape</span>
                  <input id="phone-yape" type="tel" inputmode="numeric" maxlength="11" placeholder="999 999 999"><span class="err"></span></label>
                <p class="hint">Te enviaremos una solicitud de aprobación a tu app.</p>
              </div>

              <button type="button" class="method" role="radio" data-m="plin"><span class="dot"></span>Plin</button>
              <div class="method-extra" data-x="plin">
                <label class="field" data-f="phone-plin"><span class="label">Celular asociado a Plin</span>
                  <input id="phone-plin" type="tel" inputmode="numeric" maxlength="11" placeholder="999 999 999"><span class="err"></span></label>
                <p class="hint">Aprobarás el pago desde la app de tu banco.</p>
              </div>

              <button type="button" class="method" role="radio" data-m="tarjeta"><span class="dot"></span>Tarjeta de crédito / débito</button>
              <div class="method-extra" data-x="tarjeta">
                <div class="form-grid">
                  <label class="field full" data-f="card-name"><span class="label">Nombre en la tarjeta</span>
                    <input id="card-name" type="text" autocomplete="cc-name" placeholder="Como aparece en la tarjeta"><span class="err"></span></label>
                  <label class="field full" data-f="card-num"><span class="label">Número de tarjeta</span>
                    <input id="card-num" type="text" inputmode="numeric" autocomplete="cc-number" maxlength="19" placeholder="0000 0000 0000 0000"><span class="err"></span></label>
                  <label class="field" data-f="card-exp"><span class="label">Vencimiento</span>
                    <input id="card-exp" type="text" inputmode="numeric" autocomplete="cc-exp" maxlength="5" placeholder="MM/AA"><span class="err"></span></label>
                  <label class="field" data-f="card-cvv"><span class="label">CVV</span>
                    <input id="card-cvv" type="password" inputmode="numeric" autocomplete="cc-csc" maxlength="4" placeholder="123"><span class="err"></span></label>
                </div>
              </div>
            </div>
          </section>
        </form>
      </div>

      <aside class="card summary" aria-label="Resumen">
        <h2>Resumen</h2>
        <div id="sum-lines"></div>
        <button class="btn btn-accent btn-block btn-lg" id="pay-btn" type="button"></button>
        <p class="note">Pago seguro · sin costos adicionales</p>
        <div id="promo-hint"></div>
      </aside>
    </div>`;

  const $ = s => root.querySelector(s);
  let method = method0;

  /* ---------- Cálculo y resumen ---------- */
  function calc() {
    const mov = VC.data.movilidad[$('#district').value] || 10;
    const eligible = VC.firstBookingEligible();
    const disc = eligible ? Math.round(vet.price * 0.5) : 0;
    return { service: vet.price, mov, disc, total: vet.price + mov - disc };
  }
  function renderSummary() {
    const c = calc();
    $('#sum-lines').innerHTML = `
      <div class="sum-row"><span>${VC.esc(vet.name)}<br><a class="change-link" href="perfil.html?id=${vet.id}">Cambiar fecha u hora</a></span><b>${VC.bookingLabel(booking.date, booking.time)}</b></div>
      <div class="sum-row"><span>Servicio</span><b>${VC.money(c.service)}</b></div>
      <div class="sum-row"><span>Movilidad</span><b>${VC.money(c.mov)}</b></div>
      ${c.disc ? `<div class="sum-row disc"><span>Descuento primera reserva (50%)</span><b>− ${VC.money(c.disc)}</b></div>` : ''}
      <div class="sum-total"><span>Total a pagar</span><strong>${VC.money(c.total)}</strong></div>`;
    $('#pay-btn').textContent = 'Pagar ' + VC.money(c.total);
    $('#promo-hint').innerHTML = VC.getUser() ? '' :
      '<p class="promo-hint">🎁 <a href="ingresar.html?tab=registro&next=pago.html">Crea tu cuenta</a> y obtén 50% en tu primera reserva.</p>';
  }
  $('#district').addEventListener('change', renderSummary);

  /* ---------- Métodos de pago ---------- */
  function setMethod(m) {
    method = m;
    root.querySelectorAll('.method').forEach(b => b.setAttribute('aria-checked', String(b.dataset.m === m)));
    root.querySelectorAll('.method-extra').forEach(x => x.classList.toggle('show', x.dataset.x === m));
  }
  $('#methods').addEventListener('click', e => { const b = e.target.closest('.method'); if (b) setMethod(b.dataset.m); });
  setMethod(method);

  // Formato de los campos
  const digits = v => v.replace(/\D/g, '');
  ['phone-yape', 'phone-plin'].forEach(id => $('#' + id).addEventListener('input', e => {
    const d = digits(e.target.value).slice(0, 9);
    e.target.value = d.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }));
  $('#card-num').addEventListener('input', e => { e.target.value = digits(e.target.value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '); });
  $('#card-exp').addEventListener('input', e => {
    const d = digits(e.target.value).slice(0, 4);
    e.target.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  });
  $('#card-cvv').addEventListener('input', e => { e.target.value = digits(e.target.value).slice(0, 4); });

  /* ---------- Validación ---------- */
  function setErr(f, msg) {
    const el = root.querySelector(`[data-f="${f}"]`);
    el.classList.toggle('error', !!msg);
    el.querySelector('.err').textContent = msg || '';
    return !msg;
  }
  root.querySelectorAll('.field input, .field select').forEach(i => i.addEventListener('input', () => {
    const f = i.closest('.field'); f.classList.remove('error');
  }));

  function validate() {
    const errors = [];
    const check = (f, msg) => { setErr(f, msg); if (msg) errors.push(f); };

    check('address', $('#address').value.trim().length < 6 ? 'Ingresa la dirección completa (calle y número).' : '');
    check('pet', $('#pet').value.trim().length < 2 ? 'Cuéntanos el nombre y la especie de tu mascota.' : '');
    ['phone-yape', 'phone-plin', 'card-name', 'card-num', 'card-exp', 'card-cvv'].forEach(f => setErr(f, ''));

    if (method === 'yape' || method === 'plin') {
      const f = 'phone-' + method, d = digits($('#' + f).value);
      check(f, !/^9\d{8}$/.test(d) ? 'Ingresa un celular válido de 9 dígitos (empieza con 9).' : '');
    } else {
      check('card-name', $('#card-name').value.trim().length < 3 ? 'Ingresa el nombre del titular.' : '');
      check('card-num', digits($('#card-num').value).length < 15 ? 'Número de tarjeta incompleto.' : '');
      const exp = $('#card-exp').value, m = +exp.slice(0, 2), y = +('20' + exp.slice(3, 5));
      const now = new Date(); const expOk = /^\d{2}\/\d{2}$/.test(exp) && m >= 1 && m <= 12 && (y > now.getFullYear() || (y === now.getFullYear() && m >= now.getMonth() + 1));
      check('card-exp', expOk ? '' : 'Fecha inválida o vencida.');
      check('card-cvv', digits($('#card-cvv').value).length < 3 ? 'CVV de 3 o 4 dígitos.' : '');
    }
    return errors;
  }

  /* ---------- Pagar ---------- */
  const payBtn = $('#pay-btn');
  payBtn.addEventListener('click', () => {
    const errors = validate();
    if (errors.length) {
      const first = root.querySelector(`[data-f="${errors[0]}"] input, [data-f="${errors[0]}"] select`);
      if (first) { first.focus(); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      payBtn.classList.remove('shake'); void payBtn.offsetWidth; payBtn.classList.add('shake');
      VC.toast('Revisa los campos marcados', 'error');
      return;
    }

    const c = calc();
    const label = payBtn.textContent;
    payBtn.disabled = true;
    payBtn.innerHTML = '<span class="spinner"></span> Procesando pago…';

    // Guardamos la reserva con estado "cancelado" (flujo de demostración)
    const user = VC.getUser();
    const res = {
      id: booking.resId || 'VC-' + Date.now().toString(36).toUpperCase(),
      vetId: vet.id, date: booking.date, time: booking.time,
      zone: $('#district').value, address: $('#address').value.trim(), pet: $('#pet').value.trim(), ref: $('#ref').value.trim(),
      method, service: c.service, mov: c.mov, disc: c.disc, total: c.total,
      status: 'cancelado', owner: user ? user.email : 'invitado', createdAt: Date.now()
    };
    VC.reservas.upsert(res);
    VC.store.set('booking', { ...booking, resId: res.id, address: res.address, pet: res.pet, ref: res.ref, method, zone: res.zone });

    setTimeout(() => {
      VC.modal({
        type: 'error',
        title: 'Pago cancelado',
        text: `No pudimos completar tu pago de ${VC.money(c.total)}. No se realizó ningún cobro. Puedes intentarlo de nuevo o revisar tu reserva.`,
        dismissible: false,
        actions: [
          { label: 'Intentar de nuevo', variant: 'btn-primary', onClick: () => { payBtn.disabled = false; payBtn.textContent = label; } },
          { label: 'Ver mis reservas', variant: 'btn-outline', href: 'mis-reservas.html' }
        ]
      });
    }, 1500);
  });

  renderSummary();
});
