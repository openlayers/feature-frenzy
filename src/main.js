import './big/big.js';
import 'highlight.js/styles/stackoverflow-light.css';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

/* global big */

hljs.registerLanguage('javascript', javascript);
hljs.highlightAll();
// hljs.initHighlightingOnLoad();

document.body.addEventListener('click', (e) => {
  const margin = document.body.clientWidth / 6;
  if (e.clientX > document.body.clientWidth - margin) {
    big.forward();
  } else if (e.clientX < margin) {
    big.go(big.current - 1);
  }
});
