// Creamos el mapa y definimos la vista inicial
var map = L.map('map', {
    zoomControl: false,
    center: [-27.482860, -58.936142], // Coordenadas de Barranqueras
    zoom: 13,
    maxZoom: 21
});

// Agregamos el mapa bases 
let sinBase = L.tileLayer('', {
    maxZoom: 21
}).addTo(map);

let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 21
}).addTo(map);

let cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 21
}).addTo(map);

let googleMaps = L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 21
}).addTo(map);


// Creamos las capas WMS
let chacras = L.tileLayer.wms("http://172.16.1.58:8080/geoserver/Barranqueras/wms?", {
    layers: "chacras84",
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: "DPDyVI",
    maxZoom: 21
}).addTo(map);

let manzanas = L.tileLayer.wms("http://172.16.1.58:8080/geoserver/Barranqueras/wms?", {
    layers: "mz",
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: "DPDyVI",
    maxZoom: 21
}).addTo(map);

let parcelas = L.tileLayer.wms("http://172.16.1.58:8080/geoserver/Barranqueras/wms?", {
    layers: "parcelas84",
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: "DPDyVI",
    maxZoom: 21
}).addTo(map);

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


// Control de capas
L.control.layers(mapaBase, overlays).addTo(map);

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
            color = 'black'; // Puedes definir otro color si es necesario
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
            fillOpacity: 0
        });
    }
}

// Escuchar cambios en la capa base y actualizar el estilo de las parcelas
map.on('baselayerchange', function (event) {
    updateParcelStyle(event.name); // Pasa el nombre de la capa base al cambiar
});

//HERRAMIENTAS DE DIBUJO
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
    drawnItems.addLayer(layer);  // Añadimos el polígono al grupo
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
