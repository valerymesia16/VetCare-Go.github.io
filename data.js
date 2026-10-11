/* ==========================================================
   VetCare Go · datos de ejemplo (aquí editas veterinarios,
   servicios, precios y horarios)
   ========================================================== */
window.VC = window.VC || {};

VC.data = {
  zones: ['San Isidro', 'Miraflores'],

  // Costo de movilidad según distrito (S/)
  movilidad: { 'San Isidro': 10, 'Miraflores': 12 },

  services: [
    { id: 'general', name: 'Medicina general', icon: '🩺', from: 75,
      desc: 'Chequeo, diagnóstico y tratamiento.',
      items: ['Examen clínico completo', 'Diagnóstico y receta', 'Seguimiento por WhatsApp'] },
    { id: 'emergencias', name: 'Emergencias', icon: '🚑', from: 95,
      desc: 'Atención rápida cuando más lo necesitas.',
      items: ['Llegada prioritaria', 'Estabilización en casa', 'Derivación si se requiere'] },
    { id: 'vacunacion', name: 'Vacunación', icon: '💉', from: 75,
      desc: 'Esquema completo sin salir de casa.',
      items: ['Carnet de vacunas', 'Vacunas importadas', 'Recordatorio de refuerzos'] },
    { id: 'desparasitacion', name: 'Desparasitación', icon: '🛡️', from: 60,
      desc: 'Control de pulgas, garrapatas y parásitos internos.',
      items: ['Dosis según peso', 'Plan preventivo mensual', 'Orientación para el hogar'] },
    { id: 'cachorros', name: 'Control de cachorros', icon: '🐶', from: 70,
      desc: 'Primeros meses de vida con acompañamiento experto.',
      items: ['Plan de vacunas', 'Nutrición y crecimiento', 'Consejos de socialización'] },
    { id: 'geriatria', name: 'Mascotas senior', icon: '🐾', from: 85,
      desc: 'Cuidado atento para mascotas mayores de 7 años.',
      items: ['Chequeo articular', 'Control de peso', 'Plan de cuidado personalizado'] }
  ],

  vets: [
    {
      id: 'rodrigo-silva', name: 'Dr. Rodrigo Silva', initials: 'RS',
      serviceId: 'general', specialty: 'Medicina general', title: 'Medicina veterinaria general',
      rating: 4.9, reviews: 86, price: 80, zones: ['San Isidro', 'Miraflores'],
      photo: 'img/vets/rodrigo.png',
      bio: 'Más de 8 años atendiendo perros y gatos. Prefiere explicar cada paso del tratamiento con calma para que la familia se sienta tranquila.',
      slots: {
        0: ['3:00 p. m.', '4:30 p. m.', '6:00 p. m.'],
        1: ['9:00 a. m.', '11:00 a. m.', '3:00 p. m.'],
        2: ['10:00 a. m.', '2:00 p. m.', '5:00 p. m.']
      },
      comments: [
        { by: 'Camila M.', stars: 5, text: 'Llegó puntual y fue muy cuidadoso con mi gato.' },
        { by: 'Luis A.', stars: 5, text: 'Explicó todo el tratamiento con calma, muy recomendado.' },
        { by: 'Andrea P.', stars: 4, text: 'Muy amable con mi perro, que suele ser nervioso.' }
      ]
    },
    {
      id: 'jorge-cruz', name: 'Dr. Jorge Cruz', initials: 'JC',
      serviceId: 'emergencias', specialty: 'Emergencias', title: 'Medicina veterinaria de emergencias',
      rating: 4.7, reviews: 39, price: 95, zones: ['San Isidro'],
      photo: 'img/vets/jorge.png',
      bio: 'Especialista en urgencias y cuidados críticos. Lleva equipo portátil para estabilizar a tu mascota en casa antes de cualquier traslado.',
      slots: {
        0: ['5:30 p. m.', '7:00 p. m.'],
        1: ['8:00 a. m.', '12:00 p. m.', '5:30 p. m.'],
        2: ['9:30 a. m.', '1:00 p. m.']
      },
      comments: [
        { by: 'Rosa T.', stars: 5, text: 'Llegó rápido cuando mi perrito se intoxicó. Gracias por todo.' },
        { by: 'Mateo G.', stars: 4, text: 'Muy profesional, me dio tranquilidad en un mal momento.' }
      ]
    },
    {
      id: 'milagros-paz', name: 'Dra. Milagros Paz', initials: 'MP',
      serviceId: 'vacunacion', specialty: 'Vacunación', title: 'Medicina veterinaria preventiva',
      rating: 4.8, reviews: 54, price: 75, zones: ['San Isidro', 'Miraflores'],
      photo: 'img/vets/milagros.png',
      bio: 'Se especializa en planes de vacunación y medicina preventiva para cachorros y adultos. Muy paciente con mascotas tímidas.',
      slots: {
        0: ['6:30 p. m.'],
        1: ['9:00 a. m.', '10:30 a. m.', '4:00 p. m.'],
        2: ['9:00 a. m.', '11:30 a. m.', '3:30 p. m.']
      },
      comments: [
        { by: 'Valeria M.', stars: 5, text: 'Mi cachorro no sintió nada. Súper dulce y ordenada.' },
        { by: 'Diego R.', stars: 5, text: 'Me dejó el carnet al día y un recordatorio para el refuerzo.' }
      ]
    }
  ],

  homeReviews: [
    { by: 'Valeria M.', stars: 5, text: 'Pude reservar en pocos minutos y el veterinario llegó a tiempo.' },
    { by: 'Camila P.', stars: 4, text: 'Mi perrita se puso nerviosa con los traslados, así que la atención en casa nos ayudó mucho.' },
    { by: 'Diego R.', stars: 5, text: 'Me gustó ver el precio antes de reservar, todo fue claro y sencillo.' }
  ],

  faqs: [
    { q: '¿Cuándo se cobra la reserva?', a: 'Verás el total final antes de pagar. El cobro solo se realiza al confirmar el pago en el último paso.' },
    { q: '¿Qué medios de pago aceptan?', a: 'Yape, Plin y tarjetas de crédito o débito. Todo con pago seguro y sin costos ocultos.' },
    { q: '¿Qué zonas cubren?', a: 'Por ahora atendemos San Isidro y Miraflores. Pronto sumaremos más distritos de Lima.' },
    { q: '¿Los veterinarios están verificados?', a: 'Sí. Cada profesional pasa por una validación de su colegiatura antes de aparecer en la plataforma.' },
    { q: '¿Puedo cancelar o reprogramar?', a: 'Puedes gestionar tus reservas desde la sección “Mis reservas”, donde también verás el estado de cada pago.' }
  ]
};
