---
title: OpenLayers Feature Frenzy
layout: fact
favicon: https://openlayers.org/theme/img/logo-light.svg
contextMenu: false
fonts:
  sans: Open Sans
---

# OpenLayers Feature Frenzy

circa 2024

<!--
  Introduce ourselves
-->

---
layout: center
zoom: 1.5
---

# New to OpenLayers?

```bash
npm create ol-app my-app
cd my-app
npm start
```

<!--
  Encourage people to give it a try.
-->

### Let's dive in <twemoji-rocket />

---
title: Basic Map
layout: center
---

# <twemoji-world-map /> Basic Map

````md magic-move
```js
import {Map, View} from 'ol';
import Layer from 'ol/layer/Tile';
import Source from 'ol/source/OSM';

const map = new Map({
  target: 'map',
  layers: [
    new Layer({source: new Source()})
  ],
  view: new View({center: [0, 0], zoom: 2})
});
```
```js
import {Map, View} from 'ol';
import Layer from 'ol/layer/WebGLTile';
import Source from 'ol/source/ImageTile';
import {useGeographic} from 'ol/proj';

useGeographic();

const map = new Map({
  target: 'map',
  layers: [
    new Layer({source: new Source({
      url: 'https://example.com/{z}/{x}/{y}.png'
    })})
  ],
  view: new View({center: [-58, 0], zoom: 2})
});
```
````

<!--
  Mention the new ImageTile source, the WebGLTile layer, and
  useGeographic.
-->

---
title: Basic Map Example
layout: iframe-unscaled
url: ./examples/basic-map.html
---

<!--
  Zoom around. Show nice smooth rendering.
-->

---
title: A Bit of History
layout: fact
---

# <twemoji-hourglass-with-flowing-sand /> A bit of history

---
title: Google Maps
layout: image
image: /google-maps.png
backgroundSize: contain
# See https://github.com/openlayers/openlayers/commit/46035298a513b95406c98368a856d790dbb88d14
---

<!--
  Point out that OpenLayers came about as an open source alternative to Google Maps.
  We had support for a Google Maps layer ~18 years ago. In 2010, the Google Maps API
  was released with a ToS stating that wrapping was disallowed without explicit consent.
  OpenLayers had that consent. Integration began breaking ~10 years ago and we abandoned
  the effort to maintain it.
-->

---
title: Google Maps (cont.)
layout: center
---

# <twemoji-recycling-symbol /> Google Maps is Back

```js twoslash
import Google from 'ol/source/Google.js';

const source = new Google({
  key: 'your key here',
  mapType: 'roadmap',
  scale: 'scaleFactor2x',
  highDpi: true,
});
```

<!--
  The new Google source makes use of the Map Tiles API.
-->

---
title: Google Maps Example
layout: iframe-unscaled
url: ./examples/google-maps.html
---

<!--
  Read the docs to get a key and comply with the terms of service.
-->

---
title: OGC Tiles
layout: center
---

# <twemoji-police-officer /> And Standards Too

````md magic-move
```js
import Source from 'ol/source/OGCMapTile.js';
import Layer from 'ol/layer/Tile.js';

const layer = new Layer({
  source: new Source({
    url: 'https://example.com/ogc/raster/tiles',
  })
});
```
```js
import Source from 'ol/source/OGCVectorTile.js';
import Layer from 'ol/layer/VectorTile.js';
import MVT from 'ol/format/MVT.js';

const layer = new Layer({
  source: new Source({
    url: 'https://example.com/ogc/vector/tiles',
    format: new MVT(),
  })
});
```
````

---
title: OGC Map Tiles Example
layout: iframe-unscaled
url: ./examples/ogc-map-tiles.html
---

---
title: Projections
layout: fact
---

# <twemoji-globe-with-meridians /> What about
<h1 v-motion :initial="{y: 300}" :enter="{y: 0}" :leave="{y: -300}">projections?</h1>

---
title: GeoTIFF Reprojection Example
layout: iframe-unscaled
url: ./examples/geotiff-reprojection.html
---

<!--
  GeoTIFF in WGS 84 / UTM zone 36N displayed with GeoJSON in WGS 84 Geographic
  in a Spherical Mercator view.
-->

---
title: GeoTIFF Reprojection
layout: center
---

# <twemoji-globe-with-meridians /> Projections
````md magic-move
```js
import GeoTIFF from 'ol/source/GeoTIFF.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import View from 'ol/View.js';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4.js';

// prior to proj4@2.13.0
proj4.defs('EPSG:32636', '+proj=utm +zone=36 +datum=WGS84 +units=m ...');
register(proj4);

const source = new GeoTIFF({
  sources: [{url: 'https://example.com/cog.tif'}],
});

const map = new Map({
  target: 'map',
  layers: [new TileLayer({source})],
  view: new View({
    zoom: 12, center: [3730842, 1884545]}),
});
```
```js
import GeoTIFF from 'ol/source/GeoTIFF.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import View from 'ol/View.js';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4.js';

// with proj4@2.13.0, prior to ol@10.3.0
register(proj4);

const source = new GeoTIFF({
  sources: [{url: 'https://example.com/cog.tif'}],
});

const map = new Map({
  target: 'map',
  layers: [new TileLayer({source})],
  view: new View({
    zoom: 12, center: [3730842, 1884545],
  }),
});
```
```js
import GeoTIFF from 'ol/source/GeoTIFF.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import View from 'ol/View.js';

// built-in support for utm transforms
const source = new GeoTIFF({
  sources: [{url: 'https://example.com/cog.tif'}],
});

const map = new Map({
  target: 'map',
  layers: [new TileLayer({source})],
  view: new View({
    zoom: 12, center: [3730842, 1884545],
  }),
});
```
```js
import GeoTIFF from 'ol/source/GeoTIFF.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import View from 'ol/View.js';
import {useGeographic} from 'ol/proj.js';

useGeographic();

const source = new GeoTIFF({
  sources: [{url: 'https://example.com/cog.tif'}],
});

const map = new Map({
  target: 'map',
  layers: [new TileLayer({source})],
  view: new View({
    zoom: 12, center: [33.514, 16.688],
  }),
});
```
```js
import GeoTIFF from 'ol/source/GeoTIFF.js';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/WebGLTile.js';
import View from 'ol/View.js';

const source = new GeoTIFF({
  sources: [{url: 'https://example.com/cog.tif'}],
});

const map = new Map({
  target: 'map',
  layers: [new TileLayer({source})],
  view: new View({zoom: 12}),
});

source.getView().then(({center}) => {
  map.getView().setCenter(center);
});
```
````

---
layout: fact
---

# <twemoji-test-tube /> How else can raster data be manipulated?

---
title: Band Math
layout: center
---

# <twemoji-desktop-computer /> Band Math

```js
const red = ['band', 3];
const nir = ['band', 4];
const diff = ['-', nir, red];
const sum = ['+', nir, red];
const ndvi = ['/', diff, sum];
```

---
title: Band Math (cont.)
layout: center
---

# <twemoji-desktop-computer /> Band Math

```js
import GeoTIFF from 'ol/source/GeoTIFF.js';
import TileLayer from 'ol/layer/WebGLTile.js';

const layer = new TileLayer({
  source: new GeoTIFF({/** ... */}),
  style: {
    color: [
      'interpolate', ['linear'], ndvi,
      -1, 'rgb(100, 100, 100)',
      1, 'rgb(0, 69, 0)',
    ],
  },
});
```

---
title: Band Math Example
layout: iframe-unscaled
url: ./examples/band-math.html
---

<!--
  Expressions run and data available on the client.
-->

---
title: Sentinel Hub
layout: center
---

# <twemoji-satellite /> Sentinel Hub

```js twoslash
import SentinelHub from 'ol/source/SentinelHub.js';
const source = new SentinelHub({
  data: [{
    type: 'sentinel-2-l2a',
    dataFilter: {
      timeRange: {from: '2024-05-30T00:00:00Z', to: '2024-06-01T00:00:00Z'},
    },
  }],
  evalscript: {
    setup: () => ({input: ['B12', 'B08', 'B04'], output: {bands: 3}}),
    evaluatePixel: (sample) => [2 * sample.B12, 2 * sample.B08, 2 * sample.B04],
  },
});
```

<!--
  B12: SWIR 2
  B08: NIR
  B04: red
-->


---
title: Sentinel Hub Example
layout: iframe-unscaled
url: ./examples/sentinel-hub.html
---

<!--
  TODO: add a date picker
  TODO: make the evalscript editable
-->

---
layout: fact
---

# <twemoji-wrapped-gift /> What else is new?

---
title: Flow Layer
layout: image
image: /windy.png
---

<style>
  h1.big {
    text-align: center;
    font-size: 10rem;
    margin: 10% 0;
    font-weight: bold;
    font-style: italic;
  }
</style>

<h1 class="big">
  <twemoji-wind-face /> Wind!
</h1>

---
title: Flow Layer Example
layout: iframe-unscaled
url: ./examples/flow-layer.html
---

<!--
  TODO: add a date picker
  TODO: make the evalscript editable
-->

---
title: Continuous Improvements
layout: fact
---

# <twemoji-glowing-star /> Continuous improvements

---
title: (Text) Style and Rendering
layout: center
---

# <twemoji-placard /> (Text) Style and Rendering

````md magic-move
```js
new VectorLayer({
  style: (feature) => new Style({
    text: new Text({
      text: feature.get('name')
    })
  })
});
```
```js
new VectorLayer({
  style: (feature) => new Style({
    text: new Text({
      text: feature.get('name'),
      // v4.4.0 - September 2017
      placement: 'line'
    })
  })
});
```
```js
new VectorLayer({
  // v4.5.0 - November 2017
  declutter: true,
  style: (feature) => new Style({
    text: new Text({
      text: feature.get('name'),
      // v4.4.0 - September 2017
      placement: 'line'
    })
  })
});
```
````

---
title: Decluttering
layout: image
image: /declutter.png
backgroundSize: contain
# See https://github.com/openlayers/openlayers/pull/7328
---

---
title: (Text) Style and Rendering
layout: center
---

# <twemoji-placard /> (Text) Style and Rendering

````md magic-move
```js
new VectorLayer({
  // v4.5.0 - November 2017
  declutter: true,
  style: (feature) => new Style({
    text: new Text({
      text: feature.get('name'),
      // v4.4.0 - September 2017
      placement: 'line'
    })
  })
});
```
```js
new VectorLayer({
  // v4.5.0 - November 2017
  declutter: true,
  style: (feature) => new Style({
    font: '13px Calibri,sans-serif'
    text: new Text({
      // v6.13.0 - February 2022
      text: [
        feature.getId(),
        'bold 13px Calibri,sans-serif',
        ` ${feature.get('name')}`,
        ''
      ],
      // v4.4.0 - September 2017
      placement: 'line'
    })
  })
});
```
```js
new VectorLayer({
  // v9.0.0 - February 2024
  declutter: 'group-1',
  style: (feature) => new Style({
    font: '13px Calibri,sans-serif'
    text: new Text({
      // v9.0.0 - February 2024
      declutterMode: 'obstacle',
      // v6.13.0 - February 2022
      text: [
        feature.getId(),
        'bold 13px Calibri,sans-serif',
        ` ${feature.get('name')}`,
        ''
      ],
      // v4.4.0 - September 2017
      placement: 'line'
    })
  })
});
```
````

<!--
declutterMode option for Image styles had existed for a while already, but were broken until
the same option was introduced for Text styles.
-->

---
title: Label Rendering Example
layout: iframe-unscaled
url: ./examples/declutter.html
---

<!--
  Zoom and rotate. Show nice labels. The `obstacle` button shows the effect on icons, not text.
-->


---
title: (Text) Style and Rendering
layout: center
---

# <twemoji-candy /> (Text) Style &ndash; One More Thing

````md magic-move
```js
new VectorLayer({
  style: (feature) => new Style({
    text: new Text({
      font: '13px Calibri,sans-serif',
      text: feature.get('name'),
      placement: 'line',
      fill: new Fill({
        color: 'black'
      }),
      stroke: new Stroke({
        color: 'white',
        width: 2
      })
    })
  })
});
```
```js
new VectorLayer({
  style: {
    'text-font': '13px Calibri,sans-serif',
    'text-value': ['get', 'name'],
    'text-placement': 'line',
    'text-fill-color': 'black',
    'text-stroke-color': 'white',
    'text-stroke-width': 2
  }
});
```
````

---
layout: fact
---

# <twemoji-light-bulb /> API Simplifications

---
title: Custom tile loaders
layout: center
---

# <twemoji-inbox-tray /> Custom Tile Loaders

````md magic-move
```js
import Source from 'ol/source/XYZ.js';

const source = new Source({
  tileUrlFunction([z, x, y]) {
    return `${z}/${x}/${y}.png`;
  },
  tileLoadFunction(tile, url) {
    tile.getImage().src = url;
  }
});
```
```js
import Source from 'ol/source/ImageTile.js';

const source = new Source({
  loader(z, x, y, {signal}) {
    const image = new Image();
    image.src = `${z}/${x}/${y}.png`};
    return image.decode();
  }
});
```
````

---
title: Custom image loaders
layout: center
---

# <twemoji-inbox-tray /> Image Loaders Too!

````md magic-move
```js
import Source from 'ol/source/Image.js';

const source = new Source({
  loader(extent, resolution, pixelRatio) {
    const image = new Image();
    const params = new URLSearchParams({
      'mm-per-pixel': resolution * 1000,
      bbox: extent.join(','),
    });
    image.src = `map?crs=[EPSG:3857]&scale-denominator=1&${query.toString()}`;
    return image.decode();
  }
});
```
```js
import Source from 'ol/source/Image.js';
import { createLoader } from 'ol/source/static.js';
import { load } from 'ol/Image.js';

const source = new Source({
  loader: createLoader({
    url: 'map.svg',
    load,
  })
});
```
````
---
title: Scaled SVG Example
layout: iframe-unscaled
url: ./examples/scaled-svg.html
---

---
title: Other Slides
layout: center
---

other ideas:
 * easy upgrades despite breaking changes

---
title: Thanks
layout: fact
---

# Thanks!

***

andreas@ahocevar.com

tim@planet.com
