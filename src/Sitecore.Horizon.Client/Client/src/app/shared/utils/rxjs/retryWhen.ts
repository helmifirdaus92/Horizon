/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { MonoTypeOperatorFunction, Observable, Subject, Subscription } from 'rxjs';
import { map, startWith, switchMap, take } from 'rxjs/operators';
import { runInNextMicrotask } from '../utils';

/**
 * Resubscribe to the source observable when the retryNotifier emits a value.
 * Complete the stream when the retryNotifier completes without emitting a value.
 *
 * @param retryNotifier a function which is called every time source emits a value.
 * The returned observable will trigger a retry when it emits or complete the stream.
 */
export function retryWhen<T>(retryNotifier: (value: T, count: number) => Observable<any>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) => retryWhenObservable(source, retryNotifier);
}

export function retryWhenObservable<T>(
  source: Observable<T>,
  retryNotifier: (value: T, count: number) => Observable<any>,
): Observable<T> {
  const retry = new Subject();
  let retrySubscription: Subscription | undefined;

  function clearPendingSubscription() {
    return retrySubscription && retrySubscription.unsubscribe();
  }

  function interceptValue(value: T, tryCount: number) {
    clearPendingSubscription();
    let anyValuesEmitted = false;

    retrySubscription = retryNotifier(value, tryCount)
      .pipe(take(1))
      .subscribe({
        next: () => (anyValuesEmitted = true) && retry.next(undefined),
        // Complete stream on next tick to ensure the current value has emitted first.
        complete: runInNextMicrotask(() => (anyValuesEmitted ? null : retry.complete())),
      });
  }

  return _retryWhen(source, retry).pipe(
    // Using `map` instead of `tap` because it includes the index, but the value is not modified.
    map((value, index) => {
      interceptValue(value, index + 1);
      return value;
    }),
  );
}

function _retryWhen<T>(source: Observable<T>, retryNotifier: Observable<any>): Observable<T> {
  return retryNotifier.pipe(
    startWith(true),
    switchMap(() => source),
  );
}
