import MapboxVectorLayer from 'ol/layer/MapboxVector';
import {Map, View} from 'ol';
import {Stroke, Style} from 'ol/style';
import {VectorTile} from 'ol/layer';
import {fromLonLat} from 'ol/proj';
import {recordStyleLayer} from 'ol-mapbox-style';

recordStyleLayer(true);

const selected = new Style({
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0.8)',
    width: 1.5,
  }),
});
const selectionLayer = new VectorTile({
  style: () => {},
});

const info = document.getElementById('output');
function showInfo(features) {
  const selection = features.map((feature) => feature.get('bofo_id'));
  selectionLayer.setStyle((feature) =>
    selection.includes(feature.get('bofo_id')) ? selected : null
  );
  if (features.length === 0) {
    info.innerText = '';
    info.style.opacity = 0;
    return;
  }
  const ids = features.map((feature) => feature.get('mapbox-layer').id);
  info.innerText = ids.join(',');
  info.style.opacity = 1;
}

const layer = new MapboxVectorLayer({
  styleUrl: 'https://bodenkarte.at/styles/typengruppe.json',
});

layer.on('change:source', () => selectionLayer.setSource(layer.getSource()));

const map = new Map({
  target: 'map-container',
  layers: [layer, selectionLayer],
  view: new View({
    center: fromLonLat([15.51, 47.28]),
    zoom: 14,
  }),
});

map.on('pointermove', (event) => {
  layer.getFeatures(event.pixel).then(showInfo);
});
