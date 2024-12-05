import Map from 'ol/Map.js';
import SentinelHub from 'ol/source/SentinelHub.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import View from 'ol/View.js';
import {codeToHtml} from 'shiki';
import {useGeographic} from 'ol/proj.js';

useGeographic();

const source = new SentinelHub({});

const map = new Map({
  layers: [new TileLayer({source})],
  target: 'map',
  view: new View({
    center: [-121.75915, 46.85689],
    zoom: 12,
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

const vis = document.getElementById('vis');
vis.addEventListener('change', () => {
  updateData();
});

const beforeData = {
  type: 'sentinel-2-l2a',
  dataFilter: {
    timeRange: {
      from: '2018-09-05T00:00:00.000Z',
      to: '2018-09-06T00:00:00.000Z',
    },
  },
};

const afterData = {
  type: 'sentinel-2-l2a',
  dataFilter: {
    timeRange: {
      from: '2024-08-29T00:00:00.000Z',
      to: '2024-08-30T00:00:00.000Z',
    },
  },
};

const changeEvalscript = `//VERSION=3

function setup() {
  return {
    input: [
      {datasource: 'before', bands: ['B12', 'B08', 'B04']},
      {datasource: 'after', bands: ['B12', 'B08', 'B04']},
    ],
    output: {bands: 3},
  };
}

function ndsi(s) {
  return (s.B04 - s.B12) / (s.B12 + s.B04);
}

function evaluatePixel(samples) {
  const before = samples.before[0];
  const beforeNdsi = ndsi(before);
  const after = samples.after[0];
  const afterNdsi = ndsi(after);

  if (afterNdsi > 0.4 && beforeNdsi <= 0.4) {
    return [1, 1, 0];
  }
  return [2.5 * after.B12, 2 * after.B08, 2 * after.B04];
}`;

const singleEvalscript = `//VERSION=3

function setup() {
  return {
    input: ['B12', 'B08', 'B04'],
    output: {bands: 3},
  };
}

function evaluatePixel(sample) {
  return [
    2.5 * sample.B12,
    2 * sample.B08,
    2 * sample.B04,
  ];
}`;

const evalscriptOutput = document.getElementById('evalscript');
const evalscriptToggle = document.getElementById('evalscript-toggle');
function toggleEvalscript() {
  const evalscriptShown = evalscriptOutput.style.display === 'block';
  evalscriptOutput.style.display = evalscriptShown ? 'none' : 'block';
  evalscriptToggle.style.display = evalscriptShown ? 'block' : 'none';
}
evalscriptToggle.addEventListener('click', toggleEvalscript);
evalscriptOutput.addEventListener('click', toggleEvalscript);

async function updateData() {
  const value = vis.value;
  const highlight = {
    lang: 'javascript',
    theme: 'vitesse-dark',
  };
  switch (value) {
    case 'before': {
      source.setData([beforeData]);
      source.setEvalscript(singleEvalscript);

      const html = await codeToHtml(singleEvalscript, highlight);
      evalscriptOutput.innerHTML = html;
      return;
    }
    case 'after': {
      source.setData([afterData]);
      source.setEvalscript(singleEvalscript);

      const html = await codeToHtml(singleEvalscript, highlight);
      evalscriptOutput.innerHTML = html;
      return;
    }
    default: {
      source.setData([
        {
          id: 'before',
          ...beforeData,
        },
        {
          id: 'after',
          ...afterData,
        },
      ]);
      source.setEvalscript(changeEvalscript);

      const html = await codeToHtml(changeEvalscript, highlight);
      evalscriptOutput.innerHTML = html;
    }
  }
}

updateData();
