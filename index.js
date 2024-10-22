
//Creamos la variable que contendrá la instancia del mapa, su posición y zoom
var mapa = L.map('contenedor-del-mapa').setView([-27.482881, -58.936211], 14);

//Agregamos una capa base y añadimos a la variable que contiene lo anterior ".addTo"
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?').addTo(mapa);


L.geoJson.ajax("http://localhost:8080/geoserver/obrasPublicas/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=obrasPublicas%3AAguas%20servidas&maxFeatures=50&outputFormat=application%2Fjson").addTo(mapa);