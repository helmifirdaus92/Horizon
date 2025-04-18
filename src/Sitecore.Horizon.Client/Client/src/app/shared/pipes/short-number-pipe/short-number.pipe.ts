/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Currently this pipe only support whole number
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortNumber',
})
export class ShortNumberPipe implements PipeTransform {
  transform(value: any): any {
    if (!value) {
      return value;
    }
    if (isNaN(value)) {
      return value;
    }
    if (value === null) {
      return value;
    }
    let absoluteValue = Math.abs(value);
    const rounder = Math.pow(10, 1);

    // We get the absolute result of the value, but we have to define this check to return
    // the proper result for the negative value.
    const isNegative = value < 0;
    let key = '';

    const powers = [
      { key: 'B', value: Math.pow(10, 9) }, // Billion
      { key: 'M', value: Math.pow(10, 6) }, // Million
      { key: 'K', value: 1000 }, // Thousand
    ];
    for (let i = 0; i < powers.length; i++) {
      let reduced = absoluteValue / powers[i].value;
      reduced = Math.round(reduced * rounder) / rounder;
      if (reduced >= 1) {
        absoluteValue = reduced;
        key = powers[i].key;
      } else {
        absoluteValue = Math.round(absoluteValue * 10) / 10;
      }
    }

    return (isNegative ? '-' : '') + absoluteValue + key;
  }
}
