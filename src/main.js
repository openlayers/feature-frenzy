import './big/big.js';
import 'highlight.js/styles/stackoverflow-light.css';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

/* global big */

hljs.registerLanguage('javascript', javascript);
hljs.highlightAll();
// hljs.initHighlightingOnLoad();

document.body.addEventListener('dblclick', (e) => {
  if (e.clientX > document.body.clientWidth / 2) {
    big.forward();
  } else {
    big.go(big.current - 1);
  }
});
