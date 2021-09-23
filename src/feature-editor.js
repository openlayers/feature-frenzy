import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import View from 'ol/View';
import sync from 'ol-hashed';
import {Draw, Modify, Snap} from 'ol/interaction';
import {Stroke, Style} from 'ol/style';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {Vector as VectorSource, XYZ as XYZSource} from 'ol/source';
import {fromLonLat} from 'ol/proj';

const dataURL = new URL(
  'data/north-carolina-districts.geojson',
  import.meta.url
);

const source = new VectorSource({
  format: new GeoJSON(),
  url: dataURL,
});

const map = new Map({
  target: 'map-container',
  layers: [
    new TileLayer({
      source: new XYZSource({
        crossOrigin: 'anonymous',
        url: 'https://api.maptiler.com/tiles/satellite/{z}/{x}/{y}.jpg?key=get_your_own_D6rA4zTHduk6KOKTXzGB',
      }),
    }),
    new VectorLayer({
      source: source,
      style: new Style({
        stroke: new Stroke({
          color: [0, 153, 255, 1],
          width: 2,
        }),
      }),
    }),
  ],
  view: new View({
    center: fromLonLat([-79.093, 35.224]),
    zoom: 7,
  }),
});

const modify = new Modify({source: source});
const draw = new Draw({type: 'Polygon', source: source});
const snap = new Snap({source: source});

map.addInteraction(modify);
map.addInteraction(draw);
map.addInteraction(snap);

sync(map);
