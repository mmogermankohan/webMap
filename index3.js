// Creamos el mapa y definimos la vista inicial
var map = L.map('map', {
    zoomControl: false,
    center: [-27.482860, -58.936142],
    zoom: 13,
    layers: []
});

// Agregamos el mapa base de OpenStreetMap
let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Agregamos el control de capas
let layerControl = L.control.layers({ 'OpenStreetMap': osm }, {}).addTo(map);

// Definimos el URL del servicio WFS que devuelve los datos en formato GeoJSON
let wfsUrl = 'http://localhost:8080/geoserver/Barranqueras/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Barranqueras%3Achacras&maxFeatures=50&outputFormat=application%2Fjson';

// Cargamos los datos desde GeoServer usando fetch y los añadimos al mapa
fetch('http://localhost:8080/geoserver/Barranqueras/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Barranqueras:chacras&outputFormat=application/json')
    .then(response => response.json())
    .then(data => {
        // Creamos la capa GeoJSON
        let chacrasLayer = L.geoJSON(data, {
            style: {
                color: 'palevioletred',
                fillColor: 'palevioletred',
                fillOpacity: 0.2
            },
            onEachFeature: function (feature, layer) {
                // Configuramos el popup para cada chacra
                layer.bindPopup("Chacra: " + feature.properties.CH);
            }
        }).addTo(map);

        // Añadimos la capa al control de capas
        layerControl.addOverlay(chacrasLayer, 'Chacras');

        // Configuramos el control de búsqueda para la capa de chacras
        const searchControl = new L.Control.Search({
            layer: chacrasLayer,   // Capa sobre la que se hará la búsqueda
            zoom: 21,              // Zoom al encontrar la característica
            propertyName: 'CH'      // Propiedad por la que se buscará (en este caso 'CH')
        });

        // Añadimos el control de búsqueda al mapa
        map.addControl(searchControl);
    })
    .catch(error => {
        console.error('Error al cargar el GeoJSON desde GeoServer:', error);
    });
