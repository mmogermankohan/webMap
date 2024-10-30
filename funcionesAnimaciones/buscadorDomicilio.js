const searchControl = L.Control.extend({
    onAdd: function (map) {
        // Crear un contenedor para el control de búsqueda
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-container leaflet-control-custom');

        // Crear un nuevo div para encerrar el input
        const inputWrapper = L.DomUtil.create('div', 'caja-input'); // Clase opcional para estilizar

        // Crear el input
        const input = L.DomUtil.create('input', 'buscador');
        input.type = 'text';
        input.placeholder = 'Buscar dirección...';

        // Agregar el input al wrapper
        inputWrapper.appendChild(input);

        // Agregar el wrapper al contenedor
        container.appendChild(inputWrapper);

        // Evento para manejar la búsqueda
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const query = input.value;

                // Especifica la ciudad y el país para limitar la búsqueda
                const city = "Barranqueras"; // Cambia esto por el nombre de tu ciudad
                const country = "Argentina"; // Cambia esto por el país correspondiente

                // Solicitud a la API de Nominatim con restricciones de búsqueda
                fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}, ${city}, ${country}&format=json&addressdetails=1&limit=5`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.length > 0) {
                            // Limpiar el mapa de cualquier marcador anterior
                            map.eachLayer(layer => {
                                if (layer instanceof L.Marker) {
                                    map.removeLayer(layer);
                                }
                            });

                            // Agregar marcadores para los resultados
                            data.forEach(location => {
                                const latLng = L.latLng(location.lat, location.lon);
                                const marker = L.marker(latLng).addTo(map)
                                    .bindPopup(`<strong>${location.display_name}</strong>`);

                                // Ajustar la vista del mapa al primer resultado
                                if (location === data[0]) {
                                    map.setView(latLng, 15); // Ajusta el nivel de zoom según sea necesario
                                }
                            });
                        } else {
                            alert('No se encontraron resultados para la búsqueda.');
                        }
                    })
                    .catch(error => {
                        console.error("Error en la búsqueda:", error);
                    });

                input.value = ''; // Limpiar el campo de entrada después de la búsqueda
            }
        });

        return container;
    },
    onRemove: function (map) {
        // Aquí puedes limpiar cualquier cosa si es necesario
    }
});

// Agregar el control de búsqueda al mapa
map.addControl(new searchControl());
