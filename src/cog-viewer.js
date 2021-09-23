import GeoTIFF from 'ol/source/GeoTIFF.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';

const images = [
  {
    name: 'Buenos Aires',
    base: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/21/H/UB/2021/9/S2B_21HUB_20210915_0_L2A',
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
  },
  {
    name: 'False Color',
    sources: ['B08', 'B04', 'B03'],
    max: 5000,
  },
];

function createLayer(base, visualization) {
  const source = new GeoTIFF({
    sources: visualization.sources.map((id) => ({
      url: `${base}/${id}.tif`,
      max: visualization.max,
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
function updateVisualization() {
  const visualization = visualizations[visualizationSelector.selectedIndex];
  const base = images[imageSelector.selectedIndex].base;
  const newBase = base !== previousBase;
  previousBase = base;

  const layer = createLayer(base, visualization);
  map.setLayers([layer]);

  if (newBase) {
    map.setView(
      layer
        .getSource()
        .getView()
        .then((options) => ({
          ...options,
          zoom: 1,
        }))
    );
  }
}

visualizationSelector.addEventListener('change', updateVisualization);
imageSelector.addEventListener('change', updateVisualization);
updateVisualization();