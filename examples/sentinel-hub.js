import Map from 'ol/Map.js';
import SentinelHub from 'ol/source/SentinelHub.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import View from 'ol/View.js';
import {useGeographic} from 'ol/proj.js';

useGeographic();

const source = new SentinelHub({
  data: [
    {
      type: 'sentinel-2-l2a',
      dataFilter: {
        timeRange: {
          from: '2024-05-30T00:00:00Z',
          to: '2024-06-01T00:00:00Z',
        },
      },
    },
  ],
  evalscript: {
    setup: () => ({
      input: ['B12', 'B08', 'B04'],
      output: {bands: 3},
    }),
    evaluatePixel: (sample) => [
      2.5 * sample.B12,
      2 * sample.B08,
      2 * sample.B04,
    ],
  },
});

const map = new Map({
  layers: [new TileLayer({source})],
  target: 'map',
  view: new View({
    center: [-121.75, 46.85],
    zoom: 10,
    minZoom: 7,
    maxZoom: 13,
  }),
});

const dialog = document.getElementById('auth-dialog');
const clientId = import.meta.env.VITE_SH_CLIENT_ID;
const clientSecret = import.meta.env.VITE_SH_CLIENT_SECRET;
if (clientId && clientSecret) {
  dialog.close();
  source.setAuth({clientId, clientSecret});
} else {
  dialog.showModal();
  document.getElementById('auth-form').addEventListener('submit', (event) => {
    const clientId = event.target.elements['id'].value;
    const clientSecret = event.target.elements['secret'].value;
    source.setAuth({clientId, clientSecret});
  });
}

source.on('change', () => {
  if (source.getState() === 'error') {
    alert(source.getError());
  }
});
