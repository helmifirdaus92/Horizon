/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'asset' })
export class AssetPipe implements PipeTransform {
  transform(value: string): string {
    return `/assets/${value}`;
  }
}
