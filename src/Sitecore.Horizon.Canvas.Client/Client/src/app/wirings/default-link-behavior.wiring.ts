/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FeatureChecker } from '../utils/feature-checker';
import { Wiring } from './wiring';

export class DefaultLinkBehaviorWiring implements Wiring {
  wire(abortController: AbortController): void {
    // Capture all the propagated click events.
    // Handle anchor elements only and prevent default link behavior unless CTRL button is being hold.
    document.body.addEventListener(
      'click',
      (event) => {
        // Be aware that immediate click target might be not the link, but e.g. nested element. So we inspect full path for the first link.
        const linkElement = event.composedPath().find((e): e is HTMLAnchorElement => e instanceof HTMLAnchorElement);
        if (!linkElement) {
          return;
        }

        event.preventDefault();

        // Direct Rendering host page doesn't support link navigation
        // Disable link navigation
        if (FeatureChecker.isShallowChromesEnabled()) {
          return;
        }

        if (event.ctrlKey) {
          const target = linkElement.getAttribute('target') || '_self';
          const href = linkElement.getAttribute('href') as string;

          // Handle the link manually to prevent default CTRL+Click browser behavior (open in a new tab).
          // Rather we manually handle link target.
          window.open(href, target);
        }
      },
      { signal: abortController.signal },
    );
  }
}
