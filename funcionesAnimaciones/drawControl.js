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
