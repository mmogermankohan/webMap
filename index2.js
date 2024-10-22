// Creamos el mapa y definimos la vista inicial
var map = L.map('map', {
    zoomControl: false,
    center: [-27.482860, -58.936142], // Coordenadas de Barranqueras
    zoom: 13,
});

// Agregamos el mapa base de OpenStreetMap
let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Creamos las capas WMS
let chacras = L.tileLayer.wms("http://localhost:8080/geoserver/Barranqueras/wms?", {
    layers: "chacras84",
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: "DPDyVI"
}).addTo(map);

let manzanas = L.tileLayer.wms("http://localhost:8080/geoserver/Barranqueras/wms?", {
    layers: "mz",
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: "DPDyVI"
}).addTo(map);

let parcelas = L.tileLayer.wms("http://localhost:8080/geoserver/Barranqueras/wms?", {
    layers: "parcelas84",
    format: 'image/png',
    transparent: true,
    version: '1.1.1',
    attribution: "DPDyVI",
}).addTo(map);

// Añadimos la capa base al control
let mapaBase = {
    'OpenStreetMap': osm
};

let overlays = {
    'Chacras': chacras,
    'Manzanas': manzanas,
    'Parcelas': parcelas,
};

// Control de capas
L.control.layers(mapaBase, overlays).addTo(map);

// URL para obtener la capa GeoJSON de GeoServer
const geojsonUrl = "http://localhost:8080/geoserver/Barranqueras/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Barranqueras%3Aparcelas84&outputFormat=application%2Fjson";

// Variable para almacenar la capa GeoJSON
let geojsonLayer;

// Cargamos el GeoJSON desde GeoServer y lo añadimos al mapa
fetch(geojsonUrl)
    .then(response => response.json())
    .then(data => {
        console.log("GeoJSON de Parcelas:", data); // Muestra la información del GeoJSON

        // Estilos para las parcelas
        geojsonLayer = L.geoJson(data, {
            style: {
                color: 'black',      // Color del borde
                fillColor: 'black',  // Color de relleno
                fillOpacity: 0.2,     // Opacidad del relleno
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
                console.log("Ubicación encontrada:", latlng); // Muestra las coordenadas encontradas
                console.log("Título del elemento:", title);   // Muestra el título (catastro)

                // Ajustar el nivel de zoom cuando se hace clic en el resultado
                const zoomLevel = 21; // Ajusta el nivel de zoom si es necesario
                map.setView(latlng, zoomLevel); // Cambia la vista del mapa a la ubicación

                // Obtener la capa que corresponde al resultado de la búsqueda
                const foundLayer = searchLayer.getLayers().find(layer => layer.feature.properties.catastro === title);

                if (foundLayer) {
                    // Abrir automáticamente el popup del elemento encontrado
                    foundLayer.openPopup();
                }
            },
            marker: false // No mostrar el marcador por defecto
        });

        // Añadimos el control de búsqueda al mapa
        map.addControl(searchControl);
    })
    .catch(error => {
        console.error("Error cargando el GeoJSON:", error); // Muestra el error si algo falla
    });
