/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PageStateReader } from '../app/page-state-reader';

/**
 * Set Preview mode cookie
 *
 * Scenario 1: When Preview page is loaded
 * WHEN a page is loaded, wait for 2 seconds and if the current tab is active, SET the Preview mode cookies
 *
 * Scenario 2: When switch to the Preview page from another tab
 * WHEN switch to the Preview page tab from another tab (e.g. the Edit mode tab), SET the Preview mode cookies
 */

const pageStateReader = new PageStateReader();
const siteName = pageStateReader.getHorizonPageState().siteName;

const setupScModeCookieHandler = (): void => {
  if (document.visibilityState === 'visible') {
    if (siteName) {
      document.cookie = siteName.toLowerCase() + '#sc_mode=preview; SameSite=None; Secure';
    }

    document.cookie = 'sc_headless_mode=preview; SameSite=None; Secure';
  }
};

const run = () => {
  document.addEventListener('visibilitychange', () => {
    // Watch the browser tab switch and set the preview mode cookie when returning back to preview browser tab
    setupScModeCookieHandler();
  });

  // Set the preview mode cookie with a delay of around a second to accommodate those cases:
  // If any of resources of the page (like a ling to an image in RTE) fails to load, it automatically removes sc_headless_mode
  setTimeout(() => {
    setupScModeCookieHandler();
  }, 2000);
};

// Wait if document is not loaded yet.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', run);
} else {
  run();
}
