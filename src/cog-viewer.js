import GeoTIFF from 'ol/source/GeoTIFF.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';

const images = [
  {
    name: 'Firenze',
    base: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/32/T/PP/2022/7/S2B_32TPP_20220722_0_L2A',
  },
  {
    name: 'Minneapolis',
    base: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/15/T/WK/2021/9/S2B_15TWK_20210918_0_L2A',
  },
  {
    name: 'Cape Town',
    base: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/34/H/BH/2021/9/S2B_34HBH_20210922_0_L2A',
  },
];

const visualizations = [
  {
    name: 'True Color',
    sources: ['TCI'],
    normalize: true,
  },
  {
    name: 'False Color',
    sources: ['B08', 'B04', 'B03'],
    normalize: false,
    style: {
      color: [
        'array',
        ['/', ['band', 1], 5000],
        ['/', ['band', 2], 5000],
        ['/', ['band', 3], 5000],
        1,
      ],
    },
  },
  {
    name: 'NDVI',
    sources: ['B04', 'B08'],
    normalize: false,
    display: (element, data) => {
      if (!data) {
        return;
      }
      const ndvi = (data[1] - data[0]) / (data[1] + data[0]);
      element.textContent = `NDVI: ${spacePad(ndvi.toFixed(2), 5)}`;
    },
    style: {
      color: [
        'interpolate',
        ['linear'],
        // calculate NDVI, bands come from the sources below
        ['/', ['-', ['band', 2], ['band', 1]], ['+', ['band', 2], ['band', 1]]],
        // color ramp for NDVI values, ranging from -1 to 1
        -0.2,
        [191, 191, 191],
        -0.1,
        [219, 219, 219],
        0,
        [255, 255, 224],
        0.025,
        [255, 250, 204],
        0.05,
        [237, 232, 181],
        0.075,
        [222, 217, 156],
        0.1,
        [204, 199, 130],
        0.125,
        [189, 184, 107],
        0.15,
        [176, 194, 97],
        0.175,
        [163, 204, 89],
        0.2,
        [145, 191, 82],
        0.25,
        [128, 179, 71],
        0.3,
        [112, 163, 64],
        0.35,
        [97, 150, 54],
        0.4,
        [79, 138, 46],
        0.45,
        [64, 125, 36],
        0.5,
        [48, 110, 28],
        0.55,
        [33, 97, 18],
        0.6,
        [15, 84, 10],
        0.65,
        [0, 69, 0],
      ],
    },
  },
];

function createLayer(base, visualization) {
  const source = new GeoTIFF({
    normalize: visualization.normalize,
    sources: visualization.sources.map((id) => ({
      url: `${base}/${id}.tif`,
    })),
  });

  return new TileLayer({
    source: source,
    style: visualization.style,
  });
}

const map = new Map({
  target: 'map-container',
});

const visualizationSelector = document.getElementById('visualization');
visualizations.forEach((visualization) => {
  const option = document.createElement('option');
  option.textContent = visualization.name;
  visualizationSelector.appendChild(option);
});

const imageSelector = document.getElementById('image');
images.forEach((image) => {
  const option = document.createElement('option');
  option.textContent = image.name;
  imageSelector.appendChild(option);
});

let previousBase;
let layer;
function updateVisualization() {
  const visualization = visualizations[visualizationSelector.selectedIndex];
  const base = images[imageSelector.selectedIndex].base;
  const newBase = base !== previousBase;
  previousBase = base;

  layer = createLayer(base, visualization);
  map.setLayers([layer]);

  if (newBase) {
    map.setView(
      layer
        .getSource()
        .getView()
        .then((options) => ({
          ...options,
          zoom: 2,
        }))
    );
  }
}

visualizationSelector.addEventListener('change', updateVisualization);
imageSelector.addEventListener('change', updateVisualization);
updateVisualization();

function spacePad(value, count) {
  return value.toString().padStart(count, ' ');
}

const info = document.getElementById('info');
function displayPixelValue(event) {
  if (!layer) {
    return;
  }
  const data = layer.getData(event.pixel);
  if (!data) {
    return;
  }
  const visualization = visualizations[visualizationSelector.selectedIndex];
  if (visualization.display) {
    visualization.display(info, data);
    return;
  }

  const lines = Array.from(data)
    .slice(0, 3)
    .map((value, i) => `B${i + 1}: ${spacePad(value, 5)}  `);
  info.textContent = lines.join('\n');
}
map.on(['pointermove', 'click'], displayPixelValue);

const element = map.getTargetElement();

map.on('loadstart', () => {
  element.classList.add('spinner');
});

map.on('loadend', () => {
  element.classList.remove('spinner');
});
