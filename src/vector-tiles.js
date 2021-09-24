import 'ol/ol.css';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import VectorTileLayer from 'ol/layer/VectorTile';
import View from 'ol/View';
import dragdrop from 'drag-drop/buffer';
import olms from 'ol-mapbox-style';
import {fromLonLat} from 'ol/proj';

const map = new Map({
  target: 'map-container',
  view: new View({
    center: fromLonLat([-34.603333, -58.381667].reverse()),
    zoom: 16,
  }),
});

olms(
  map,
  'https://api.maptiler.com/maps/bright/style.json?key=lirfd6Fegsjkvs0lshxe'
);

function declutter(declutter) {
  const layers = map.getLayers();
  const layer = layers.item(layers.getLength() - 1);
  map.removeLayer(layer);
  map.addLayer(
    new VectorTileLayer({
      source: layer.getSource(),
      style: layer.getStyle(),
      declutter: declutter,
    })
  );
}

document.getElementById('clutter').addEventListener('click', function () {
  declutter(false);
});
document.getElementById('declutter').addEventListener('click', function () {
  declutter(true);
});

dragdrop('#map-container', function (files) {
  map.getLayers().clear();
  const style = files[0].toString().replace('{key}', 'lirfd6Fegsjkvs0lshxe');
  olms(map, JSON.parse(style));
});

const overlayDiv = document.getElementById('overlay');
const overlay = new Overlay({
  element: overlayDiv,
  positioning: 'bottom-center',
});
map.addOverlay(overlay);
overlayDiv.addEventListener('click', function () {
  overlay.setPosition();
});

map.on('click', function (e) {
  const features = map.getFeaturesAtPixel(e.pixel);
  if (features && features[0].get('class')) {
    overlay.setPosition(e.coordinate);
    overlayDiv.innerHTML =
      features[0].get('layer') + ' ' + features[0].get('class');
  } else {
    overlay.setPosition();
  }
});
