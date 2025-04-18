/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { App } from './app/app';

const run = async () => {
  window.parent.postMessage('hrz-page-DOMContentLoaded', '*');

  await App.setupApp();
};

// Wait if document is not loaded yet.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}
