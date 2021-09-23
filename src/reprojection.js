import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import Projection from 'ol/proj/Projection';
import View from 'ol/View';
import mproj from 'mproj';
import {Stroke, Style} from 'ol/style';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {Vector, XYZ} from 'ol/source';
import {addCoordinateTransforms, get, transform} from 'ol/proj';

const nuuk = [-51.694138, 64.18141];
const resolutionFactor = 2.29;

const greenland = new URL('data/greenland.geojson', import.meta.url);

const epsg3182 =
  '+proj=utm +zone=22 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
const epsg3857 =
  '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs';
const transform4326 = mproj(epsg3182);
const transform3857 = mproj(epsg3857, epsg3182);

const proj = new Projection({
  units: 'm',
  code: 'EPSG:3128',
});
addCoordinateTransforms(
  'EPSG:4326',
  proj,
  transform4326.forward,
  transform4326.inverse
);
addCoordinateTransforms(
  'EPSG:3857',
  proj,
  transform3857.forward,
  transform3857.inverse
);

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
      color: 'rgba(0, 0, 255, 0.7)',
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
proj.setGetPointResolution(function (resolution, coordinate) {
  return resolution * resolutionFactor;
});

const view3857 = new View({
  center: transform(nuuk, 'EPSG:4326', 'EPSG:3857'),
  resolution: 22395.43779133036,
});
map.setView(view3857);
const view3128 = new View({
  projection: proj,
  maxResolution: view3857.getResolutionForZoom(4),
  extent: [-964261.03, 6509913.55, 784650.11, 9827663.99],
  constrainOnlyCenter: true,
});
document.getElementById('epsg3182').addEventListener('click', function () {
  if (map.getView() !== view3128) {
    vectorLayer.setSource(vector3128);
    view3128.setResolution(view3857.getResolution() / resolutionFactor);
    view3128.setCenter(transform(view3857.getCenter(), 'EPSG:3857', proj));
    view3128.setRotation(view3857.getRotation());
    map.setView(view3128);
  }
});
document.getElementById('epsg3857').addEventListener('click', function () {
  if (map.getView() !== view3857) {
    vectorLayer.setSource(vector3857);
    view3857.setResolution(view3128.getResolution() * resolutionFactor);
    view3857.setCenter(transform(view3128.getCenter(), proj, 'EPSG:3857'));
    view3857.setRotation(view3128.getRotation());
    map.setView(view3857);
  }
});
