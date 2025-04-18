/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { PlaceholderChrome } from '../chrome/chrome.placeholder';
import { RenderingChrome } from '../chrome/chrome.rendering';
import { setupTestDOM, teardownTestDOM } from '../utils/dom.testing';
import { NotificationBlock } from './notification';
import { RenderingDropZonesUtil } from './rendering-drop-zones-util';

describe(NotificationBlock.name, () => {
  let rootElement: HTMLDivElement;
  let sut: NotificationBlock;
  let dimensionSource: jasmine.SpyObj<RenderingChrome | PlaceholderChrome>;
  let renderingUtil: RenderingDropZonesUtil;

  const block = () => {
    return rootElement.querySelector('[class^=sc-error-block]') as HTMLDivElement;
  };
  const dropZoneHeight = () => {
    return renderingUtil.getDropZoneSize(dimensionSource).height;
  };

  beforeEach(() => {
    dimensionSource = jasmine.createSpyObj<RenderingChrome | PlaceholderChrome>('chrome', {
      getDimensions: { top: 100, left: 1000, height: 100, width: 500 },
    });
    rootElement = setupTestDOM(`
    <div id="testChrome">foo</div>
  `) as HTMLDivElement;

    sut = new NotificationBlock(dimensionSource);
    renderingUtil = new RenderingDropZonesUtil();
  });

  afterEach(() => {
    teardownTestDOM(rootElement);
  });

  it('should append element on show', () => {
    sut.attach(rootElement);

    expect(block()).toBeTruthy();
  });

  it('should detach element on hide', () => {
    sut.attach(rootElement);

    sut.detach();

    expect(block()).toBeFalsy();
  });

  describe('setWrapperDimension', () => {
    it('should have style `top` if position is before', () => {
      sut = new NotificationBlock(dimensionSource, 'before');
      sut.attach(rootElement);

      expect(block()?.style.top).toEqual(dropZoneHeight() + 10 + 'px');
    });

    it('should have style `bottom` if position is after', () => {
      sut = new NotificationBlock(dimensionSource, 'after');
      sut.attach(rootElement);

      expect(block()?.style.bottom).toEqual(dropZoneHeight() + 10 + 'px');
    });

    it('should have style `top` if [chrome.top < 40] and [chrome.height < 80]', () => {
      dimensionSource.getDimensions.and.returnValue({
        top: 30,
        height: 60,
        left: 1000,
        width: 500,
      });
      sut = new NotificationBlock(dimensionSource);
      sut.attach(rootElement);

      expect(block()?.style.top).toEqual(dropZoneHeight() + 10 + 'px');
    });

    it('should have style `left` if [chrome.width < 350] and is in visible zone', () => {
      dimensionSource.getDimensions.and.returnValue({
        top: 30,
        height: 60,
        left: 1000,
        width: 200,
      });
      sut = new NotificationBlock(dimensionSource);
      sut.attach(rootElement);

      spyOn<any>(sut, 'isInVisibleZone').and.returnValue(true);

      expect(block()?.style.left).toEqual('210px');
    });

    it('should have style `right` if [chrome.width < 350] and is not in visible zone', () => {
      dimensionSource.getDimensions.and.returnValue({
        top: 800,
        height: 100,
        left: 0,
        width: 200,
      });
      sut = new NotificationBlock(dimensionSource);
      spyOn<any>(sut, 'isInVisibleZone').and.returnValue(false);
      sut.attach(rootElement);

      expect(block()?.style.right).toEqual('210px');
    });
  });
});
