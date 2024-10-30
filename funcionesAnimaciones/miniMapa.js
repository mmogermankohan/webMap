
// Crear una capa base para el minimapa (usa la misma que en el mapa principal)
let miniMapLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 21 });

// Crear e inicializar el minimapa
let miniMap = new L.Control.MiniMap(miniMapLayer, {
    toggleDisplay: true,       // Agregar botón para mostrar/ocultar el minimapa
    minimized: false,          // Mostrar el minimapa al cargar
    position: 'bottomright'     // Posición en la pantalla
}).addTo(map);                 // Añadir el minimapa al mapa principal
