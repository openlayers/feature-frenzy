import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import View from 'ol/View';
import proj4 from 'proj4';
import {Stroke, Style} from 'ol/style';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {Vector, XYZ} from 'ol/source';
import {get, transform} from 'ol/proj';
import {register} from 'ol/proj/proj4';

const nuuk = [-51.694138, 64.18141];
const resolutionFactor = 2.29;

const greenland = new URL('data/greenland.geojson', import.meta.url);

proj4.defs(
  'EPSG:3182',
  '+proj=utm +zone=22 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);
register(proj4);

const vector3857 = new Vector({
  format: new GeoJSON(),
  url: greenland,
});
const vector3128 = new Vector({
  format: new GeoJSON(),
  url: greenland,
});
const vectorLayer = new VectorLayer({
  source: vector3857,
  style: new Style({
    stroke: new Stroke({
      color: [0, 153, 255, 1],
      width: 1,
    }),
  }),
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new XYZ({
        crossOrigin: 'anonymous',
        url: 'https://stamen-tiles-{a-d}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
      }),
    }),
    vectorLayer,
  ],
});

get('EPSG:3857').setGetPointResolution(function (resolution, coordinate) {
  return resolution;
});
get('EPSG:3182').setGetPointResolution(function (resolution, coordinate) {
  return resolution * resolutionFactor;
});

const view3857 = new View({
  center: transform(nuuk, 'EPSG:4326', 'EPSG:3857'),
  resolution: 22395.43779133036,
});
map.setView(view3857);
const view3128 = new View({
  projection: 'EPSG:3182',
  maxResolution: view3857.getResolutionForZoom(4),
  extent: [-964261.03, 6509913.55, 784650.11, 9827663.99],
  constrainOnlyCenter: true,
});
document.getElementById('epsg3182').addEventListener('click', function () {
  if (map.getView() !== view3128) {
    vectorLayer.setSource(vector3128);
    view3128.setResolution(view3857.getResolution() / resolutionFactor);
    view3128.setCenter(
      transform(view3857.getCenter(), 'EPSG:3857', 'EPSG:3182')
    );
    view3128.setRotation(view3857.getRotation());
    map.setView(view3128);
  }
});
document.getElementById('epsg3857').addEventListener('click', function () {
  if (map.getView() !== view3857) {
    vectorLayer.setSource(vector3857);
    view3857.setResolution(view3128.getResolution() * resolutionFactor);
    view3857.setCenter(
      transform(view3128.getCenter(), 'EPSG:3182', 'EPSG:3857')
    );
    view3857.setRotation(view3128.getRotation());
    map.setView(view3857);
  }
});
