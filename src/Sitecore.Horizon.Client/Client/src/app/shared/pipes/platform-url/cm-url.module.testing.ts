/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { TESTING_URL } from 'app/testing/test.utils';

@Pipe({ name: 'cmUrl' })
export class CmUrlTestingPipe implements PipeTransform {
  transform(input: string): string {
    return `${TESTING_URL}${input}`;
  }
}

@NgModule({
  exports: [CmUrlTestingPipe],
  declarations: [CmUrlTestingPipe],
})
export class CmUrlTestingModule {}
