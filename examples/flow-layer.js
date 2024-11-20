import DataTileSource from 'ol/source/DataTile.js';
import Flow from 'ol/layer/Flow.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Layer from 'ol/layer/Layer.js';
import Map from 'ol/Map.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import WebGLVectorLayerRenderer from 'ol/renderer/webgl/VectorLayer.js';
import colormap from 'colormap';
import windUrl from '/wind.png?url';
import {createXYZ, wrapX} from 'ol/tilegrid.js';
import {get as getProjection, transform} from 'ol/proj.js';

const windData = new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    const width = image.width;
    const height = image.height;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, width, height).data;
    resolve({data, width, height});
  };
  image.onerror = () => {
    reject(new Error('failed to load'));
  };
  image.src = windUrl;
});

function bilinearInterpolation(xAlong, yAlong, v11, v21, v12, v22) {
  const q11 = (1 - xAlong) * (1 - yAlong) * v11;
  const q21 = xAlong * (1 - yAlong) * v21;
  const q12 = (1 - xAlong) * yAlong * v12;
  const q22 = xAlong * yAlong * v22;
  return q11 + q21 + q12 + q22;
}

function interpolatePixels(xAlong, yAlong, p11, p21, p12, p22) {
  return p11.map((_, i) =>
    bilinearInterpolation(xAlong, yAlong, p11[i], p21[i], p12[i], p22[i]),
  );
}

const dataTileGrid = createXYZ();
const dataTileSize = 256;

const inputImageProjection = getProjection('EPSG:4326');
const dataTileProjection = getProjection('EPSG:3857');

const inputBands = 4;
const dataBands = 3;

// range of wind velocities
// these values are stretched between 0 and 255 in the png
const minU = -21.32;
const maxU = 26.8;
const deltaU = maxU - minU;
const minV = -21.57;
const maxV = 21.42;
const deltaV = maxV - minV;

const wind = new DataTileSource({
  // transition must be 0, see https://github.com/openlayers/openlayers/issues/16119
  transition: 0,
  wrapX: true,
  async loader(z, x, y) {
    const {
      data: inputData,
      width: inputWidth,
      height: inputHeight,
    } = await windData;

    const tileCoord = wrapX(dataTileGrid, [z, x, y], dataTileProjection);
    const extent = dataTileGrid.getTileCoordExtent(tileCoord);
    const resolution = dataTileGrid.getResolution(z);
    const data = new Float32Array(dataTileSize * dataTileSize * dataBands);
    for (let row = 0; row < dataTileSize; ++row) {
      let offset = row * dataTileSize * dataBands;
      const mapY = extent[3] - row * resolution;
      for (let col = 0; col < dataTileSize; ++col) {
        const mapX = extent[0] + col * resolution;
        const [lon, lat] = transform(
          [mapX, mapY],
          dataTileProjection,
          inputImageProjection,
        );

        const x = (inputWidth * (lon + 180)) / 360;
        let x1 = Math.floor(x);
        let x2 = Math.ceil(x);
        const xAlong = x - x1;
        if (x1 < 0) {
          x1 += inputWidth;
        }
        if (x2 >= inputWidth) {
          x2 -= inputWidth;
        }

        const y = (inputHeight * (90 - lat)) / 180;
        let y1 = Math.floor(y);
        let y2 = Math.ceil(y);
        const yAlong = y - y1;
        if (y1 < 0) {
          y1 = 0;
        }
        if (y2 >= inputHeight) {
          y2 = inputHeight - 1;
        }

        const corners = [
          [x1, y1],
          [x2, y1],
          [x1, y2],
          [x2, y2],
        ];

        const pixels = corners.map(([cx, cy]) => {
          const inputOffset = (cy * 360 + cx) * inputBands;
          return [inputData[inputOffset], inputData[inputOffset + 1]];
        });

        const interpolated = interpolatePixels(xAlong, yAlong, ...pixels);
        const u = minU + (deltaU * interpolated[0]) / 255;
        const v = minV + (deltaV * interpolated[1]) / 255;

        data[offset] = u;
        data[offset + 1] = v;
        offset += dataBands;
      }
    }
    return data;
  },
});

class WebGLLayer extends Layer {
  createRenderer() {
    return new WebGLVectorLayerRenderer(this, {
      style: {
        'fill-color': '#555555',
      },
    });
  }
}

const maxSpeed = 20;
const colors = colormap({
  colormap: 'viridis',
  nshades: 10,
  alpha: 0.75,
  format: 'rgba',
});
const colorStops = [];
for (let i = 0; i < colors.length; ++i) {
  colorStops.push((i * maxSpeed) / (colors.length - 1));
  colorStops.push(colors[i]);
}

const flow = new Flow({
  source: wind,
  maxSpeed,
  style: {
    color: ['interpolate', ['linear'], ['get', 'speed'], ...colorStops],
  },
});

const map = new Map({
  target: 'map',
  pixelRatio: 2,
  layers: [
    new WebGLLayer({
      source: new VectorSource({
        url: 'https://openlayers.org/data/vector/ocean.json',
        format: new GeoJSON(),
      }),
    }),
    flow,
  ],
  view: new View({
    center: [0, 0],
    zoom: 0,
  }),
});

const speedEl = document.getElementById('speed');
const arrowEl = document.getElementById('arrow');
const directionEl = document.getElementById('direction');
const directions = ['W', 'SW', 'S', 'SE', 'E', 'NE', 'N', 'NW'];
function displayPixelValue(event) {
  const data = flow.getData(event.pixel);
  if (!data) {
    return;
  }
  const vx = data[0];
  const vy = data[1];

  const speed = Math.sqrt(vx * vx + vy * vy);
  speedEl.innerText = speed.toFixed(1) + ' m/s';

  const direction = Math.atan2(vy, vx);
  arrowEl.style = `transform: rotate(${-direction}rad)`;

  const index = (8 + Math.round(direction / (Math.PI / 4))) % 8;
  directionEl.innerText = directions[index];
}
map.on(['pointermove', 'click'], displayPixelValue);
