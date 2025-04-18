/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { appendQueryString } from 'app/shared/utils/url.utils';

@Pipe({ name: 'fileSize' })
export class MediaFileSizePipe implements PipeTransform {
  transform(value = 0, decimals = 0): string {
    if (!value) {
      return '0 B';
    }

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(value) / Math.log(k));

    return parseFloat((value / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
  }
}

@Pipe({ name: 'resizeMedia' })
export class ResizeMediaPipe implements PipeTransform {
  transform(url: string, maxHeight = 260, maxWidth = 260): string {
    if (!url) {
      return '';
    }

    return appendQueryString(url, [
      ['mh', maxHeight.toString()],
      ['mw', maxWidth.toString()],
    ]);
  }
}
