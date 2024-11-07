import GeoJSON from 'ol/format/GeoJSON.js';
import GeoTIFF from 'ol/source/GeoTIFF.js';
import Link from 'ol/interaction/Link.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import View from 'ol/View.js';
import roadsUrl from '/roads.json?url';
import {useGeographic} from 'ol/proj.js';

useGeographic();
const link = new Link();

const source = new GeoTIFF({
  sources: [
    {
      url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif',
    },
  ],
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({source}),
    new VectorLayer({
      source: new VectorSource({
        url: roadsUrl,
        format: new GeoJSON(),
      }),
      style: {
        'stroke-color': 'rgb(50 50 50 / 50%)',
        'stroke-width': 1.2,
      },
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 12,
  }),
});

map.addInteraction(link);

// after GeoTIFF metadata has been read, recenter the map to show the image
source.getView().then((sourceView) => {
  const view = map.getView();
  view.setCenter(sourceView.center);
});
