/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PageStateReader } from '../page-state-reader';
import { Logger } from '../utils/logger';
import { Chrome } from './chrome';
import { ChromeManager } from './chrome-manager';
import { ChromePersistSelection, CONTEXT_SNAPSHOT_KEY } from './chrome-persist-selection';

describe(ChromePersistSelection.name, () => {
  let selectChromeSpy: jasmine.Spy;
  let chromeManager: jasmine.SpyObj<ChromeManager>;
  let pageStateReader: jasmine.SpyObj<PageStateReader>;
  let consoleLogger: jasmine.SpyObj<Logger>;

  let sut: ChromePersistSelection;

  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: (key: string): string | null => {
      return store.get(key) || null;
    },
    setItem: (key: string, value: string): void => {
      store.set(key, `${value}`);
    },
    removeItem: (key: string): void => {
      store.delete(key);
    },
  };

  function setTestDataToLocalStorage() {
    localStorageMock.setItem(
      CONTEXT_SNAPSHOT_KEY,
      // eslint-disable-next-line max-len
      '{"windowScrollY":0,"chromeId":"chrome id","pageState":{"itemId":"itemId","itemVersion":1,"siteName":"siteName","language":"language","deviceId":"deviceId","variant":"boxever"}}',
    );
  }

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake(localStorageMock.getItem);
    spyOn(localStorage, 'setItem').and.callFake(localStorageMock.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(localStorageMock.removeItem);

    consoleLogger = jasmine.createSpyObj<Logger>('logger', ['warn']);
    selectChromeSpy = jasmine.createSpy();

    chromeManager = jasmine.createSpyObj<ChromeManager>('chromeManager', ['getByChromeId']);
    chromeManager.getByChromeId.and.returnValue({
      chromeId: 'chromeId',
      getDimensions: () => ({
        top: 200,
      }),
      select: () => {
        selectChromeSpy();
      },
    } as unknown as Chrome);

    pageStateReader = jasmine.createSpyObj<PageStateReader>('pageStateReader', ['getHorizonPageState']);
    pageStateReader.getHorizonPageState.and.returnValue({
      itemId: 'itemId',
      itemVersion: 1,
      siteName: 'siteName',
      language: 'language',
      deviceId: 'deviceId',
      pageMode: 'edit',
      variant: 'boxever',
    });

    sut = new ChromePersistSelection(chromeManager, pageStateReader, consoleLogger);
  });

  afterEach(() => {
    store.clear();
  });

  it('should be created', () => {
    expect(sut).toBeDefined();
  });

  describe('saveContextSnapshot', () => {
    it('should store explicitly set chromeId to snapshot data in localstorage', () => {
      sut.saveSnapshot('RENDERING_explicitlysetchromeid');

      expect(localStorageMock.getItem(CONTEXT_SNAPSHOT_KEY)).toBe(
        // eslint-disable-next-line max-len
        '{"chromeId":"RENDERING_explicitlysetchromeid","windowScrollY":0,"pageState":{"itemId":"itemId","itemVersion":1,"siteName":"siteName","language":"language","deviceId":"deviceId","variant":"boxever"}}',
      );
    });
  });

  describe('restoreContext', () => {
    describe('WHEN there was stored context snapshot', () => {
      it('should select chrome', () => {
        setTestDataToLocalStorage();

        sut.restoreSnapshot();

        expect(selectChromeSpy).toHaveBeenCalled();
      });

      it('should clear the stored data in local storage.', () => {
        setTestDataToLocalStorage();

        sut.restoreSnapshot();

        expect(localStorageMock.getItem(CONTEXT_SNAPSHOT_KEY)).toBeNull();
      });

      describe('AND chrome cannot be found', () => {
        it('should not select chrome', () => {
          setTestDataToLocalStorage();
          chromeManager.getByChromeId.and.returnValue(undefined);

          sut.restoreSnapshot();

          expect(selectChromeSpy).not.toHaveBeenCalled();
        });

        it('should clear the stored data in local storage.', () => {
          setTestDataToLocalStorage();
          chromeManager.getByChromeId.and.returnValue(undefined);

          sut.restoreSnapshot();

          expect(localStorageMock.getItem(CONTEXT_SNAPSHOT_KEY)).toBeNull();
        });
      });

      describe('AND stored page state does not belog to a current page', () => {
        it('should not select chrome', () => {
          setTestDataToLocalStorage();
          pageStateReader.getHorizonPageState.and.returnValue({
            itemId: 'antoher itemId',
            itemVersion: 1,
            siteName: 'antoher siteName',
            language: 'antoher language',
            deviceId: 'antoher deviceId',
            pageMode: 'edit',
            variant: 'boxever',
          });

          sut.restoreSnapshot();

          expect(selectChromeSpy).not.toHaveBeenCalled();
        });
      });

      describe('AND stored data is corrupted', () => {
        it('should not select chrome', () => {
          localStorageMock.setItem(CONTEXT_SNAPSHOT_KEY, '[object Object]');

          sut.restoreSnapshot();

          expect(selectChromeSpy).not.toHaveBeenCalled();
        });

        it('should clear the stored data in local storage.', () => {
          localStorageMock.setItem(CONTEXT_SNAPSHOT_KEY, '[object Object]');

          sut.restoreSnapshot();

          expect(localStorageMock.getItem(CONTEXT_SNAPSHOT_KEY)).toBeNull();
        });
      });
    });

    describe('WHEN there was NO stored context snapshot', () => {
      it('should NOT select chrome', () => {
        sut.restoreSnapshot();

        expect(selectChromeSpy).not.toHaveBeenCalled();
      });
    });
  });
});
