/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';

@Injectable({ providedIn: 'root' })
export class LoggingService {
  private isDev = !environment.production;

  info(...args: any[]) {
    if (this.isDev) {
      console.log(...args);
    }
  }

  warn(...args: any[]) {
    console.warn(...args);
  }

  error(...args: any[]) {
    console.error(...args);
  }
}
