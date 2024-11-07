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

// prior to ol@10.3.0
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
import {useGeographic} from 'ol/proj.js';

useGeographic();

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
title: Band Math
---

TODO: Band Math

---
title: Sentinel Hub
---

TODO: Sentinel Hub

---
title: Flow Layer
---

TODO: Flow Layer

---
title: Other Slides
---

TODO:
 * label decluttering
 * new source loader
 * easy upgrades despite breaking changes

---
title: Thanks
layout: fact
---

# Thanks!

***

andreas@ahocevar.com

tim@planet.com
