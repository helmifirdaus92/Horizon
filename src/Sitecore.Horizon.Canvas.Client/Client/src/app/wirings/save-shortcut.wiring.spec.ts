/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeManager } from '../chrome/chrome-manager';
import { SaveShortcutWiring } from './save-shortcut.wiring';

describe(SaveShortcutWiring.name, () => {
  let sut: SaveShortcutWiring;
  let abortController: AbortController;
  let chromeManager: jasmine.SpyObj<ChromeManager>;
  beforeEach(() => {
    abortController = new AbortController();
    chromeManager = jasmine.createSpyObj<ChromeManager>({}, { fieldChromes: [] });

    sut = new SaveShortcutWiring(chromeManager);
  });

  it('should not call preventDefault() on keydown event after abort', () => {
    // arrange
    const S_KEY_CODE = 83;
    const event = new KeyboardEvent('keydown', {
      which: S_KEY_CODE,
      keyCode: S_KEY_CODE,
      ctrlKey: true,
      cancelable: true,
    } as KeyboardEventInit);

    sut.wire(abortController);

    // act
    abortController.abort();
    window.dispatchEvent(event);

    // assert
    expect(event.defaultPrevented).toBeFalse();
  });
});
