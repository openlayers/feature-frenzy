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

const overlay = new TileLayer({
  source: new XYZSource({
    url: 'https://api.mapbox.com/styles/v1/tschaub/cjh953yhw1b2l2rqwpbglpnxq/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHNjaGF1YiIsImEiOiJjaW5zYW5lNHkxMTNmdWttM3JyOHZtMmNtIn0.CDIBD8H-G2Gf-cPkIuWtRg',
  }),
});

const map = new Map({
  target: 'map-container',
  layers: [
    new TileLayer({
      source: new XYZSource({
        url: 'https://api.mapbox.com/styles/v1/tschaub/cjh7585xo2lcf2soz7wkbgkud/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHNjaGF1YiIsImEiOiJjaW5zYW5lNHkxMTNmdWttM3JyOHZtMmNtIn0.CDIBD8H-G2Gf-cPkIuWtRg',
      }),
    }),
    new VectorLayer({
      source: source,
      style: [
        new Style({
          stroke: new Stroke({
            color: [255, 255, 255, 0.5],
            width: 6,
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: [0, 153, 255, 1],
            width: 2,
          }),
        }),
      ],
    }),
    overlay,
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

document.addEventListener('keydown', function (event) {
  if (event.which === 32) {
    event.preventDefault();
    setEditing(true);
    return false;
  }
  if (event.which === 27) {
    event.preventDefault();
    setEditing(false);
    return false;
  }
});

const instructions = document.getElementById('instructions');
function setEditing(editing) {
  overlay.setVisible(!editing);
  modify.setActive(editing);
  draw.setActive(editing);
  snap.setActive(editing);
  let markup;
  if (editing) {
    markup = 'press <code>&lt;esc&gt;</code> to stop editing';
  } else {
    markup = 'press <code>&lt;space&gt;</code> to start editing';
  }
  instructions.innerHTML = markup;
}
setEditing(false);

sync(map);
