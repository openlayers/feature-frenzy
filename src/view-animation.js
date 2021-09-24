import 'ol/ol.css';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/WebGLTile';
import View from 'ol/View';
import XYZ from 'ol/source/XYZ';
import {useGeographic} from 'ol/proj';

useGeographic();

const minneapolis = {center: [-93.265, 44.9778], year: 2005};
const lausanne = {center: [6.6323, 46.5197], year: 2006};
const victoria = {center: [-123.3656, 48.4284], year: 2007};
const capetown = {center: [18.4241, -33.9249], year: 2008};
const sydney = {center: [151.2093, -33.8688], year: 2009};
const barcelona = {center: [2.1734, 41.3851], year: 2010};
const denver = {center: [-104.9903, 39.7392], year: 2011};
const nottingham = {center: [-1.1581, 52.9548], year: 2013};
const portland = {center: [-122.6765, 45.5231], year: 2014};
const seoul = {center: [126.978, 37.5665], year: 2015};
const bonn = {center: [7.0982, 50.7374], year: 2016};
const boston = {center: [-71.0589, 42.3601], year: 2017};
const daressalaam = {center: [39.2083, -6.7924], year: 2018};
const bucharest = {center: [26.1025, 44.4268], year: 2019};
const buenosaires = {center: [-58.3816, -34.6037], year: 2021};

const duration = 3500;
const minZoom = 4;
const maxZoom = 10;

function formatLocation(coordinate) {
  const lat = coordinate[0];
  const ns = lat > 0 ? 'N' : 'S';
  const lon = coordinate[1];
  const ew = lon > 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(1)}° ${ns} ${Math.abs(lon).toFixed(
    1
  )}° ${ew}`;
}

function outputMarkup(location) {
  return `${location.year}<br><small>${formatLocation(
    location.center
  )}</small>`;
}

const tour = [
  minneapolis,
  lausanne,
  victoria,
  capetown,
  sydney,
  barcelona,
  denver,
  nottingham,
  portland,
  seoul,
  bonn,
  boston,
  daressalaam,
  bucharest,
  buenosaires,
].map((location) => ({
  center: location.center,
  year: location.year,
}));

const map = new Map({
  target: 'map-container',
  loadTilesWhileAnimating: true,
  layers: [
    new TileLayer({
      cacheSize: 2048,
      source: new XYZ({
        crossOrigin: 'anonymous',
        url: 'https://stamen-tiles-{a-d}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
      }),
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

const output = document.getElementById('output');

let timer;
map.on('click', () => {
  if (timer) {
    clearTimeout(timer);
    timer = null;
    return;
  }

  const view = map.getView();
  let index = 0;
  function step() {
    let done = 0;

    function callback() {
      ++done;
      if (done == 2) {
        ++index;
        output.innerHTML = outputMarkup(tour[index - 1]);
        if (index < tour.length) {
          timer = setTimeout(step, 1200);
        }
      }
    }

    view.animate(
      {
        center: tour[index].center,
        duration: index === 0 ? duration / 2 : duration,
      },
      callback
    );

    let zooms;
    if (index === 0) {
      zooms = [
        {
          zoom: maxZoom,
          duration: duration / 2,
        },
      ];
    } else {
      zooms = [
        {
          zoom: minZoom,
          duration: duration / 2,
        },
        {
          zoom: maxZoom,
          duration: duration / 2,
        },
      ];
    }

    view.animate(...zooms, callback);
  }
  step();
});
