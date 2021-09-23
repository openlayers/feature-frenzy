import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import View from 'ol/View';
import sync from 'ol-hashed';
import {Fill, Stroke, Style} from 'ol/style';
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

const yearLookup = {
  108: '2003–2004',
  109: '2005–2006',
  110: '2007–2008',
  111: '2009–2010',
  112: '2011–2012',
};

const minSession = 108;
const maxSession = 112;
let selectedSession;

const output = document.getElementById('output');
for (let session = maxSession; session >= minSession; --session) {
  const anchor = document.createElement('a');
  anchor.innerHTML = yearLookup[session];
  anchor.dataset.session = session;
  anchor.addEventListener('mouseover', (event) => {
    selectedSession = event.target.dataset.session;
    source.changed();
  });
  anchor.addEventListener('mouseout', () => {
    selectedSession = '';
    source.changed();
  });
  output.appendChild(anchor);
}

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
      style: function (feature) {
        const member = feature.get('member');
        let r = 0;
        let d = 0;
        for (const session in member) {
          if (selectedSession && session !== selectedSession) {
            continue;
          }
          const lookup = member[session];
          for (const key in lookup) {
            const party = lookup[key].party;
            if (party === 'Democrat') {
              ++d;
            } else if (party === 'Republican') {
              ++r;
            }
          }
        }
        const t = r + d;
        return new Style({
          fill: new Fill({
            color: [(r * 255) / t, 0, (d * 255) / t, 0.6],
          }),
          stroke: new Stroke({
            color: [255, 255, 255, 0.6],
          }),
        });
      },
    }),
    new TileLayer({
      source: new XYZSource({
        url: 'https://api.mapbox.com/styles/v1/tschaub/cjh953yhw1b2l2rqwpbglpnxq/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHNjaGF1YiIsImEiOiJjaW5zYW5lNHkxMTNmdWttM3JyOHZtMmNtIn0.CDIBD8H-G2Gf-cPkIuWtRg',
      }),
    }),
  ],
  view: new View({
    center: fromLonLat([-79.093, 35.224]),
    zoom: 7,
  }),
});

const container = document.createElement('div');
container.className = 'overlay';
const overlay = new Overlay({
  element: container,
  positioning: 'bottom-center',
  autoPan: true,
});
map.addOverlay(overlay);
container.addEventListener('click', function () {
  overlay.setPosition();
});

map.on('pointermove', function (event) {
  if (map.hasFeatureAtPixel(event.pixel)) {
    document.body.style.cursor = 'pointer';
  } else {
    document.body.style.cursor = '';
  }
});

map.on('click', function (event) {
  const features = map.getFeaturesAtPixel(event.pixel);
  if (features) {
    overlay.setPosition(event.coordinate);
    const member = features[0].get('member');

    let markup = '<table>';
    Object.keys(member)
      .sort()
      .reverse()
      .forEach(function (session) {
        const lookup = member[session];
        for (const key in lookup) {
          const person = lookup[key];
          markup += `
          <tr>
            <td><div class="dot ${person.party}">&nbsp;</div></td>
            <td>${person.name}</td>
            <td>${yearLookup[session]}</td>
          </tr>
        `;
        }
      });
    markup += '</table>';

    container.innerHTML = markup;
  } else {
    overlay.setPosition();
  }
});

sync(map);
