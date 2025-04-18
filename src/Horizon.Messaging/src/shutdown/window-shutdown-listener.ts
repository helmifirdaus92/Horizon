/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ShutdownListener } from './shutdown-listener';

export class WindowShutdownListener implements ShutdownListener {
  private readonly handlers: Array<() => void> = [];

  constructor() {
    window.addEventListener('beforeunload', () => this.onWindowUnload());
  }

  onShutdown(handler: () => void): void {
    this.handlers.push(handler);
  }

  private onWindowUnload() {
    this.handlers.forEach((h) => h());
  }
}
