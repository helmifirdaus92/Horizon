/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateDifference',
})
export class DateDifferencePipe implements PipeTransform {
  transform(startDate: Date | string | number | undefined, endDate: Date | string | number | undefined): number {
    if (!startDate || !endDate) {
      return 0;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const timeDiff = end - start;

    return Math.floor(timeDiff / (1000 * 3600 * 24));
  }
}

@NgModule({
  declarations: [DateDifferencePipe],
  exports: [DateDifferencePipe],
})
export class DateDifferenceModule {}
