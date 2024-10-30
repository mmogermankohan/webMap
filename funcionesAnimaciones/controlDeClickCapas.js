// Objeto que mapea los nombres de las capas base a sus colores
const baseLayerColors = {
    'OpenStreetMap': {
        color: 'gray',
        fillColor: 'gray'
    },
    'Modo Oscuro': {
        color: 'white',
        fillColor: 'white'
    },
    'Google Maps': {
        color: '#ffee00ad',
        fillColor: 'yellow'
    },
    'Sin base': {
        color: 'black',
        fillColor: 'black'
    }
};

// Función para cambiar el color de las parcelas según la capa base seleccionada
function updateParcelStyle(baseLayerName) {
    // Obtiene los colores del objeto basado en el nombre de la capa base
    const layerColors = baseLayerColors[baseLayerName] || baseLayerColors['OpenStreetMap'];

    // Actualiza el estilo de las parcelas
    if (geojsonLayer) {
        geojsonLayer.setStyle({
            color: layerColors.color,
            fillColor: layerColors.fillColor,
            fillOpacity: 0.2
        });
    }
}

// Escuchar cambios en la capa base y actualizar el estilo de las parcelas
map.on('baselayerchange', function (event) {
    updateParcelStyle(event.name); // Pasa el nombre de la capa base al cambiar
});