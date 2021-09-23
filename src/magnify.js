import 'ol/ol.css';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import XYZ from 'ol/source/XYZ.js';
import {defaults} from 'ol/control';

const locations = {
  schoenbrunn: [1815783.4408533734, 6137432.250809676],
  saalbach: [1406637.839459977, 6005525.218153131],
  erzberg: [1661239.324338066, 6027698.811475954],
  kaisermuehlen: [1828536.728799714, 6146982.863374246],
};

const imagery = new TileLayer({
  source: new XYZ({
    attributions: [
      'Data source: <a target="_blank" href="https://www.basemap.at/">basemap.at</a>',
    ],
    crossOrigin: 'anonymous',
    url: 'https://maps{1-4}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg',
  }),
});

const container = document.getElementById('map-container');

const map = new Map({
  layers: [imagery],
  target: container,
  controls: defaults({
    attributionOptions: {
      collapsed: false,
      collapsible: false,
    },
  }),
  view: new View({
    center: [1815783.4408533734, 6137432.250809676],
    zoom: 19,
    maxZoom: 19,
  }),
});

let radius = 150;
document.addEventListener('keydown', function (evt) {
  if (evt.which === 38) {
    radius = Math.min(radius + 5, 150);
    map.render();
    evt.preventDefault();
  } else if (evt.which === 40) {
    radius = Math.max(radius - 5, 25);
    map.render();
    evt.preventDefault();
  }
});

// get the pixel position with every move
let mousePosition = null;

container.addEventListener('mousemove', function (event) {
  mousePosition = map.getEventPixel(event);
  map.render();
});

container.addEventListener('mouseout', function () {
  mousePosition = null;
  map.render();
});

// after rendering the layer, show an oversampled version around the pointer
imagery.on('postcompose', function (event) {
  if (mousePosition) {
    const context = event.context;
    const pixelRatio = event.frameState.pixelRatio;
    const half = radius * pixelRatio;
    const centerX = mousePosition[0] * pixelRatio;
    const centerY = mousePosition[1] * pixelRatio;
    const originX = centerX - half;
    const originY = centerY - half;
    const size = 2 * half + 1;
    const sourceData = context.getImageData(originX, originY, size, size).data;
    const dest = context.createImageData(size, size);
    const destData = dest.data;
    for (let j = 0; j < size; ++j) {
      for (let i = 0; i < size; ++i) {
        const dI = i - half;
        const dJ = j - half;
        const dist = Math.sqrt(dI * dI + dJ * dJ);
        let sourceI = i;
        let sourceJ = j;
        if (dist < half) {
          sourceI = Math.round(half + dI / 2);
          sourceJ = Math.round(half + dJ / 2);
        }
        const destOffset = (j * size + i) * 4;
        const sourceOffset = (sourceJ * size + sourceI) * 4;
        destData[destOffset] = sourceData[sourceOffset];
        destData[destOffset + 1] = sourceData[sourceOffset + 1];
        destData[destOffset + 2] = sourceData[sourceOffset + 2];
        destData[destOffset + 3] = sourceData[sourceOffset + 3];
      }
    }
    context.beginPath();
    context.arc(centerX, centerY, half, 0, 2 * Math.PI);
    context.lineWidth = 3 * pixelRatio;
    context.strokeStyle = 'rgba(255,255,255,0.5)';
    context.putImageData(dest, originX, originY);
    context.stroke();
    context.restore();
  }
});

document.getElementById('output').addEventListener('click', function (e) {
  if (e.target.id) {
    map.getView().setCenter(locations[e.target.id]);
  }
});
