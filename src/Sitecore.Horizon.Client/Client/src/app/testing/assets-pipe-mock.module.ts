/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'asset' })
export class AssetPipeMock implements PipeTransform {
  transform(path: string) {
    return `assets/${path}`;
  }
}

@NgModule({
  imports: [],
  exports: [AssetPipeMock],
  declarations: [AssetPipeMock],
  providers: [],
})
export class AssetsPipeMockModule {}
