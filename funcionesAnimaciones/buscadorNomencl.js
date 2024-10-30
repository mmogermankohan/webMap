
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