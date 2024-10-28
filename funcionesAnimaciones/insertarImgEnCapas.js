/**Con este código logramos insertar la el escudo BQS dentro del contenedor
 * de capas, ya que al no poder introducir HTML por la librerìa Leaflet que renderiza
 * todo en un solo contendor con el id="map"; de esta manera logramos a través de JS
 */
// Asegúrate de que esto se ejecute después de la inicialización del mapa
const layersControl = document.querySelector('.leaflet-control-layers');

// Crea la imagen
const img = document.createElement('img');
img.src = './ico/favicosoysp.png'; // Ruta de la imagen
img.alt = 'Logo';
img.className = 'layer-icon'; // Añade una clase para aplicar estilos

// Estilo para la imagen
img.style.display = 'block';
img.style.margin = '0 auto'; // Centra horizontalmente
img.style.position = 'absolute'; // Para colocarla en una posición específica
img.style.bottom = '10px'; // Separación del fondo
img.style.left = '50%'; // Centro horizontal
img.style.transform = 'translateX(-50%)'; // Ajuste para centrar
img.style.width = '50px'; // Ajusta el tamaño según sea necesario
img.style.height = 'auto'; // Mantiene la proporción

// Añade la imagen al control de capas
layersControl.appendChild(img);

// Cambiar la imagen al hacer hover
layersControl.addEventListener('mouseover', () => {
    img.src = './ico/logoBqsCompletoFb.png'; // Ruta de la imagen al hacer hover
    img.style.width = '150px';
});

layersControl.addEventListener('mouseout', () => {
    img.src = './ico/favicosoysp.png'; // Ruta de la imagen original
    img.style.width = '50px';
});