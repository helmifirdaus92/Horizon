/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DatePipe } from '@angular/common';
import { NgModule, Pipe } from '@angular/core';

@Pipe({
  name: 'date',
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class DatePipeMock extends DatePipe {
  override transform(value: any, format?: any): any {
    return super.transform(value, format, '+0000', 'en');
  }
}
@NgModule({
  imports: [],
  exports: [DatePipeMock],
  declarations: [DatePipeMock],
  providers: [],
})
export class DatePipeMockModule {}
