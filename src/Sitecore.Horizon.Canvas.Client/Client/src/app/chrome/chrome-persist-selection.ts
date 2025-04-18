/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PageStateReader } from '../page-state-reader';
import { keyOf } from '../utils/lang';
import { Logger } from '../utils/logger';
import { ChromeManager } from './chrome-manager';

export const CONTEXT_SNAPSHOT_KEY = 'Sitecore.Horizon.ContextSnapshot';

interface ContextState {
  chromeId?: string;
  windowScrollY: number;
  pageState: {
    itemId: string;
    itemVersion: number;
    siteName: string;
    language: string;
    deviceId: string;
    variant: string | undefined;
  };
}

function isContextState(state: ContextState | null): state is ContextState {
  return state instanceof Object && keyOf<ContextState>('windowScrollY') in state && keyOf<ContextState>('pageState') in state;
}

export class ChromePersistSelection {
  constructor(
    private readonly chromeManager: ChromeManager,
    private readonly pageStateReader: PageStateReader,
    private readonly logger: Logger,
  ) {}

  restoreSnapshot() {
    let contextSnapshot: ContextState | null = null;

    // There's an issue that JSON.parse method is sensitive to the passed value.
    // The whole app can be crashed because of corupted localStorage value.
    // To avoid this we are using try/catch approach.
    try {
      const contextSnapshotRaw: string | null = localStorage.getItem(CONTEXT_SNAPSHOT_KEY);
      contextSnapshot = contextSnapshotRaw ? JSON.parse(contextSnapshotRaw) : null;

      if (contextSnapshot && !isContextState(contextSnapshot)) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        throw Error(`Expect stored data to be ContextState, but get instead: ${contextSnapshot}`);
      }
    } catch (error) {
      this.logger.warn(error as string);
    }

    this.selectChromeAndScroll(contextSnapshot);

    localStorage.removeItem(CONTEXT_SNAPSHOT_KEY);
  }

  saveSnapshot(chromeId: string) {
    const { itemId, itemVersion, siteName, language, deviceId, variant: variant } = this.pageStateReader.getHorizonPageState();

    const state: ContextState = {
      chromeId,
      windowScrollY: window.scrollY,
      pageState: { itemId, itemVersion, siteName, language, deviceId, variant },
    };

    const contextSnapshot = state;

    localStorage.setItem(CONTEXT_SNAPSHOT_KEY, JSON.stringify(contextSnapshot));
  }

  private selectChromeAndScroll(contextSnapshot: ContextState | null): void {
    if (!contextSnapshot) {
      return;
    }

    const { itemId, itemVersion, siteName, language, deviceId } = this.pageStateReader.getHorizonPageState();
    if (
      itemId !== contextSnapshot.pageState.itemId ||
      itemVersion !== contextSnapshot.pageState.itemVersion ||
      siteName !== contextSnapshot.pageState.siteName ||
      language !== contextSnapshot.pageState.language ||
      deviceId !== contextSnapshot.pageState.deviceId
    ) {
      this.logger.warn('The stored page state is not the same as the current page.');
      return;
    }

    const snapshotChromeId = contextSnapshot.chromeId;
    const chromeToSelect = snapshotChromeId ? this.chromeManager.getByChromeId(snapshotChromeId) : undefined;

    if (chromeToSelect && snapshotChromeId) {
      chromeToSelect.select();
    }

    window.scrollTo({ top: !!contextSnapshot.windowScrollY ? contextSnapshot.windowScrollY : chromeToSelect?.getDimensions().top });
  }
}
