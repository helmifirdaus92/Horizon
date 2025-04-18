/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Observable, OperatorFunction } from 'rxjs';

/**
 * Similar to the `buffer` operator but with the following differences:
 * - You can control the emission of "buffers" by emitting true/false in the supplied wait
 * - It emits the pending values when wait emits false
 * - If wait last emitted false and source emits, then a new buffer with that new value is emitted immediately
 * - It filters out empty buffers
 * - Wait is false by default
 */
export function bufferWait<T>(waitNotifier: Observable<boolean>): OperatorFunction<T, T[]> {
  return (source: Observable<T>) => {
    return new Observable((obs) => {
      let buffer: T[] = [];
      let wait = false;

      const onWaitChanges = (value: boolean) => {
        wait = value;
        notifyNext();
      };

      const notifyNext = () => {
        const _buffer = buffer;
        if (wait || _buffer.length === 0) {
          return;
        }

        // Make sure to reset buffer before emitting, as emitting can feedback to `notifyNext`.
        buffer = [];
        obs.next(_buffer);
      };

      const subscription = source.subscribe({
        next: (val) => {
          buffer.push(val);
          notifyNext();
        },
        error: (err) => {
          obs.error(err);
        },
        complete: () => {
          obs.complete();
        },
      });

      subscription.add(waitNotifier.subscribe(onWaitChanges));

      return () => subscription.unsubscribe();
    });
  };
}
