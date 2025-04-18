/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

// eslint-disable-next-line max-classes-per-file
import { MonoTypeOperatorFunction, Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Takes values while lifetime is alive.
 * Will complete once lifetime is disposed.
 *
 * Notice, it behaves like `takeUntil` operator.
 */
export function takeWhileAlive<T>(lifespan: Lifespan): MonoTypeOperatorFunction<T> {
  return takeUntil<T>(lifespan.onDispose$);
}

export interface Lifespan {
  readonly onDispose$: Observable<void>;

  readonly isAlive: boolean;
  readonly isDead: boolean;

  /**
   * Register callbacks to invoke on lifetime disposal.
   */
  registerCallbacks(...callbacks: Array<() => void>): void;
}

// Notice, it's important that this one does not keep references to things subscribing to it.
// Otherwise there will be memory leaks, as Eternal lifetime is a singleton.
class EternalLifetime implements Lifespan {
  readonly onDispose$ = new Observable<never>((_subscriber) => {});

  readonly isAlive = true;
  readonly isDead = false;
  registerCallbacks(..._callbacks: Array<() => void>): void {}
}

/**
 * Utility to track lifetime and perform clean up actions on disposal.
 */
export class Lifetime implements Lifespan {
  /**
   * Lifetime which never disposes and is always alive
   */
  static readonly Eternal: Lifespan = new EternalLifetime();

  private _isAlive = true;
  private readonly _onDispose$ = new ReplaySubject<void>(1);
  readonly onDispose$ = this._onDispose$.asObservable();

  dispose(): void {
    this._onDispose$.next(undefined);
    this._onDispose$.complete();
    this._isAlive = false;
  }

  get isAlive(): boolean {
    return this._isAlive;
  }

  get isDead(): boolean {
    return !this.isAlive;
  }

  /**
   * Register callbacks to invoke on lifetime disposal.
   */
  registerCallbacks(...callbacks: Array<() => void>) {
    for (const callback of callbacks) {
      this._onDispose$.subscribe(() => callback());
    }
  }
}
