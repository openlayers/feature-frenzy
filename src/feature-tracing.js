import Draw from 'ol/interaction/Draw.js';
import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import LineString from 'ol/geom/LineString.js';
import Link from 'ol/interaction/Link.js';
import Map from 'ol/Map.js';
import Snap from 'ol/interaction/Snap.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import XYZ from 'ol/source/XYZ.js';

const firesUrl = new URL('./data/fires.geojson', import.meta.url);

// features in this layer will be snapped to
const baseVector = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: firesUrl.href,
  }),
  style: {
    'fill-color': 'rgba(255, 0, 0, 0.3)',
    'stroke-color': 'rgba(255, 0, 0, 0.9)',
    'stroke-width': 0.5,
  },
});

// this is were the drawn features go
const drawVector = new VectorLayer({
  source: new VectorSource(),
  style: {
    'stroke-color': 'rgba(0, 200, 0, 0.8)',
    'stroke-width': 2,
    'fill-color': 'rgba(0, 200, 0, 0.3)',
  },
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new XYZ({
        url: 'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=get_your_own_D6rA4zTHduk6KOKTXzGB',
        maxZoom: 20,
      }),
    }),
    baseVector,
    drawVector,
  ],
  target: 'map-container',
  view: new View({
    center: [-13378949, 5943751],
    zoom: 11.5,
  }),
});

const draw = new Draw({
  type: 'Polygon',
  source: drawVector.getSource(),
  trace: true,
  traceSource: baseVector.getSource(),
  style: {
    'stroke-color': 'rgba(255, 255, 100, 0.5)',
    'stroke-width': 1.5,
    'fill-color': 'rgba(255, 255, 100, 0.25)',
    'circle-radius': 6,
    'circle-fill-color': 'rgba(255, 255, 100, 0.5)',
  },
});

map.addInteraction(draw);

map.addInteraction(
  new Snap({
    source: baseVector.getSource(),
  })
);

map.addInteraction(
  new Snap({
    source: drawVector.getSource(),
  })
);

map.addInteraction(new Link());

document.addEventListener('keyup', (event) => {
  if (event.key === 'Escape') {
    draw.abortDrawing();
    drawVector.getSource().clear();
  }
});
