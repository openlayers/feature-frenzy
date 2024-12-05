import ImageTile from 'ol/source/ImageTile.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import View from 'ol/View.js';
import {useGeographic} from 'ol/proj.js';

useGeographic();

const duration = 3500;
const minZoom = 4;
const maxZoom = 10;

function formatLocation(coordinate) {
  const lat = coordinate[0];
  const ns = lat > 0 ? 'N' : 'S';
  const lon = coordinate[1];
  const ew = lon > 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(1)}° ${ns} ${Math.abs(lon).toFixed(
    1,
  )}° ${ew}`;
}

function outputMarkup(location) {
  return `${location.year}<br><small>${formatLocation(
    location.center,
  )}</small>`;
}

const tour = [
  {name: 'Belem', center: [-48.5013, -1.4563], year: 2024},
  {name: 'Prizren', center: [20.7436, 42.2171], year: 2023},
  {name: 'Florence', center: [11.2577, 43.77], year: 2022},
  {
    name: 'Buenos Aires',
    center: [-58.3816, -34.6037],
    year: 2021,
  },
  {name: 'Bucharest', center: [26.1025, 44.4268], year: 2019},
  {
    name: 'Dar es Salaam',
    center: [39.2083, -6.7924],
    year: 2018,
  },
  {name: 'Boston', center: [-71.0589, 42.3601], year: 2017},
  {name: 'Bonn', center: [7.0982, 50.7374], year: 2016},
  {name: 'Seoul', center: [126.978, 37.5665], year: 2015},
  {name: 'Portland', center: [-122.6765, 45.5231], year: 2014},
  {name: 'Nottingham', center: [-1.1581, 52.9548], year: 2013},
  {name: 'Denver', center: [-104.9903, 39.7392], year: 2011},
  {name: 'Barcelona', center: [2.1734, 41.3851], year: 2010},
  {name: 'Sydney', center: [151.2093, -33.8688], year: 2009},
  {name: 'Cape Town', center: [18.4241, -33.9249], year: 2008},
  {name: 'Victoria', center: [-123.3656, 48.4284], year: 2007},
  {name: 'Lausanne', center: [6.6323, 46.5197], year: 2006},
  {
    name: 'Minneapolis',
    center: [-93.265, 44.9778],
    year: 2005,
  },
];

const key = 'get_your_own_D6rA4zTHduk6KOKTXzGB';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a>';

const map = new Map({
  target: 'map',
  loadTilesWhileAnimating: true,
  layers: [
    new TileLayer({
      source: new ImageTile({
        attributions: attributions,
        url:
          'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
        tileSize: 512,
        maxZoom: 20,
      }),
    }),
  ],
  view: new View({
    center: [-58, 0],
    zoom: 5,
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
      callback,
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
