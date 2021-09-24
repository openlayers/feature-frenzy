import 'ol/ol.css';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {Map, View} from 'ol';
import {Tile as TileLayer, WebGLPoints as WebGLPointsLayer} from 'ol/layer';
import {Vector as VectorSource, XYZ} from 'ol/source';
import {fromLonLat} from 'ol/proj';

const meteoriteUrl = new URL('./data/meteorites.csv', import.meta.url);

const source = new VectorSource();

const client = new XMLHttpRequest();
client.open('GET', meteoriteUrl);
client.onload = function () {
  const csv = client.responseText;
  let curIndex;
  let prevIndex = 0;
  const features = [];

  while ((curIndex = csv.indexOf('\n', prevIndex)) > 0) {
    const line = csv.substr(prevIndex, curIndex - prevIndex).split(',');

    prevIndex = curIndex + 1;
    if (prevIndex === 0) {
      continue; // skip header
    }

    const coords = fromLonLat([parseFloat(line[4]), parseFloat(line[3])]);

    features.push(
      new Feature({
        mass: parseFloat(line[1]) || 0,
        year: parseInt(line[2]) || 0,
        geometry: new Point(coords),
      })
    );
  }
  source.addFeatures(features);
};
client.send();

//! [years]
const minYear = 1850;
const maxYear = 2015;
const span = maxYear - minYear;
const rate = 10; // years per second

const start = Date.now();

const styleVariables = {
  currentYear: minYear,
};
//! [years]

//! [expressions]
const period = 10;
const periodStart = ['-', ['var', 'currentYear'], period];
const decay = [
  'interpolate',
  ['linear'],
  ['get', 'year'],
  periodStart,
  0,
  ['var', 'currentYear'],
  1,
];
//! [expressions]

const meteorites = new WebGLPointsLayer({
  source: source,
  style: {
    //! [variables]
    variables: styleVariables,
    //! [variables]
    //! [filter]
    filter: ['between', ['get', 'year'], periodStart, ['var', 'currentYear']],
    //! [filter]
    symbol: {
      symbolType: 'circle',
      //! [size]
      size: [
        '*',
        decay,
        ['+', ['*', ['clamp', ['*', ['get', 'mass'], 1 / 20000], 0, 1], 18], 8],
      ],
      //! [size]
      color: 'rgb(255, 0, 0)',
      //! [opacity]
      opacity: ['*', 0.5, decay],
      //! [opacity]
    },
  },
  //! [hitdetection]
  disableHitDetection: true,
  //! [hitdetection]
});

//! [declaration]
const map = new Map({
  //! [declaration]
  target: 'map-container',
  layers: [
    new TileLayer({
      source: new XYZ({
        crossOrigin: 'anonymous',
        url: 'https://stamen-tiles-{a-d}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
      }),
    }),
    meteorites,
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

//! [animate]
const yearElement = document.getElementById('year');

function render() {
  const elapsed = (rate * (Date.now() - start)) / 1000;
  styleVariables.currentYear = Math.round(minYear + (elapsed % span));
  yearElement.innerText = styleVariables.currentYear;

  map.render();
  requestAnimationFrame(render);
}

render();
//! [animate]
