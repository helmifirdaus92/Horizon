/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { createSpyObserver } from 'app/testing/test.utils';
import { Observable, Subject, Subscriber } from 'rxjs';
import { bufferWait } from './bufferWait';

describe('bufferWait', () => {
  let source: Subject<string>;
  let sut: Observable<string[]>;
  let wait: Subject<boolean>;

  beforeEach(() => {
    wait = new Subject();
    source = new Subject();
    sut = source.pipe(bufferWait(wait));
  });

  afterEach(() => {
    source.complete();
    wait.complete();
  });

  describe('WHEN wait is false', () => {
    it('should emit items in a buffer', () => {
      const spy = jasmine.createSpy();
      sut.subscribe(spy);

      wait.next(false);
      source.next('foo');
      source.next('foo2');

      expect(spy).toHaveBeenCalledWith(['foo']);
      expect(spy).toHaveBeenCalledWith(['foo2']);
      expect(spy).toHaveBeenCalledTimes(2);
    });

    // same test as before but without explicitly setting wait to false.
    it('wait should be false by default', () => {
      const spy = jasmine.createSpy();
      sut.subscribe(spy);

      source.next('foo');

      expect(spy).toHaveBeenCalledWith(['foo']);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    describe('AND queue completes', () => {
      it('should emit complete', () => {
        const spy = jasmine.createSpy();
        sut.subscribe({ complete: spy });

        source.next('change');
        source.complete();

        // assert
        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    describe('AND queue errors', () => {
      it('should emit error', () => {
        const spy = jasmine.createSpy();
        sut.subscribe({ error: spy });

        source.next('change');
        source.error('error');

        // assert
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith('error');
      });
    });
  });

  describe('WHEN wait is true', () => {
    it('should emit pending values in a buffer when wait becomes false', () => {
      const spy = jasmine.createSpy();
      sut.subscribe(spy);

      wait.next(true);
      source.next('foo');
      source.next('foo2');

      expect(spy).not.toHaveBeenCalled();

      wait.next(false);
      expect(spy).toHaveBeenCalledWith(['foo', 'foo2']);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should not emit if there are no pending to emit', () => {
      const spy = jasmine.createSpy();
      sut.subscribe(spy);

      wait.next(true);
      wait.next(false);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should emit values emited after wait becomes false', () => {
      const spy = jasmine.createSpy();
      sut.subscribe(spy);

      wait.next(true);
      wait.next(false);
      source.next('foo');

      expect(spy).toHaveBeenCalledWith(['foo']);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('WHEN queue completes', () => {
    it('should NOT emit any pending changes before complete', () => {
      const spy = createSpyObserver();
      sut.subscribe(spy);

      wait.next(true);
      source.next('change');
      source.complete();

      // assert
      expect(spy.next).not.toHaveBeenCalled();
    });
  });

  describe('WHEN queue errors', () => {
    it('should NOT emit any pending changes before error', () => {
      const spy = createSpyObserver();
      sut.subscribe(spy);

      wait.next(true);
      source.next('change');
      source.error('error');

      // assert
      expect(spy.next).not.toHaveBeenCalled();
    });
  });

  describe('WHEN sut is unsubscribed from', () => {
    it('should not leak the subscription to wait', () => {
      const unsubscribe = jasmine.createSpy();
      const wait2 = new Observable<boolean>((_subscriber) => unsubscribe);

      source = new Subject();
      sut = source.pipe(bufferWait(wait2));

      const subscription = sut.subscribe();

      source.next('foo');
      subscription.unsubscribe();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('should not leak the subscription to source', () => {
      const unsubscribe = jasmine.createSpy();
      let subscriber: Subscriber<string>;

      const source2 = new Observable<string>((s) => {
        subscriber = s;
        return unsubscribe;
      });

      sut = source2.pipe(bufferWait(wait));

      const subscription = sut.subscribe();

      subscriber!.next('foo');
      subscription.unsubscribe();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
