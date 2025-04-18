/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, tick } from '@angular/core/testing';
import { createSpyObserver } from 'app/testing/test.utils';
import { BehaviorSubject, EMPTY, Observable, Subject, Subscriber, interval, of } from 'rxjs';
import { retryWhen } from './retryWhen';

describe('retryWhen', () => {
  it('should mirror the source emissions', () => {
    const value = 'a';
    const source = of(value);
    const spy = jasmine.createSpy();

    source.pipe(retryWhen(() => new Observable())).subscribe(spy);

    expect(spy).toHaveBeenCalledWith(value);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should mirror the source errors', () => {
    const errorValue = 'b';
    const source = new Subject();
    const spy = createSpyObserver();

    source.pipe(retryWhen(() => new Observable())).subscribe(spy);
    expect(spy.next).not.toHaveBeenCalled();

    source.error(errorValue);
    expect(spy.next).not.toHaveBeenCalled();
    expect(spy.error).toHaveBeenCalledWith(errorValue);
    expect(spy.error).toHaveBeenCalledTimes(1);
  });

  it('should NOT mirror the source completion', () => {
    const source = new Subject();
    const spy = createSpyObserver();

    source.pipe(retryWhen(() => new Observable())).subscribe(spy);

    source.complete();
    expect(spy.next).not.toHaveBeenCalled();
    expect(spy.error).not.toHaveBeenCalled();
    expect(spy.complete).not.toHaveBeenCalled();
  });

  it('should not subscribe to source until the stream is subscribed to', () => {
    const subscribe = jasmine.createSpy('subscribe');
    const source = new Observable(subscribe);

    const sut = source.pipe(retryWhen(() => new Observable()));

    expect(subscribe).not.toHaveBeenCalled();
    sut.subscribe();
    expect(subscribe).toHaveBeenCalledTimes(1);
  });

  it('should call the supplied retryNotifier function when source emits a value including the emitted value and the number tries', () => {
    const myNotifier = jasmine.createSpy().and.returnValue(new Observable());
    const source = new Subject();

    source.pipe(retryWhen(myNotifier)).subscribe();

    expect(myNotifier).not.toHaveBeenCalled();
    source.next('a');
    expect(myNotifier).toHaveBeenCalledWith('a', 1);
    source.complete();
    expect(myNotifier).toHaveBeenCalledTimes(1);
  });

  it('should retry when retryNotifiers result emits for the 1st time', fakeAsync(() => {
    let count = 1;
    const subscribe = jasmine
      .createSpy('subscribe')
      .and.callFake((subscriber: Subscriber<any>) => subscriber.next('value: ' + count++));
    const source = new Observable(subscribe);

    const spy = jasmine.createSpy();
    const myNotifier = jasmine
      .createSpy('notifier')
      .and.callFake((_value, times: number) => (times === 1 ? interval(1000) : new Observable()));

    source.pipe(retryWhen(myNotifier)).subscribe(spy);

    expect(spy).toHaveBeenCalledWith('value: 1');
    expect(subscribe).toHaveBeenCalledTimes(1);
    expect(myNotifier).toHaveBeenCalledWith('value: 1', 1);

    tick(1000);

    expect(spy).toHaveBeenCalledWith('value: 2');
    expect(subscribe).toHaveBeenCalledTimes(2);
    expect(myNotifier).toHaveBeenCalledWith('value: 2', 2);

    tick(1000);

    expect(spy).toHaveBeenCalledWith('value: 2');
    expect(subscribe).toHaveBeenCalledTimes(2);
    flush();
  }));

  it('should complete when retryNotifiers result completes without emitting a value', fakeAsync(() => {
    const source = of('a');
    const spy = createSpyObserver();

    source.pipe(retryWhen(() => EMPTY)).subscribe(spy);
    tick();

    expect(spy.next).toHaveBeenCalledWith('a');
    expect(spy.complete).toHaveBeenCalled();
    flush();
  }));

  it('should NOT complete when retryNotifiers result emits a value and then completes', () => {
    const source = of('a');
    const spy = createSpyObserver();

    source.pipe(retryWhen(() => of(true))).subscribe(spy);

    expect(spy.next).toHaveBeenCalledWith('a');
    expect(spy.complete).not.toHaveBeenCalled();
  });

  describe('WHEN retryNotifier is pending AND source emits another value', () => {
    it('should make the pending retryNotifier obsolete (unsubscribe)', () => {
      const source$ = new BehaviorSubject('a');

      let notifierSubscriptionsCount = 0;
      const notifier$ = new Observable((_subscriber) => {
        notifierSubscriptionsCount++;

        return () => {
          notifierSubscriptionsCount--;
        };
      });

      source$.pipe(retryWhen(() => notifier$)).subscribe(createSpyObserver());
      source$.next('b');

      expect(notifierSubscriptionsCount).toBe(1, 'value should be 1, as it subscribed 2 times and unsubscribed once.');
    });
  });

  it('should have no pending subscriptions on complete', () => {
    let sourceSubscriptionsCount = 0;
    const source$ = new Observable((subscriber) => {
      sourceSubscriptionsCount++;
      subscriber.next('a');
      subscriber.complete();

      return () => {
        sourceSubscriptionsCount--;
      };
    });

    let notifierSubscriptionsCount = 0;
    const notifier$ = new Observable((subscriber) => {
      notifierSubscriptionsCount++;
      subscriber.next(true);
      subscriber.complete();

      return () => {
        notifierSubscriptionsCount--;
      };
    });

    source$.pipe(retryWhen(() => notifier$)).subscribe(createSpyObserver());
    expect(sourceSubscriptionsCount).toBe(0);
    expect(notifierSubscriptionsCount).toBe(0);
  });
});
