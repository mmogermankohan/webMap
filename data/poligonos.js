/**En este documento mostramos el ejemplo de como podríamos a parte
 * los archivos GeoJSON para que el "index.js" no quede tan cargado
 */

var poligonoDeInteres = {
    "type": "FeatureCollection",
    "features": [
    {
        "type": "Feature",
        "properties": {},
        "geometry": {
        "coordinates": [
            [
            [
                -58.94201227825516,
                -27.482851129315215
            ],
            [
                -58.94141882664883,
                -27.48284747320414
            ],
            [
                -58.94089955649345,
                -27.48239045835505
            ],
            [
                -58.94173203721908,
                -27.48166288680204
            ],
            [
                -58.94253154841056,
                -27.48239045835505
            ],
            [
                -58.94201227825516,
                -27.482851129315215
            ]
            ]
        ],
        "type": "Polygon"
        }
    }
    ]
}

L.geoJSON( poligonoDeInteres, {
    style: {
        color: 'Green',
        fill: 'Green',
        
    }
}).addTo( mapa );