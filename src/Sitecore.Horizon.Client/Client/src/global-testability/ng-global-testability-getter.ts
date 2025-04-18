/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, PlatformRef } from '@angular/core';
// Split imports into two sections as a workaround:
// https://github.com/ng-packagr/ng-packagr/issues/1543#issuecomment-593873874
import { GetTestability, Testability, TestabilityRegistry } from '@angular/core';

export interface TestabilitySource {
  getTestabilities(): Testability[];
}

@Injectable({ providedIn: 'platform' })
export class NgGlobalTestabilityGetter implements GetTestability {
  private registeredTestabilitySource?: TestabilitySource;

  /**
   * Window getter for unit testing and typing
   */
  static getWindow(): {
    getAllAngularTestabilities: () => Testability[];
    getAllNgGlobalTestabilities: () => Testability[];
    FED_UI_TESTABILITY_SOURCES: TestabilitySource[];
  } {
    return window as any;
  }

  static initWindow() {
    const w = this.getWindow();

    if (w.FED_UI_TESTABILITY_SOURCES) {
      return;
    }

    w.FED_UI_TESTABILITY_SOURCES = [];
    w.getAllAngularTestabilities = w.getAllNgGlobalTestabilities = () => {
      // Do not use spread operator as a workaround for the issue:
      // https://github.com/ng-packagr/ng-packagr/issues/1543#issuecomment-635571501
      return w.FED_UI_TESTABILITY_SOURCES.reduce((memo, s) => {
        s.getTestabilities().forEach((v) => memo.push(v));
        return memo;
      }, new Array<Testability>());
    };
  }

  constructor(platformRef: PlatformRef, r: TestabilityRegistry) {
    platformRef.onDestroy(() => this.removeFromWindow());
    this.addToWindow(r);
  }

  addToWindow(registry: TestabilityRegistry): void {
    this.registeredTestabilitySource = {
      getTestabilities: () => registry.getAllTestabilities(),
    };

    NgGlobalTestabilityGetter.initWindow();
    NgGlobalTestabilityGetter.getWindow().FED_UI_TESTABILITY_SOURCES.push(this.registeredTestabilitySource);
  }

  findTestabilityInTree(_registry: TestabilityRegistry, _elem: any, _findInAncestors: boolean): Testability | null {
    throw Error(
      `Is not implemented and is not expected to be called. Please register a bug to Page Composer team if you see this error.`,
    );
  }

  private removeFromWindow() {
    if (!this.registeredTestabilitySource) {
      return;
    }

    const sources = NgGlobalTestabilityGetter.getWindow().FED_UI_TESTABILITY_SOURCES;
    const index = sources.indexOf(this.registeredTestabilitySource);
    if (index > -1) {
      sources.splice(index, 1);
    }

    this.registeredTestabilitySource = undefined;
  }
}
