var map = L.map('map',{
    center: [3.454846, -76.559204],
    zoom:14.5,
   
    zoomControl: false
})

L.control.zoom({
    position:'topleft',
    zoomInText:'+',
    zoomOutText:'-',
    zoomInTitle: 'Acercar',
    zoomOutTitle:'Alejar'
}).addTo(map)

L.control.scale({
    maxWidth: 200,         // Ancho máximo
    metric: true,
    imperial:true,
    position:'bottomleft'
}).addTo(map)

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 10,
}).addTo(map);

var satelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Esri'})

var baseLayers = {
    'Cartografia basica': osm,
    'Satelital':satelite
}

var capaFondoComuna = L.tileLayer.wms('http://ec2-13-223-21-150.compute-1.amazonaws.com:8080/geoserver/taller_3_sig_3_comuna1/wms', {
  layers: 'taller_3_sig_3_comuna1:comuna_1_fondo',  // workspace:nombre_capa
  format: 'image/png',
  transparent: true,
  attribution: "© GeoServer"
}).addTo(map);

var capaVias = L.tileLayer.wms('http://ec2-13-223-21-150.compute-1.amazonaws.com:8080/geoserver/taller_3_sig_3_comuna1/wms', {
  layers: 'taller_3_sig_3_comuna1:vias_comuna1_proyectada',  // workspace:nombre_capa
  format: 'image/png',
  transparent: true,
  attribution: "© GeoServer"
}).addTo(map);

var capaComuna1 = L.tileLayer.wms('http://ec2-13-223-21-150.compute-1.amazonaws.com:8080/geoserver/taller_3_sig_3_comuna1/wms', {
  layers: 'taller_3_sig_3_comuna1:comuna_1_proyectada',  // workspace:nombre_capa
  format: 'image/png',
  transparent: true,
  attribution: "© GeoServer"
}).addTo(map);

var capaViasMat = L.tileLayer.wms('http://ec2-13-223-21-150.compute-1.amazonaws.com:8080/geoserver/taller_3_sig_3_comuna1/wms', {
  layers: 'taller_3_sig_3_comuna1:vias_material',  // workspace:nombre_capa
  format: 'image/png',
  transparent: true,
  attribution: "© GeoServer"
}).addTo(map);

var capaViasIncli = L.tileLayer.wms('http://ec2-13-223-21-150.compute-1.amazonaws.com:8080/geoserver/taller_3_sig_3_comuna1/wms', {
  layers: 'taller_3_sig_3_comuna1:vias_acceso_lim_proyectada',  // workspace:nombre_capa
  format: 'image/png',
  transparent: true,
  attribution: "© GeoServer"
}).addTo(map);

var capaParadasMio = L.tileLayer.wms('http://ec2-13-223-21-150.compute-1.amazonaws.com:8080/geoserver/taller_3_sig_3_comuna1/wms', {
  layers: 'taller_3_sig_3_comuna1:paradas_mio_comuna1_proyectada',  // workspace:nombre_capa
  format: 'image/png',
  transparent: true,
  attribution: "© GeoServer"
}).addTo(map);

var capaEstacion = L.tileLayer.wms('http://ec2-13-223-21-150.compute-1.amazonaws.com:8080/geoserver/taller_3_sig_3_comuna1/wms', {
  layers: 'taller_3_sig_3_comuna1:estacion_policia',  // workspace:nombre_capa
  format: 'image/png',
  transparent: true,
  attribution: "© GeoServer"
}).addTo(map);

var capaMotoraton = L.tileLayer.wms('http://ec2-13-223-21-150.compute-1.amazonaws.com:8080/geoserver/taller_3_sig_3_comuna1/wms', {
  layers: 'taller_3_sig_3_comuna1:moto_raton',  // workspace:nombre_capa
  format: 'image/png',
  transparent: true,
  attribution: "© GeoServer"
}).addTo(map);

var overlays = {
  "Comuna 1": capaFondoComuna,
  "Vías": capaVias,
  "Material vìas": capaViasMat,
  "Vías Inclinadas": capaViasIncli,
  "Paradas del MIO": capaParadasMio,
  "Contorno": capaComuna1,
  "Motoraton": capaMotoraton,
  "Estación de policia": capaEstacion
};


fetch('geojson/vias_json.geojson')
  .then(response => response.json())
  .then(data => {
    var geojsonLayer = L.geoJSON(data, {
      style: {
        color: 'black',
        weight: 2,
        fillOpacity: 0.5
      },
      onEachFeature: function (feature, layer) {
        if (feature.properties && feature.properties.nombre) {
          layer.bindPopup(feature.properties.nombre);
        }
      }
    });

    geojsonLayer.addTo(map);

    overlays["Nombre de vías inclinadas"] = geojsonLayer;

    L.control.layers(baseLayers, overlays, {
      collapsed: true,
      position: 'topleft'
    }).addTo(map);
  })
  .catch(error => console.error('Error cargando el GeoJSON:', error));

var marcador = L.marker([0, 0], {
  title: "Tu ubicación",
  icon: L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/64/64113.png',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  })
});
var circulo = L.circle([0, 0], {
  radius: 0,
  color: '#136AEC',
  fillColor: '#136AEC',
  fillOpacity: 0.3
});
var ubicacionUsuario = L.layerGroup([marcador, circulo]).addTo(map);

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      var radio = pos.coords.accuracy;

      marcador.setLatLng([lat, lon]);
      circulo.setLatLng([lat, lon]).setRadius(radio);

      // Centrar el mapa en la ubicación detectada
      map.setView([lat, lon], 16);
    },
    function (err) {
      console.error("No se pudo obtener la ubicación: ", err.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
} else {
  alert("Tu navegador no soporta geolocalización.");
}








