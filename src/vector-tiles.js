import 'ol/ol.css';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import VectorTileLayer from 'ol/layer/VectorTile';
import View from 'ol/View';
import dragdrop from 'drag-drop/buffer';
import olms from 'ol-mapbox-style';
import {Buffer} from 'buffer';
import {defaults} from 'ol/control/defaults.js';

/* global globalThis */
globalThis.Buffer = Buffer;

const map = new Map({
  target: 'map-container',
  view: new View({
    center: [1537187, 5963076],
    zoom: 17,
  }),
  controls: defaults({attributionOptions: {collapsible: false}}),
});

const surveyingUrl = new URL('./data/cadastre-surveying.json', import.meta.url);

olms(map, surveyingUrl.href);

function declutter(declutter) {
  const layers = map.getLayers();
  layers.forEach((layer, i) => {
    layers.setAt(
      i,
      new VectorTileLayer({
        source: layer.getSource(),
        style: layer.getStyle(),
        declutter: declutter,
      })
    );
  });
}

document.getElementById('clutter').addEventListener('click', function () {
  declutter(false);
});
document.getElementById('declutter').addEventListener('click', function () {
  declutter(true);
  map.getView().animate({
    center: [1537187, 5963076],
    zoom: 17,
    duration: 500,
  });
});
document.getElementById('richtext').addEventListener('click', function () {
  map.getView().animate({
    center: [1661881, 5879970],
    zoom: 19,
    duration: 500,
  });
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
  if (features) {
    overlay.setPosition(e.coordinate);
    overlayDiv.innerHTML = features[0].get('layer');
  } else {
    overlay.setPosition();
  }
});
