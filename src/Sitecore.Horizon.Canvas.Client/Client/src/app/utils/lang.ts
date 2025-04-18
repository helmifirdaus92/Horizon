/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export type Writable<TClass, TKeys extends keyof TClass> = {
  -readonly [Key in TKeys]: TClass[Key];
};

export type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
};

/**
 * Unsafe type util to make some object properties writable.
 */
export function asWritable<TClass, TKey extends keyof TClass>(obj: TClass, _key: TKey): Writable<TClass, TKey> {
  return obj as Writable<TClass, TKey>;
}

/**
 * Make specified properties optional in the type
 */
export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export function keyOf<T>(key: Extract<keyof T, string>): string {
  return key;
}

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
