import GeoJSON from 'ol/format/GeoJSON.js';
import Layer from 'ol/layer/Layer.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import WebGLVectorLayerRenderer from 'ol/renderer/webgl/VectorLayer.js';
import XYZ from 'ol/source/XYZ.js';
import {Graticule} from 'ol';
import {packColor} from 'ol/renderer/webgl/shaders.js';

const key = 'get_your_own_D6rA4zTHduk6KOKTXzGB';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

const colors = {
  0: packColor('rgb(0, 0, 0)'),
  1: packColor('rgb(220, 0, 0)'),
  2: packColor('rgb(254, 255, 0)'),
  3: packColor('rgb(0, 184, 0)'),
  4: packColor('rgb(164, 249, 254)'),
  5: packColor('rgb(27, 0, 255)'),
  6: packColor('rgb(0, 0, 0)'),
};

class WebGLLayer extends Layer {
  createRenderer() {
    return new WebGLVectorLayerRenderer(this, {
      fill: {
        attributes: {
          color: function (feature) {
            const code18 = feature.get('CODE_18');
            const code12 = feature.get('CODE_12');
            let category;
            if (code18 && code12) {
              if (
                Math.floor(code18 / 100) === 1 &&
                Math.floor(code12 / 100) > 1
              ) {
                category = 6;
              } else {
                category = 0;
              }
            } else {
              const property = code18 || code12;
              category = Math.floor(property / 100);
            }
            return colors[category] || colors[0];
          },
          opacity: function (feature) {
            const code18 = feature.get('CODE_18');
            const code12 = feature.get('CODE_12');
            let opacity;
            if (code18 && code12) {
              if (
                Math.floor(code18 / 100) === 1 &&
                Math.floor(code12 / 100) > 1
              ) {
                opacity = 0.6;
              } else {
                opacity = 0;
              }
            } else {
              opacity = 0.6;
            }
            return opacity;
          },
        },
      },
      stroke: {
        attributes: {
          color: function () {
            return colors[0];
          },
          width: function () {
            return 5;
          },
          opacity: function (feature) {
            const code18 = feature.get('CODE_18');
            const code12 = feature.get('CODE_12');
            let opacity;
            if (code18 && code12) {
              if (
                Math.floor(code18 / 100) === 1 &&
                Math.floor(code12 / 100) > 1
              ) {
                opacity = 1;
              } else {
                opacity = 0;
              }
            } else {
              opacity = 0;
            }
            return opacity;
          },
        },
      },
    });
  }
}

const clc18Url = new URL('./data/CLC18_AT.json', import.meta.url);
const clc12Url = new URL('./data/CLC12_AT.json', import.meta.url);
const ch1218Url = new URL('./data/CH12_18_AT.json', import.meta.url);

const base = new TileLayer({
  source: new XYZ({
    url: 'https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=' + key,
    attributions: attributions,
    crossOrigin: 'anonymous',
    tileSize: 512,
  }),
});

const vectorLayer2018 = new WebGLLayer({
  source: new VectorSource({
    url: clc18Url,
    format: new GeoJSON(),
  }),
});
vectorLayer2018
  .getSource()
  .once('change', (e) => map.getView().fit(e.target.getExtent()));

const vectorLayer2012 = new WebGLLayer({
  visible: false,
  source: new VectorSource({
    url: clc12Url,
    format: new GeoJSON(),
  }),
});

const vectorLayerDiff = new WebGLLayer({
  visible: false,
  source: new VectorSource({
    url: ch1218Url,
    format: new GeoJSON(),
  }),
});

const graticule = new Graticule({showLabels: true});

const map = new Map({
  layers: [base, vectorLayer2018, vectorLayer2012, vectorLayerDiff, graticule],
  target: 'map-container',
  view: new View({
    center: [0, 0],
    zoom: 1,
  }),
});

const topics = {
  'Corine Land Cover 2018': vectorLayer2018,
  'Corine Land Cover 2012': vectorLayer2012,
  'Lost soil 2012-2018': vectorLayerDiff,
};

const topicSelector = document.getElementById('topic');
Object.keys(topics).forEach((topic) => {
  const option = document.createElement('option');
  option.textContent = topic;
  topicSelector.appendChild(option);
});
topicSelector.addEventListener('change', (e) => {
  const topic = topics[e.target.value];
  Object.values(topics).forEach((t) => t.setVisible(false));
  topic.setVisible(true);
});
