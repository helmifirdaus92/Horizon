/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Pipe, PipeTransform } from '@angular/core';
import { normalizeGuid } from './utils';

@Pipe({ name: 'normalizeGuid' })
export class NormalizeGuidPipe implements PipeTransform {
  transform(value: any) {
    return typeof value === 'string' ? normalizeGuid(value) : value;
  }
}
