/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromeRediscoveryGlobalFunctionName } from '../sdk/contracts/chrome-rediscovery.contract';
import { AppReadyGlobalFlagName, SetupAppGlobalFunctionName, ShutdownAppGlobalFunctionName } from '../sdk/contracts/set-app.contract';
import { ShutdownParams } from './app';

declare global {
  interface Window {
    [ShutdownAppGlobalFunctionName.name]: (params?: ShutdownParams) => void;
    [SetupAppGlobalFunctionName.name]: (isSamePage?: boolean) => void;
    [ChromeRediscoveryGlobalFunctionName.name]: () => void;
    [AppReadyGlobalFlagName.name]: boolean;
    pagesSetRenderingParams: (renderingInstanceId: string, params: string) => void;
  }
}

export class CanvasApi {
  static destroyPublicApi() {
    const contracts = [ChromeRediscoveryGlobalFunctionName.name];

    contracts.forEach((contract) => {
      if ((window as any)[contract]) {
        delete (window as any)[contract];
      }
    });
  }

  initSetRenderingParamsGlobalFunction(handler: (renderingInstanceId: string, params: string) => void) {
    window.pagesSetRenderingParams = handler;
  }

  initChromesRediscoveryGlobalFunction(handler: () => void) {
    window[ChromeRediscoveryGlobalFunctionName.name] = handler;
  }

  initShutdownAppGlobalFunction(handler: (params?: ShutdownParams) => void) {
    window[ShutdownAppGlobalFunctionName.name] = handler;
  }

  initSetupAppGlobalFunction(handler: (isSamePage?: boolean) => void) {
    window[SetupAppGlobalFunctionName.name] = handler;
  }
}
