/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Pipe, PipeTransform } from '@angular/core';
import { SortingDirection } from '@sitecore/ng-spd-lib';

@Pipe({ name: 'sort' })
export class SortPipe implements PipeTransform {
  transform(items: any[], sortOrder: SortingDirection | undefined, sortKey: string | undefined) {
    if (!items) {
      return items;
    }

    if (!sortKey || !sortOrder) {
      return items;
    }

    if (items.length <= 1) {
      return items;
    }

    if (items.find((item) => typeof item[sortKey] === 'string')) {
      return [...items].sort((a: any, b: any): any => {
        const upperFieldValue = (a[sortKey] || '').toString().toLowerCase();
        const lowerFieldValue = (b[sortKey] || '').toString().toLowerCase();

        if (sortOrder === 'ASC' && upperFieldValue < lowerFieldValue) {
          return -1;
        } else if (sortOrder === 'DESC' && upperFieldValue > lowerFieldValue) {
          return -1;
        }

        return 0;
      });
    }

    return [...items].sort((a: any, b: any): any => {
      const upperFieldValue = a[sortKey] || '';
      const lowerFieldValue = b[sortKey] || '';

      if (sortOrder === 'ASC' && upperFieldValue < lowerFieldValue) {
        return -1;
      } else if (sortOrder === 'DESC' && upperFieldValue > lowerFieldValue) {
        return -1;
      }

      return 0;
    });
  }
}
