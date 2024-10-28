// Función para obtener los parámetros de la URL
/**
 * Esta función nos permite ver en la URL los datos de zoom, latitud y longitud
 * para poder compartir la URL y que guarde la posición, ya que antes no podíamos 
 * ver ningún dato y tampoco compartir la URL con la posición de preferencia.
 */
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        zoom: parseInt(urlParams.get('zoom'), 10) || 13, // Valor predeterminado de zoom
        lat: parseFloat(urlParams.get('lat')) || -27.482860, // Valor predeterminado de latitud
        lng: parseFloat(urlParams.get('lng')) || -58.936142, // Valor predeterminado de longitud
        layers: urlParams.get('layers') ? urlParams.get('layers').split(',') : [], // Valor predeterminado para las capas
    };
}

// Obtener parámetros de la URL
const params = getUrlParams();

// Creamos el mapa y definimos la vista inicial utilizando los parámetros de la URL
/**
 * Esto se modifica para poder obtener desde la URL la posición por si llegaramos a compartir 
 * y que este no vuelva a la posición inicial perdiendo el rastro.
 */
var map = L.map('map', {
    zoomControl: false,
    center: [params.lat, params.lng], // Usar lat y lng de los parámetros
    zoom: params.zoom, // Usar zoom de los parámetros
    maxZoom: 21
});

// Agregamos el mapa base 
let sinBase = L.tileLayer('', { maxZoom: 21 });
let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 21 });
let cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 21 });
let googleMaps = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', { maxZoom: 21 });

// Creamos las capas WMS
let chacras = L.tileLayer.wms("http://172.16.1.58:8080/geoserver/Barranqueras/wms?", {
    layers: "chacras84",
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: "DPDyVI",
    maxZoom: 21
});

let manzanas = L.tileLayer.wms("http://172.16.1.58:8080/geoserver/Barranqueras/wms?", {
    layers: "mz",
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: "DPDyVI",
    maxZoom: 21
});

let parcelas = L.tileLayer.wms("http://172.16.1.58:8080/geoserver/Barranqueras/wms?", {
    layers: "parcelas84",
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: "DPDyVI",
    maxZoom: 21
});

// Añadimos la capa base al control
let mapaBase = {
    'Sin base': sinBase,
    'OpenStreetMap': osm,
    'Modo Oscuro': cartoDark,
    'Google Maps': googleMaps,
};

let overlays = {
    'Chacras': chacras,
    'Manzanas': manzanas,
    'Parcelas': parcelas,
};

// Añadiendo el control de capas - Posicionando el controlador de capas a la izquierda de la pantalla
L.control.layers(mapaBase, overlays, { position: 'topleft' }).addTo(map);



/** LOGICA PARA EL BOTON DE IMPRESIÓN */
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

printButton.onAdd = function () {
    const button = L.DomUtil.create('button', 'print-button');
    button.innerHTML = 'Imprimir';
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


/** LOGICA PARA EL POSICIONAMIENTO EN EL MAPA CON LA URL */
// Agregar las capas especificadas en la URL
params.layers.forEach(layer => {
    if (mapaBase[layer]) {
        map.addLayer(mapaBase[layer]);
    }
});

// Función para actualizar la URL con la posición y el zoom actuales
function updateURL() {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const layers = Object.keys(mapaBase).filter(base => map.hasLayer(mapaBase[base])).join(',');
    const newUrl = `?zoom=${zoom}&lat=${center.lat}&lng=${center.lng}&layers=${layers}`;
    window.history.replaceState({}, '', newUrl); // Actualiza la URL sin recargar la página
}

// Escuchar el evento 'moveend' para actualizar la URL
map.on('moveend', updateURL);

// Llama a updateURL al iniciar el mapa para reflejar la vista inicial
updateURL();
/** LOGICA PARA EL POSICIONAMIENTO EN EL MAPA CON LA URL */


// URL para obtener la capa GeoJSON de GeoServer
const geojsonUrl = "http://172.16.1.58:8080/geoserver/Barranqueras/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Barranqueras%3Aparcelas84&outputFormat=application%2Fjson";

// Variable para almacenar la capa GeoJSON
let geojsonLayer;

// Función para cambiar el color de las parcelas según la capa base seleccionada
function updateParcelStyle(baseLayerName) {
    let color, fillColor;

    // Cambia los colores según el nombre de la capa base seleccionada
    switch (baseLayerName) {
        case 'OpenStreetMap':
            color = 'gray';
            fillColor = 'gray';
            break;
        case 'Modo Oscuro':
            color = 'white';
            fillColor = 'white';
            break;
        case 'Google Maps':
            color = '#ffee00ad';
            fillColor = 'yellow';
            break;
        case 'Sin base':
            color = 'black';
            fillColor = 'black';
            break;
        default:
            color = 'gray';
            fillColor = 'gray';
    }

    // Actualiza el estilo de las parcelas
    if (geojsonLayer) {
        geojsonLayer.setStyle({
            color: color,
            fillColor: fillColor,
            fillOpacity: 0.2
        });
    }
}

// Escuchar cambios en la capa base y actualizar el estilo de las parcelas
map.on('baselayerchange', function (event) {
    updateParcelStyle(event.name); // Pasa el nombre de la capa base al cambiar
});

// HERRAMIENTAS DE DIBUJO
// Configuramos Leaflet Draw
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var drawControl = new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polygon: true, // Habilitamos solo la opción de dibujar polígonos
        polyline: true,
        rectangle: true,
        circle: true,
        marker: true,
        circlemarker: true
    }
});
map.addControl(drawControl);

// Escuchamos el evento 'draw:created' para añadir el polígono al mapa
map.on(L.Draw.Event.CREATED, function (event) {
    var layer = event.layer;
    drawnItems.addLayer(layer); // Añadimos el polígono al grupo
});

// Cargamos el GeoJSON desde GeoServer y lo añadimos al mapa
fetch(geojsonUrl)
    .then(response => response.json())
    .then(data => {
        //console.log("GeoJSON de Parcelas:", data); // Muestra la información del GeoJSON

        // Estilos para las parcelas
        geojsonLayer = L.geoJson(data, {
            style: {
                color: 'gray',      // Color del borde
                fillColor: 'gray',  // Color de relleno
                fillOpacity: 0.2,    // Opacidad del relleno
            },

            // Información en el popup y etiquetas para cada parcela
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.catastro) {
                    // Añadir un popup con la información de la parcela
                    layer.bindPopup(
                        "<h2>" + "Parcela: " + feature.properties.parc + "</h2>" +
                        "<strong>Nomenclatura:</strong> " + feature.properties.catastro + "</br>" +
                        "<strong>Cuenta:</strong> " + feature.properties.cuenta + "</br>" +
                        "<strong>Mensura:</strong> " + feature.properties.mensura + "</br>" +
                        "<strong>Mensura P.A.:</strong> " + feature.properties.mensura_pa + "</br>" +
                        "<strong>Polígono:</strong> " + feature.properties.poligono + "</br>" +
                        "<strong>Observaciones:</strong> " + feature.properties.obs
                    );
                    // Agregar el evento 'click' para resaltar el elemento seleccionado
                    layer.on('click', function () {
                        // Restablecer el estilo de todas las capas al color inicial
                        geojsonLayer.eachLayer(function (layer) {
                            layer.setStyle({
                                color: 'gray',
                                fillColor: 'gray',
                                fillOpacity: 0.2,
                            });
                        });

                        // Cambiar el estilo del elemento clicado
                        layer.setStyle({
                            color: '#3f0',       // Color del borde seleccionado
                            fillColor: '#3f0',   // Color de relleno seleccionado
                            fillOpacity: 0.3,    // Opacidad del relleno seleccionado
                        });
                    });
                }
            }
        }).addTo(map);

        // Crear un grupo de capas para el buscador
        const searchLayer = L.layerGroup().addTo(map);
        geojsonLayer.eachLayer(function (layer) {
            searchLayer.addLayer(layer);
        });

        // Configuramos el buscador sobre el searchLayer
        const searchControl = new L.Control.Search({
            layer: searchLayer,           // Grupo de capas donde buscar
            propertyName: 'catastro',      // El atributo que queremos buscar
            zoom: 18,                     // Zoom base cuando se encuentra un resultado
            moveToLocation: function (latlng, title, map) {
                //console.log("Ubicación encontrada:", latlng); // Muestra las coordenadas encontradas
                //console.log("Título del elemento:", title);   // Muestra el título (catastro)

                // Ajustar el nivel de zoom cuando se hace clic en el resultado
                const zoomLevel = 21; // Ajusta el nivel de zoom si es necesario
                map.setView(latlng, zoomLevel); // Cambia la vista del mapa a la ubicación

                // Obtener la capa que corresponde al resultado de la búsqueda
                const foundLayer = searchLayer.getLayers().find(layer => layer.feature.properties.catastro === title);

                if (foundLayer) {
                    // Abrir automáticamente el popup del elemento encontrado
                    foundLayer.openPopup();

                    // Añadir clase CSS para la animación flash
                    let layerElement = foundLayer.getElement();
                    if (layerElement) {
                        layerElement.classList.add('animated-flash');
                        // Remover la clase después de la animación para que se quede fijo en #3f0
                        setTimeout(() => {
                            foundLayer.setStyle({
                                color: '#3f0',     // Color final del borde
                                fillColor: '#3f0'  // Color final del relleno
                            });
                            layerElement.classList.remove('animated-flash');
                        }, 1000); // Duración de 2 repeticiones (0.5s * 2)
                    }
                }
            },
            marker: false // No mostrar el marcador por defecto
        });

        // Evento para restaurar los colores originales al colapsar la búsqueda
        searchControl.on('search:collapsed', function () {
            geojsonLayer.eachLayer(function (layer) {
                geojsonLayer.resetStyle(layer); // Restaurar el estilo original
            });
        });
        // Añadimos el control de búsqueda al mapa
        map.addControl(searchControl);
    })


    .catch(error => {
        console.error("Error cargando el GeoJSON:", error); // Muestra el error si algo falla
    });
