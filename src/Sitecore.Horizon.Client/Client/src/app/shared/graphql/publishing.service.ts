/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, NgZone } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { retryWhen } from '../utils/rxjs/retryWhen';
import { runOutsideAngular, wrapInZone } from '../utils/utils';
import { BasePublishingDalService } from './publishing.dal.service';
import { PublishingStatus, PublishItemInput, PublishItemOutput } from './publishing.interfaces';

/**
 * Makes observable to push notifications inside the specified zone.
 */
function wrapObservableInZone<T>(ngZone: NgZone, observable: Observable<T>): Observable<T> {
  return new Observable((subscriber) =>
    observable.subscribe({
      next: wrapInZone(ngZone, (value) => subscriber.next(value)),
      complete: wrapInZone(ngZone, () => subscriber.complete()),
      error: wrapInZone(ngZone, (err) => subscriber.error(err)),
    }),
  );
}

@Injectable({ providedIn: 'root' })
export class PublishingService {
  constructor(
    private readonly publishingDalService: BasePublishingDalService,
    private readonly ngZone: NgZone,
  ) {}

  publishItem(publishInput: PublishItemInput): Observable<PublishItemOutput> {
    return this.publishingDalService.publishItem(publishInput);
  }

  /**
   * Query the publishing status for the given `handle` and return the result as an Observable.
   * Use `watchPublishingStatus` instead in order to monitor the progress.
   */
  getPublishingStatus(operationId: string): Observable<PublishingStatus> {
    return this.publishingDalService.getPublishingStatus(operationId);
  }

  /**
   * Returns an Observable that will repeatedly emit the publishing status for the given `handle`.
   */
  watchPublishingStatus(operationId: string): Observable<PublishingStatus> {
    const result$ = this.getPublishingStatus(operationId).pipe(
      retryWhen(({ isDone, isFailed }, count) => {
        const notifier$ = !isDone && !isFailed ? of(true).pipe(delay(count < 10 ? 1000 : 5000)) : EMPTY;

        // Delay timer is initiated at the moment of subscription. Therefore, call subscribe function outside of zone.
        // That is to make Angular Testability see zone as stable while we are polling next publishing status.
        return new Observable(runOutsideAngular(this.ngZone, (subscriber) => notifier$.subscribe(subscriber)));
      }),
    );

    return wrapObservableInZone(this.ngZone, result$);
  }
}
