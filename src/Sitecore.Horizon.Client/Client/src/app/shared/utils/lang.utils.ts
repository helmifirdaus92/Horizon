/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Observable } from 'rxjs';

export type Writable<T> = {
  -readonly [K in keyof T]: T[K];
};

export type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]>;
};

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

/**
 * Extract public members from the type.
 * Useful for test doubles.
 *
 * Example:
 *
 * ```ts
 * class TestDouble implements Interface<ClassWithPrivateMembers> {}
 * ```
 */
export type Interface<T> = {
  [K in keyof T]: T[K];
};

/**
 * Extracts observable argument type
 */
export type ObservableType<T> = T extends Observable<infer TArg> ? TArg : never;
