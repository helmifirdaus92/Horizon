/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';
import { ItemFieldType } from '../../../../../shared/graphql/item.dal.service';

@Pipe({
  name: 'dateFormat',
})
export class DateFormatPipe implements PipeTransform {
  transform(date: string, format: Extract<ItemFieldType, 'Date' | 'Datetime'>): string {
    const dateFormat = format === 'Date' ? 'MMM Do YYYY' : 'MMMM Do YYYY, h:mm a';
    return moment(new Date(date)).format(dateFormat);
  }
}
