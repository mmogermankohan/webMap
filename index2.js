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




/** ↓↓↓ LOGICA PARA EL POSICIONAMIENTO EN EL MAPA CON LA URL ↓↓↓ */
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
/** ↑↑↑ LOGICA PARA EL POSICIONAMIENTO EN EL MAPA CON LA URL ↑↑↑ */


// URL para obtener la capa GeoJSON de GeoServer
const geojsonUrl = "http://172.16.1.58:8080/geoserver/Barranqueras/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Barranqueras%3Aparcelas84&outputFormat=application%2Fjson";

// Variable para almacenar la capa GeoJSON
let geojsonLayer;


// Crear un contenedor para los controles de búsqueda
//const searchContainer = L.DomUtil.create('div', 'buscadores');
