/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { createSpyObserver } from 'app/testing/test.utils';
import { Subject } from 'rxjs';
import { Lifetime, takeWhileAlive } from './lifetime';

describe(Lifetime.name, () => {
  let lifetime: Lifetime;

  beforeEach(() => {
    lifetime = new Lifetime();
  });

  describe(Lifetime.name, () => {
    it('should emit onDispose$ after calling dispose()', () => {
      const observer = createSpyObserver();
      lifetime.onDispose$.subscribe(observer);

      lifetime.dispose();

      expect(observer.next).toHaveBeenCalled();
      expect(observer.complete).toHaveBeenCalled();
    });

    it('should reflect valid isAlive property', () => {
      expect(lifetime.isAlive).toBe(true);

      lifetime.dispose();

      expect(lifetime.isAlive).toBe(false);
    });

    it('should execute registered callbacks on dispose', () => {
      const callbackFn1 = jasmine.createSpy();
      const callbackFn2 = jasmine.createSpy();
      lifetime.registerCallbacks(callbackFn1, callbackFn2);

      lifetime.dispose();

      expect(callbackFn1).toHaveBeenCalled();
      expect(callbackFn2).toHaveBeenCalled();
    });
  });

  describe(takeWhileAlive.name, () => {
    it('should pass events only util lifetime is alive', () => {
      const emitter$ = new Subject<void>();
      const observer = createSpyObserver();
      emitter$.pipe(takeWhileAlive(lifetime)).subscribe(observer);

      emitter$.next(undefined);
      lifetime.dispose();
      emitter$.next(undefined);

      expect(observer.next).toHaveBeenCalledTimes(1);
    });

    it('should not pass events when at the moment of subscription lifetime is not alive', () => {
      const emitter$ = new Subject<void>();
      const observer = createSpyObserver();

      lifetime.dispose();
      emitter$.pipe(takeWhileAlive(lifetime)).subscribe(observer);

      emitter$.next(undefined);
      expect(observer.next).not.toHaveBeenCalled();
    });
  });
});
