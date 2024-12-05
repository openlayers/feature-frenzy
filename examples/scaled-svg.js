import Layer from 'ol/layer/Image.js';
import Map from 'ol/Map.js';
import Source from 'ol/source/Image.js';
import View from 'ol/View.js';
import {createLoader as createStatic} from 'ol/source/static.js';
import {decode as decodeImage, load as loadImage} from 'ol/Image';
import {useGeographic} from 'ol/proj.js';

useGeographic();

const layer = new Layer();
const changeSource = (load) => {
  const source = new Source({
    loader: createStatic({
      url: '../wms.svg',
      imageExtent: [-20037508.34, -20037508.34, 20037508.34, 20037508.34],
      load,
    }),
  });
  layer.setSource(source);
};
changeSource(loadImage);

const map = new Map({
  target: 'map',
  layers: [layer],
  view: new View({
    center: [-58, 0],
    zoom: 5,
  }),
});

document.getElementById('decode').addEventListener('click', function () {
  changeSource(decodeImage);
});
document.getElementById('load').addEventListener('click', function () {
  changeSource(loadImage);
});
