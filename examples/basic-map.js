import ImageTile from 'ol/source/ImageTile.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import View from 'ol/View.js';
import {useGeographic} from 'ol/proj.js';

useGeographic();

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new ImageTile({
        url: 'https://tile.tracestrack.com/topo__/{z}/{x}/{y}.png?key=93d70181633071ff00dd314e592783c3',
      }),
    }),
  ],
  view: new View({
    center: [-58, 0],
    zoom: 5,
  }),
});
