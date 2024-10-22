// Obtener el contenedor del control de capas
const layerControl = document.querySelector('.leaflet-control-layers');

// Agregar un evento de clic para expandir/colapsar
layerControl.addEventListener('click', function (event) {
    // Evitar que el clic en los checkboxes colapse/expanda
    if (!event.target.closest('.leaflet-control-layers-list')) {
        layerControl.classList.toggle('expanded');
    }
});
