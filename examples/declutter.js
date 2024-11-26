import {apply, getMapboxLayer, updateMapboxLayer} from 'ol-mapbox-style';
import {fromLonLat} from 'ol/proj';

apply('map', 'https://tiles.openfreemap.org/styles/liberty').then((map) => {
  map.getView().animate({center: fromLonLat([-58, 0]), zoom: 4});

  function declutter(declutter) {
    const layers = map.getLayers();
    layers.forEach((layer) => {
      if (typeof layer.setDeclutter !== 'function') {
        return;
      }
      layer.setDeclutter(declutter);
    });
  }

  function obstacle(obstacle) {
    const layers = map.get('mapbox-style').layers;
    layers.forEach((layer) => {
      if (layer.layout?.['icon-allow-overlap'] === !obstacle) {
        layer.layout['icon-allow-overlap'] = obstacle;
        updateMapboxLayer(map, layer);
      }
    });
  }

  document.getElementById('clutter').addEventListener('click', function () {
    declutter(false);
  });

  document.getElementById('richtext').addEventListener('click', function () {
    const layer = getMapboxLayer(map, 'label_country_1');
    updateMapboxLayer(map, {
      ...layer,
      layout: {
        ...layer.layout,
        'text-field': [
          'format',
          ['get', 'name_en'],
          {'font-scale': 1.2},
          '\n',
          {},
          ['get', 'name'],
          {
            'font-scale': 0.8,
            'text-font': [
              'literal',
              ['Noto Sans Italic', 'Arial Unicode MS Regular'],
            ],
          },
        ],
      },
    });
  });

  document.getElementById('obstacle').addEventListener('click', function () {
    obstacle(false);
  });

  const originalLabelCountry1 = getMapboxLayer(map, 'label_country_1');
  document.getElementById('reset').addEventListener('click', function () {
    updateMapboxLayer(map, originalLabelCountry1);
    declutter(true);
    obstacle(true);
  });
});
