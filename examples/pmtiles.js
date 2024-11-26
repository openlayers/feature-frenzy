import Map from 'ol/Map.js';
import Source from 'ol/source/ImageTile.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import {PMTiles} from 'pmtiles';
import {useGeographic} from 'ol/proj.js';

useGeographic();

const loadImage = (img, src) =>
  new Promise((ok, nok) => {
    const img = new Image();
    img.addEventListener('load', () => ok(img));
    img.addEventListener('error', () => nok(new Error('load failed')));
    img.src = src;
  });

const tiles = new PMTiles(
  'https://pmtiles.io/stamen_toner(raster)CC-BY+ODbL_z3.pmtiles',
);

const source = new Source({
  maxZoom: 3,
  async loader(z, x, y, {signal}) {
    const blob = new Blob([(await tiles.getZxy(z, x, y, signal)).data]);
    const src = URL.createObjectURL(blob);
    const image = await loadImage(new Image(), src);
    URL.revokeObjectURL(src);
    return image;
  },
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source,
    }),
  ],
  view: new View({
    center: [-58, 0],
    zoom: 3,
  }),
});
