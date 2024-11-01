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
title: GeoTIFF Reprojection
---

TODO: GeoTIFF Reprojection

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
