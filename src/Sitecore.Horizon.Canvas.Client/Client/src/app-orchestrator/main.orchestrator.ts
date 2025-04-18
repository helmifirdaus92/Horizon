/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

// Listen for the Horizon application build hash
// value of allowedOriginsCombined is patched by BE for each environment
// Pipe is used as separator for multiple allowed domains
const allowedOriginsCombined = 'http://localhost:5000';
const allowedOrigins = allowedOriginsCombined.split('|');
const hrzCanvasScriptElement = document.createElement('script');
hrzCanvasScriptElement.async = true;
document.head.appendChild(hrzCanvasScriptElement);
const canvasScriptLoadListener = (event: MessageEvent) => {
  if (
    event.data.hrzCanvasScriptUrl &&
    allowedOrigins.some((origin) => new URL(origin).origin.toLowerCase() === event.origin.toLowerCase())
  ) {
    hrzCanvasScriptElement.src = event.data.hrzCanvasScriptUrl;
    window.removeEventListener('message', canvasScriptLoadListener);
  }
};
window.addEventListener('message', canvasScriptLoadListener);
window.parent.postMessage('hrz-page-orchestrator-loaded', '*');

// Styles: hide chromes, keep place for placeholders
const hrzCanvasStyleElement = document.createElement('style');
hrzCanvasStyleElement.textContent = `
  .scpm, .scChromeData {
    display: none !important;
  }
  .sc-jss-empty-placeholder {
    min-height: 100px;
  }
`;
document.head.appendChild(hrzCanvasStyleElement);

// Report page load to the Horizon
const postCanvasDomContentLoaded = async () => {
  window.parent.postMessage('hrz-page-DOMContentLoaded', '*');
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', postCanvasDomContentLoaded);
} else {
  postCanvasDomContentLoaded();
}
