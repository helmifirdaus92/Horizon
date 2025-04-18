/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeDom } from '../chrome/chrome-dom';
import { ChromeHighlighter } from '../chrome/chrome-highlighter';
import { ChromeManager } from '../chrome/chrome-manager';
import { Wiring } from './wiring';

export class InitChromeHighlighterWiring implements Wiring {
  constructor(
    private readonly chromeHighlighter: ChromeHighlighter,
    private readonly chromeManager: ChromeManager,
    private readonly chromeDom: ChromeDom,
  ) {}

  wire(): void {
    this.chromeHighlighter.setupChromes(this.chromeManager.chromes, this.chromeDom.root);
  }
}
