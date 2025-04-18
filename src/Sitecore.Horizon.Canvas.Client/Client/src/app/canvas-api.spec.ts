/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeRediscoveryGlobalFunctionName } from '../sdk/contracts/chrome-rediscovery.contract';
import { SetupAppGlobalFunctionName, ShutdownAppGlobalFunctionName } from '../sdk/contracts/set-app.contract';
import { CanvasApi } from './canvas-api';
import { BasicChromeInfo } from './messaging/horizon-canvas.contract.parts';

describe(CanvasApi.name, () => {
  let sut: CanvasApi;

  beforeEach(() => {
    sut = new CanvasApi();
  });

  afterEach(() => {
    (window as any)[ChromeRediscoveryGlobalFunctionName.name] = undefined;
    (window as any)[ShutdownAppGlobalFunctionName.name] = undefined;
    (window as any)[SetupAppGlobalFunctionName.name] = undefined;
  });

  describe('initChromesRediscoveryGlobalFunction', () => {
    it('should execute a handler on a global function', () => {
      const resultSpy = jasmine.createSpy();
      sut.initChromesRediscoveryGlobalFunction(resultSpy);

      window[ChromeRediscoveryGlobalFunctionName.name]?.();

      expect(resultSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('SetupAppGlobalFunctionName', () => {
    it('should execute a handler on a global function', () => {
      const resultSpy = jasmine.createSpy();
      sut.initSetupAppGlobalFunction(resultSpy);

      window[SetupAppGlobalFunctionName.name]?.();

      expect(resultSpy).toHaveBeenCalledTimes(1);
    });

    it('should execute a handler with parameters', () => {
      const resultSpy = jasmine.createSpy();
      sut.initSetupAppGlobalFunction(resultSpy);

      const isSamePage = true;

      window[SetupAppGlobalFunctionName.name]?.(isSamePage);

      const args = resultSpy.calls.mostRecent().args[0];
      expect(args).toBe(isSamePage);
      expect(resultSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('initShutdownAppGlobalFunction', () => {
    it('should execute a handler on a global function', () => {
      const resultSpy = jasmine.createSpy();
      sut.initShutdownAppGlobalFunction(resultSpy);

      window[ShutdownAppGlobalFunctionName.name]?.();

      expect(resultSpy).toHaveBeenCalledTimes(1);
    });

    it('should execute a handler with parameters', () => {
      const resultSpy = jasmine.createSpy();
      sut.initShutdownAppGlobalFunction(resultSpy);

      const chromeToSelect: BasicChromeInfo = { chromeId: '1', chromeType: 'rendering' };

      window[ShutdownAppGlobalFunctionName.name]?.({ saveSnapshotChromeId: chromeToSelect.chromeId });

      const args = resultSpy.calls.mostRecent().args[0];
      expect(args).toEqual({ saveSnapshotChromeId: chromeToSelect.chromeId });
      expect(resultSpy).toHaveBeenCalledTimes(1);
    });
  });
});
