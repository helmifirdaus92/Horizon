/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { combineLatest, MonoTypeOperatorFunction, NEVER, Observable, of } from 'rxjs';
import {
  catchError,
  dematerialize,
  first,
  mapTo,
  materialize,
  shareReplay,
  startWith,
  switchMap,
} from 'rxjs/operators';

/**
 * Re-emit the most recent value from the source observable when the `notifier` emits.
 */
export function replayWhen<T>(notifier: (value: T) => Observable<any>): MonoTypeOperatorFunction<T> {
  return (source: Observable<T>) =>
    source.pipe(
      materialize(),
      switchMap((value) =>
        (value.value ? notifier(value.value!) : NEVER).pipe(
          // Source should continue emitting if notifier has errors.
          catchError(() => NEVER),
          // Don't wait for notifier to emit. Current value should go through asap.
          startWith(undefined),
          mapTo(value),
          dematerialize(),
        ),
      ),
    );
}

export type MaybeObservable<T> = T | Observable<T>;

type UnwrapMaybeObservable<T> = {
  [K in keyof T]: T[K] extends MaybeObservable<infer TValue> ? TValue : never;
};

export function resolveMaybeObservables<TArgs extends Array<MaybeObservable<any>>>(
  ...args: TArgs
): Observable<UnwrapMaybeObservable<TArgs>> {
  const args$ = args.map((arg) => {
    if (arg instanceof Observable) {
      return arg;
    } else {
      return of(arg);
    }
  });

  return combineLatest(args$).pipe(first()) as Observable<any>;
}

export function asObservable<T>(value: MaybeObservable<T>): Observable<T> {
  return value instanceof Observable ? value : of(value);
}

/**
 * Alias for `shareReplay({ bufferSize: 1, refCount })`
 */
export function shareReplayLatest<T>(refCount = true): MonoTypeOperatorFunction<T> {
  return shareReplay({ bufferSize: 1, refCount });
}
