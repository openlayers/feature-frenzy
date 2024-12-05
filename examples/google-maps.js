import Google from 'ol/source/Google.js';
import Layer from 'ol/layer/WebGLTile.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import {Control, defaults as defaultControls} from 'ol/control.js';
import {useGeographic} from 'ol/proj.js';

useGeographic();

function showMap(key) {
  const source = new Google({
    key,
    scale: 'scaleFactor2x',
    highDpi: true,
    mapType: 'roadmap',
  });

  source.on('change', () => {
    if (source.getState() === 'error') {
      alert(source.getError());
    }
  });

  class GoogleLogoControl extends Control {
    constructor() {
      const element = document.createElement('img');
      element.style.pointerEvents = 'none';
      element.style.position = 'absolute';
      element.style.bottom = '5px';
      element.style.left = '5px';
      element.src =
        'https://developers.google.com/static/maps/documentation/images/google_on_white.png';
      super({
        element: element,
      });
    }
  }

  const map = new Map({
    layers: [new Layer({source})],
    controls: defaultControls().extend([new GoogleLogoControl()]),
    target: 'map',
    view: new View({
      center: [-58, 0],
      zoom: 5,
    }),
  });
}

const dialog = document.getElementById('key-dialog');
const key = import.meta.env.VITE_GOOGLE_MAPS;
if (key) {
  dialog.close();
  showMap(key);
} else {
  dialog.showModal();
  document.getElementById('key-form').addEventListener('submit', (event) => {
    showMap(event.target.elements['key'].value);
  });
}
