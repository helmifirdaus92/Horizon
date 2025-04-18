/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { createSpyObserver } from 'app/testing/test.utils';
import { NEVER, Observable, of, Subject, throwError } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { replayWhen } from './rxjs-custom';

function lastCallValue(spy: jasmine.Spy) {
  return spy.calls.mostRecent().args[0];
}

describe('replayWhen', () => {
  it('should emit as usual', () => {
    const source = of(1, 2, 3);
    const spy = createSpyObserver();
    const stream = source.pipe(replayWhen(() => new Observable()));

    stream.subscribe(spy);

    expect(spy.next).toHaveBeenCalledTimes(3);
    expect(spy.next).toHaveBeenCalledWith(1);
    expect(spy.next).toHaveBeenCalledWith(2);
    expect(spy.next).toHaveBeenCalledWith(3);
  });

  it('should complete "as usual"', () => {
    const source = of(1, 2, 3);
    const spy = createSpyObserver();
    const stream = source.pipe(replayWhen(() => new Observable()));

    stream.subscribe(spy);

    expect(spy.complete).toHaveBeenCalled();
  });

  it('should complete when the source completes without emitting', () => {
    const source = new Subject();
    const spy = createSpyObserver();
    const stream = source.pipe(replayWhen(() => new Observable()));

    stream.subscribe(spy);
    source.complete();

    expect(spy.complete).toHaveBeenCalled();
  });

  it('should error as usual', () => {
    const error = new Error('custom test error');
    const source = throwError(() => error);
    const spy = createSpyObserver();
    const stream = source.pipe(replayWhen(() => new Observable()));

    stream.subscribe(spy);

    expect(spy.error).toHaveBeenCalledWith(error);
  });

  it('should replay when the given notifier emits a value', () => {
    const source = new Subject();
    const trigger = new Subject();
    const spy = jasmine.createSpy('spy');
    const stream = source.pipe(replayWhen(() => trigger));

    stream.subscribe(spy);

    source.next(1);
    trigger.next(undefined);
    let count = 2;

    expect(lastCallValue(spy)).toBe(1);
    expect(spy).toHaveBeenCalledTimes(count);

    source.next(2);
    count++;
    expect(spy).toHaveBeenCalledWith(2);
    expect(spy).toHaveBeenCalledTimes(count);

    trigger.next(undefined);
    count++;
    expect(lastCallValue(spy)).toBe(2);
    expect(spy).toHaveBeenCalledTimes(count);

    source.next(3);
    source.next(4);
    count = count + 2;
    expect(spy).toHaveBeenCalledWith(3);
    expect(spy).toHaveBeenCalledWith(4);
    expect(spy).toHaveBeenCalledTimes(count);

    trigger.next(undefined);
    count++;
    expect(lastCallValue(spy)).toBe(4);
    expect(spy).toHaveBeenCalledTimes(count);
  });

  it('should continue emitting source if notifier throws an error', () => {
    const source = new Subject();
    const trigger = new Subject();
    const spy = createSpyObserver();
    const stream = source.pipe(replayWhen(() => trigger));

    stream.subscribe(spy);

    source.next(1);
    trigger.error('foo');
    source.next(2);

    expect(spy.next).toHaveBeenCalledTimes(2);
    expect(spy.next).toHaveBeenCalledWith(2);
    expect(spy.complete).not.toHaveBeenCalled();
    expect(spy.error).not.toHaveBeenCalled();
  });

  it('should continue emitting source if notifier completes', () => {
    const source = new Subject();
    const trigger = new Subject();
    const spy = createSpyObserver();
    const stream = source.pipe(replayWhen(() => trigger));

    stream.subscribe(spy);

    source.next(1);
    trigger.complete();
    source.next(2);

    expect(spy.next).toHaveBeenCalledTimes(2);
    expect(spy.next).toHaveBeenCalledWith(2);
    expect(spy.complete).not.toHaveBeenCalled();
  });

  it('should correctly repeat when using input value', () => {
    const source = of(1, 2, 3);
    const spy = createSpyObserver();
    const stream = source.pipe(replayWhen((value) => (value < 3 ? of(undefined) : NEVER)));

    stream.pipe(toArray()).subscribe(spy);

    expect(spy.next).toHaveBeenCalledWith([1, 1, 2, 2, 3]);
  });

  it('should not invoke notifier function in case of error', () => {
    const error = new Error('custom error');
    const source = throwError(() => error);
    const notifierSpy = jasmine.createSpy();
    const stream = source.pipe(replayWhen(notifierSpy));

    stream.subscribe({ error: () => {} });

    expect(notifierSpy).not.toHaveBeenCalled();
  });
});
