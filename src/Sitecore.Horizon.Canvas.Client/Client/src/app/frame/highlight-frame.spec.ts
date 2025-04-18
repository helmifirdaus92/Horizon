/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { HighlightFrame } from './highlight-frame';

describe('HiglightFrame', () => {
  let rootElement: Element;
  let sut: HighlightFrame;

  beforeEach(() => {
    rootElement = setupTestDOM(`
      <div id="testChrome">foo</div>
    `);
    sut = new HighlightFrame({ getDimensions: () => ({ top: 0, left: 0, width: 0, height: 0 }), getIsPersonalized: () => false });
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should add a frame to a host element when .attach is called', () => {
    sut.show(rootElement);
    expect(rootElement.querySelector('[class^=sc-frame]')).toBeTruthy();
  });

  it('should add "personalized" class when the chrome is personalized', () => {
    sut = new HighlightFrame({ getDimensions: () => ({ top: 0, left: 0, width: 0, height: 0 }), getIsPersonalized: () => true });
    sut.show(rootElement);
    expect(rootElement.querySelector('[class*=personalized]')).toBeTruthy();
  });

  it('should remove a frame already attached when .detach is called', () => {
    sut.show(rootElement);
    sut.hide();
    expect(rootElement.querySelector('[class^=sc-frame]')).toBeFalsy();
  });
});
