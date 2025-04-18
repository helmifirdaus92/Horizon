/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ErrorResponse } from './page/page.types';

export function handleError(error: HttpErrorResponse): Observable<never> {
  return extractErrorCode(error.error || error);
}

export function extractErrorCode(error: ErrorResponse): Observable<never> {
  const errorCode: string = error.detail || 'UnknownError';
  return throwError(() => errorCode);
}
