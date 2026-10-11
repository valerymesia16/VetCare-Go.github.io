# VetCare Go · Frontend (HTML + CSS + JS)

Abre `index.html` en el navegador (o usa la extensión "Live Server" de VS Code). No necesita backend.

## Estructura
```
PROYEC-VET/
├── index.html            Inicio
├── servicios.html        Catálogo de servicios + preguntas frecuentes
├── veterinarios.html     Listado con filtros (fecha, zona, orden)
├── perfil.html           Perfil del veterinario + reserva (?id=rodrigo-silva)
├── pago.html             Confirma y paga  → muestra "Pago cancelado"
├── mis-reservas.html     Estado de reservas, reintentar pago, eliminar
├── ingresar.html         Ingresar / Crear cuenta (simulado)
├── css/styles.css        Estilos globales
├── js/data.js            Veterinarios, servicios, precios y horarios (EDITA AQUÍ)
├── js/app.js             Header, footer, modal, toast, sesión, utilidades
├── js/home.js · servicios.js · veterinarios.js · perfil.js · pago.js · reservas.js · ingresar.js
└── img/
    ├── hero.jpg                  Foto del inicio
    └── vets/rodrigo.jpg, jorge.jpg, milagros.jpg
```

## Imágenes
Copia tus fotos de Figma con esos nombres. Si no existen, se muestran iniciales / un fondo de color.

## Cuenta demo
`demo@vetcare.pe` / `demo1234` (o el botón "Usar cuenta demo"). Con sesión iniciada se aplica el 50% en la primera reserva.

## Nota
Todo se guarda en `localStorage` del navegador (sesión, reservas). Las contraseñas no están protegidas: es solo una simulación para el prototipo.
