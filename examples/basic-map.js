import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import {MapboxVectorLayer} from 'ol-mapbox-style';
import {fromExtent} from 'ol/geom/Polygon';
import {fromLonLat} from 'ol/proj.js';
import {map} from './map.js';

const box = [...fromLonLat([16.1, 48.1]), ...fromLonLat([16, 2, 48.2])];

const layer = new MapboxVectorLayer({
  styleUrl: 'mapbox://styles/mapbox/bright-v9',
  accessToken: 'Your Mapbox access token from https://mapbox.com/ here',
});
map.addLayer(layer);
const overlay = new VectorLayer({
  source: new VectorSource({
    features: [fromExtent(box)],
  }),
});
overlay.on('prerender', () => map.flushDeclutterItems());
map.addLayer(overlay);

const features = layer.getSource().getFeaturesInExtent(box);
