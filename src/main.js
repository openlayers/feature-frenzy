import './big/big.js';
import 'highlight.js/styles/stackoverflow-light.css';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('javascript', javascript);
hljs.highlightAll();
// hljs.initHighlightingOnLoad();

document.body.addEventListener('click', (e) => {
  if (e.clientX > document.body.clientWidth / 2) {
    globalThis.big.forward();
  } else {
    globalThis.big.go(big.current - 1);
  }
});
