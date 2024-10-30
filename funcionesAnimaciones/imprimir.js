
/** LOGICA PARA EL BOTON DE IMPRESIÓN */
/************************************ */
// Funciones para ocultar y mostrar controles
function hideControls() {
    const controls = document.getElementsByClassName('leaflet-control');
    for (let control of controls) {
        control.style.display = 'none'; // Oculta los controles de Leaflet
    }
    document.querySelector('.print-button').style.display = 'none'; // Oculta el botón de imprimir
}

function showControls() {
    const controls = document.getElementsByClassName('leaflet-control');
    for (let control of controls) {
        control.style.display = 'block'; // Muestra los controles de Leaflet
    }
    document.querySelector('.print-button').style.display = 'block'; // Muestra el botón de imprimir
}

// Llama a showControls() después de imprimir o cancelar
window.onafterprint = showControls; // Asegúrate de que esta línea esté en el lugar correcto

// Función para ocultar los controles y ajustar el mapa para impresión
function setupPrintView() {
    const mapContainer = document.getElementById('map');
    // Ajuste de tamaño del contenedor del mapa
    mapContainer.style.width = '100vw';
    mapContainer.style.height = '100vh';
    hideControls();
}
// Función para restaurar la vista del mapa después de imprimir
function restoreMapView() {
    const mapContainer = document.getElementById('map');
    // Restaura el tamaño original del mapa
    mapContainer.style.width = '';
    mapContainer.style.height = '';
    showControls();
}
// Configuración del botón de impresión en el mapa
const printButton = L.control({ position: 'bottomright' });
//En lugar de un InnerHTML con el texto "Imprimir", lo reemplazamos
//por un btn y su icono
printButton.onAdd = function () {
    const button = L.DomUtil.create('button', 'print-button');

    // Cargar el ícono SVG en lugar de texto
    const icon = document.createElement('img');
    icon.src = './ico/print-solid.svg'; // Ruta del ícono SVG
    icon.alt = 'Imprimir'; // Texto alternativo para accesibilidad
    icon.style.width = '24px'; // Ajusta el tamaño según tus preferencias
    icon.style.height = '24px';

    // Insertar el ícono en el botón
    button.appendChild(icon);

    button.style.display = 'block';
    button.onclick = function () {
        setupPrintView(); // Configura el mapa para impresión
        window.print(); // Inicia la impresión
    };

    return button;
};

printButton.onclick = function () {
    hideControls(); // Oculta los controles
    // Ajustar el tamaño del mapa antes de imprimir
    const mapContainer = document.getElementById('map');
    const originalWidth = mapContainer.style.width;
    const originalHeight = mapContainer.style.height;

    // Ajusta el tamaño del contenedor del mapa para que ocupe toda la página
    mapContainer.style.width = '100%';
    mapContainer.style.height = '100vh';

    window.print(); // Inicia la impresión

    // Restablecer el tamaño original después de imprimir
    mapContainer.style.width = originalWidth;
    mapContainer.style.height = originalHeight;
    window.onafterprint = showControls; // Muestra nuevamente los controles después de imprimir
};


// Añadir el control al mapa
printButton.addTo(map);


/** LOGICA PARA EL BOTON DE IMPRESIÓN */
