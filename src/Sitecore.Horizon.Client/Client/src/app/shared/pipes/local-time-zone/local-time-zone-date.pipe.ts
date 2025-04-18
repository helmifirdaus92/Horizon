/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localTimeZoneDate',
})
export class LocalTimeZoneDatePipe implements PipeTransform {
  transform(value: Date | string | number | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone,
    });

    return `${formatter.format(date)} (${timeZone})`;
  }
}

@NgModule({
  declarations: [LocalTimeZoneDatePipe],
  exports: [LocalTimeZoneDatePipe],
})
export class LocalTimeZoneDateModule {}
