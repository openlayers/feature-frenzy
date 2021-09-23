import 'ol/ol.css';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import colormap from 'colormap';
import sync from 'ol-hashed';
import {Image as ImageLayer, Tile as TileLayer} from 'ol/layer.js';
import {Raster, XYZ} from 'ol/source.js';
import {fromLonLat} from 'ol/proj';

const minElevation = -1000;
const maxElevation = 9500;
const steps = 50;
const ramp = colormap({
  colormap: 'earth',
  nshades: steps,
  format: 'rgba',
});

/**
 * Generates a shaded relief image given elevation data.  Uses a 3x3
 * neighborhood for determining slope and aspect.
 * @param {Array<ImageData>} inputs Array of input images.
 * @param {Object} data Data added in the "beforeoperations" event.
 * @return {ImageData} Output image.
 */
function shade(inputs, data) {
  const elevationImage = inputs[0];
  const width = elevationImage.width;
  const height = elevationImage.height;
  const elevationData = elevationImage.data;
  if (data.mode === 'raw') {
    return {data: elevationData, width: width, height: height};
  }

  const shadeData = new Uint8ClampedArray(elevationData.length);
  const dp = data.resolution * 2;
  const maxX = width - 1;
  const maxY = height - 1;
  const pixel = [0, 0, 0, 0];
  const twoPi = 2 * Math.PI;
  const halfPi = Math.PI / 2;
  const sunEl = (Math.PI * data.sunEl) / 180;
  const sunAz = (Math.PI * data.sunAz) / 180;
  const cosSunEl = Math.cos(sunEl);
  const sinSunEl = Math.sin(sunEl);
  const range = data.vert * (data.maxElevation - data.minElevation);
  let pixelX,
    pixelY,
    x0,
    x1,
    y0,
    y1,
    offset,
    z0,
    z1,
    dzdx,
    dzdy,
    slope,
    aspect,
    cosIncidence,
    color;
  for (pixelY = 0; pixelY <= maxY; ++pixelY) {
    y0 = pixelY === 0 ? 0 : pixelY - 1;
    y1 = pixelY === maxY ? maxY : pixelY + 1;
    for (pixelX = 0; pixelX <= maxX; ++pixelX) {
      x0 = pixelX === 0 ? 0 : pixelX - 1;
      x1 = pixelX === maxX ? maxX : pixelX + 1;

      // determine elevation for (x0, pixelY)
      offset = (pixelY * width + x0) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      z0 =
        data.vert *
        (-10000 + (pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1);

      // determine elevation for (x1, pixelY)
      offset = (pixelY * width + x1) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      z1 =
        data.vert *
        (-10000 + (pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1);

      dzdx = (z1 - z0) / dp;

      // determine elevation for (pixelX, y0)
      offset = (y0 * width + pixelX) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      z0 =
        data.vert *
        (-10000 + (pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1);

      // determine elevation for (pixelX, y1)
      offset = (y1 * width + pixelX) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      z1 =
        data.vert *
        (-10000 + (pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1);

      dzdy = (z1 - z0) / dp;

      slope = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy));

      aspect = Math.atan2(dzdy, -dzdx);
      if (aspect < 0) {
        aspect = halfPi - aspect;
      } else if (aspect > halfPi) {
        aspect = twoPi - aspect + halfPi;
      } else {
        aspect = halfPi - aspect;
      }

      cosIncidence =
        sinSunEl * Math.cos(slope) +
        cosSunEl * Math.sin(slope) * Math.cos(sunAz - aspect);

      offset = (pixelY * width + pixelX) * 4;

      let r, g, b;
      if (z0 <= data.level) {
        // sea blue
        r = 0;
        g = 60;
        b = 136;
      } else {
        if (data.mode === 'shade') {
          r = 55 + cosIncidence * 200;
          g = 55 + cosIncidence * 200;
          b = 55 + cosIncidence * 200;
        } else {
          const f = Math.min(Math.max(z0 - data.minElevation, 0) / range, 1);
          const index = Math.round(f * (data.steps - 1));
          color = data.ramp[index];
          r = cosIncidence * color[0];
          g = cosIncidence * color[1];
          b = cosIncidence * color[2];
        }
      }

      shadeData[offset] = r;
      shadeData[offset + 1] = g;
      shadeData[offset + 2] = b;
      shadeData[offset + 3] = elevationData[offset + 3];
    }
  }

  return {data: shadeData, width: width, height: height};
}

const key =
  'pk.eyJ1IjoidHNjaGF1YiIsImEiOiJjaW5zYW5lNHkxMTNmdWttM3JyOHZtMmNtIn0.CDIBD8H-G2Gf-cPkIuWtRg';
const elevation = new XYZ({
  url:
    'https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=' +
    key,
  crossOrigin: 'anonymous',
  transition: 0,
});

const raster = new Raster({
  sources: [elevation],
  operationType: 'image',
  operation: shade,
});

const map = new Map({
  target: 'map-container',
  layers: [
    new ImageLayer({
      opacity: 0.9,
      source: raster,
    }),
    new TileLayer({
      source: new XYZ({
        url: 'https://api.mapbox.com/styles/v1/tschaub/cjh7vcx726bd82st9xzgu66sb/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHNjaGF1YiIsImEiOiJjaW5zYW5lNHkxMTNmdWttM3JyOHZtMmNtIn0.CDIBD8H-G2Gf-cPkIuWtRg',
      }),
    }),
  ],
  view: new View({
    center: fromLonLat([86.925, 27.9881]),
    zoom: 12,
  }),
});

const controlIds = ['vert', 'sunEl', 'sunAz', 'level'];
const controls = {};
controlIds.forEach(function (id) {
  const control = document.getElementById(id);
  const output = document.getElementById(id + 'Out');
  control.addEventListener('input', function () {
    output.innerText = control.value;
    raster.changed();
  });
  output.innerText = control.value;
  controls[id] = control;
});

let mode = 'raw';
function updateModeSwitcher() {
  for (const id in controls) {
    let visibility;
    if (mode === 'raw') {
      visibility = 'hidden';
    } else if (mode === 'shade') {
      visibility = id === 'level' ? 'hidden' : '';
    } else {
      visibility = '';
    }
    document.getElementById(`${id}Row`).style.visibility = visibility;
  }
}

updateModeSwitcher();

document.getElementsByName('mode').forEach((input) => {
  input.addEventListener('change', (event) => {
    mode = event.target.value;
    raster.changed();
    updateModeSwitcher();
  });
});

raster.on('beforeoperations', function (event) {
  // the event.data object will be passed to operations
  const data = event.data;
  data.resolution = event.resolution;
  for (const id in controls) {
    data[id] = Number(controls[id].value);
  }
  data.ramp = ramp;
  data.steps = steps;
  data.minElevation = minElevation;
  data.maxElevation = maxElevation;
  data.mode = mode;
});

const locations = document.getElementsByClassName('location');
for (let i = 0, ii = locations.length; i < ii; ++i) {
  locations[i].addEventListener('click', relocate);
}

function relocate(event) {
  const data = event.target.dataset;
  const view = map.getView();
  view.setCenter(fromLonLat(data.center.split(',').map(Number)));
  view.setZoom(Number(data.zoom));
}

sync(map);
