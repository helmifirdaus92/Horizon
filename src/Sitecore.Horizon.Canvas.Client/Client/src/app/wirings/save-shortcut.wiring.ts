/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeManager } from '../chrome/chrome-manager';
import { Wiring } from './wiring';

const S_KEY_CODE = 83;

export class SaveShortcutWiring implements Wiring {
  constructor(private readonly chromeManager: ChromeManager) {}

  wire(abortController: AbortController): void {
    window.addEventListener(
      'keydown',
      (event: KeyboardEvent) => {
        const keyCode = event.which || event.keyCode;

        if (keyCode === S_KEY_CODE && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();

          this.chromeManager.fieldChromes.forEach((fld) => fld.flushChanges());
        }
      },
      { signal: abortController.signal },
    );
  }
}
