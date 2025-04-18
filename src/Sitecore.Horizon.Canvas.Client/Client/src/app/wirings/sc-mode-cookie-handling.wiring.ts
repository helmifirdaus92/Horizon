/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingService } from '../messaging/messaging-service';
import { PageStateReader } from '../page-state-reader';
import { Wiring } from './wiring';

export class ScModeCookieHandlingWiring implements Wiring {
  constructor(
    private readonly pageStateReader: PageStateReader,
    private readonly messaging: MessagingService,
  ) {}

  wire(abortController: AbortController): void {
    const siteName = this.pageStateReader.getHorizonPageState().siteName;
    this.setupScModeCookieHandler('edit', siteName, abortController);

    this.messaging.editingChannel.on('sc-mode-cookie:set', (params) => {
      this.setScModeCookie(params.scMode, siteName);
    });
  }

  private setupScModeCookieHandler(scMode: 'edit' | 'preview', siteName: string, abortController: AbortController): void {
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'visible') {
          // Setup the edit mode cookie when returning back to Horizon browser tab for example after preview tab
          this.setScModeCookie(scMode, siteName);
        }
      },
      { signal: abortController.signal },
    );
  }

  private setScModeCookie(value: 'edit' | 'preview', siteName: string) {
    document.cookie = `${siteName.toLowerCase()}#sc_mode=${value}; SameSite=None; Secure`;
    document.cookie = `sc_headless_mode=${value}; SameSite=None; Secure`;
  }
}
