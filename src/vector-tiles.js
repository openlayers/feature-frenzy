import 'ol/ol.css';
import Overlay from 'ol/Overlay';
import VectorTileLayer from 'ol/layer/VectorTile';
import bright from './data/bright.json';
import dragdrop from 'drag-drop/buffer';
import {apply} from 'ol-mapbox-style';

const map = apply('map-container', bright);

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
  const style = files[0].toString().replace('{key}', 'ER67WIiPdCQvhgsUjoWK');
  apply(map, JSON.parse(style));
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
