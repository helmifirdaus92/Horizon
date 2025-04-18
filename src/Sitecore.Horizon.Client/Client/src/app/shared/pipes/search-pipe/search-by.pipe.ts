/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'searchBy' })
export class SearchByPipe implements PipeTransform {
  transform(items: any[] | null | undefined, fieldName: string, query: string) {
    if (!items) {
      return items;
    }

    return [...items].filter((item) => {
      return ((item[fieldName] || '') as string).toString().toLowerCase().indexOf(query.toLowerCase().trim()) !== -1;
    });
  }
}
