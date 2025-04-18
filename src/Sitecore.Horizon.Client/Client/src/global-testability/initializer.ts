/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import {
  PlatformRef,
  PLATFORM_INITIALIZER,
  setTestabilityGetter,
  StaticProvider,
  TestabilityRegistry,
} from '@angular/core';
import { NgGlobalTestabilityGetter } from './ng-global-testability-getter';

export const INIT_NG_GLOBAL_TESTABILITY: StaticProvider = {
  provide: PLATFORM_INITIALIZER,
  // { providedIn: 'platform' } does not work for pre-Ivy solutions, so create the provide manually here.
  useFactory: (platformRef: PlatformRef, tr: TestabilityRegistry) => () =>
    setTestabilityGetter(new NgGlobalTestabilityGetter(platformRef, tr)),
  deps: [PlatformRef, TestabilityRegistry],
  multi: true,
};
