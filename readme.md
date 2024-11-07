# OpenLayers Feature Frenzy

## Development

Install dependencies:

    npm install

Run the development server:

    npm start

Build the slideshow:

    npm run build

The slides make use of values in a `.env` file during development. You can put one at the root of the repo with values used in `import.meta.env` properties.

```bash
# example .env file
VITE_GOOGLE_MAPS=your-maps-key-here
```

## Adding Slides

The `slides.md` file contains markdown for the slides. See the [Slidev docs](https://sli.dev/guide/syntax) for details on the syntax.

Examples are embedded in iframes using the special `iframe-unscaled` layout. When working on an example, you can load the example page directly instead of viewing it in the slideshow (e.g. http://localhost:3030/examples/basic-map.html).

## Icons

See the [Slidev Icons doc](https://sli.dev/features/icons) for instructions in including icons in markdown.

Look through the [Twemoji collection](https://icon-sets.iconify.design/twemoji/) to find icon names.

## Quirks

 * After viewing one of the map examples, if you can't navigate with the keyboard, hover over the bottom left of the page to get the previous/next slide controls.

 * Periodically, the screen may go blank during development. If you see `Uncaught TypeError: Cannot read properties of undefined (reading 'currentRoute')` in the console, you may need to close the tab, stop the dev server, and start over. Keep an eye on https://github.com/slidevjs/slidev/issues/1925 to see if this is addressed in Slidev.

 * Although Vite accepts a JavaScript `vite.config.js` file, Slidev requires `vite.config.ts`.
