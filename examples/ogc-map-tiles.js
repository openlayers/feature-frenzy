import Map from 'ol/Map.js';
import OGCMapTile from 'ol/source/OGCMapTile.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import View from 'ol/View.js';

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OGCMapTile({
        url: 'https://maps.gnosis.earth/ogcapi/collections/blueMarble/map/tiles/WorldCRS84Quad',
      }),
    }),
  ],
  view: new View({
    projection: 'EPSG:4326',
    center: [0, 0],
    zoom: 1,
  }),
});
