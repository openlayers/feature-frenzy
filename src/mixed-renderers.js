import 'ol/ol.css';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import {
  Layer,
  Tile as TileLayer,
  WebGLPoints as WebGLPointsLayer,
} from 'ol/layer';
import {Map, View} from 'ol';
import {Vector as VectorSource, XYZ} from 'ol/source';
import {composeCssTransform} from 'ol/transform';
import {fromLonLat, get} from 'ol/proj';
import {getWidth} from 'ol/extent';

const svgContainer = document.createElement('div');
const xhr = new XMLHttpRequest();
xhr.open(
  'GET',
  'https://ahocevar.com/geoserver/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&FORMAT=image%2Fsvg&TRANSPARENT=true&LAYERS=ne%3Ane&CRS=EPSG%3A3857&STYLES=&FORMAT_OPTIONS=dpi%3A90&WIDTH=3000&HEIGHT=3000&BBOX=-20037508.342789244%2C-20037508.342789244%2C20037508.342789244%2C20037508.342789244'
);
xhr.addEventListener('load', function () {
  const svg = xhr.responseXML.documentElement;
  svgContainer.ownerDocument.importNode(svg);
  svgContainer.appendChild(svg);
});
xhr.send();

const width = 3000;
const height = 3000;
const svgResolution = getWidth(get('EPSG:3857').getExtent()) / width;
svgContainer.style.width = width + 'px';
svgContainer.style.height = height + 'px';
svgContainer.style.transformOrigin = 'top left';
svgContainer.style.position = 'absolute';
svgContainer.className = 'svg-layer';

const svgLayer = new Layer({
  render: function (frameState) {
    const scale = svgResolution / frameState.viewState.resolution;
    const center = frameState.viewState.center;
    const size = frameState.size;
    const cssTransform = composeCssTransform(
      size[0] / 2,
      size[1] / 2,
      scale,
      scale,
      frameState.viewState.rotation,
      -center[0] / svgResolution - width / 2,
      center[1] / svgResolution - height / 2
    );
    svgContainer.style.transform = cssTransform;
    svgContainer.style.opacity = this.getOpacity();
    return svgContainer;
  },
});

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
  className: 'webgl-layer',
  source: source,
  style: {
    variables: styleVariables,
    filter: ['between', ['get', 'year'], periodStart, ['var', 'currentYear']],
    symbol: {
      symbolType: 'circle',
      size: [
        '*',
        decay,
        ['+', ['*', ['clamp', ['*', ['get', 'mass'], 1 / 20000], 0, 1], 18], 8],
      ],
      color: 'rgb(255, 0, 0)',
      opacity: ['*', 0.5, decay],
    },
  },
});

//! [declaration]
const map = new Map({
  //! [declaration]
  target: 'map-container',
  layers: [
    new TileLayer({
      source: new XYZ({
        crossOrigin: 'anonymous',
        url: 'https://stamen-tiles-{a-d}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
      }),
    }),
    svgLayer,
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
