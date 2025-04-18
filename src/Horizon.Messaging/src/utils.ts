/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export type Fn = (...args: any[]) => any;

export function removeFromArray<T>(element: T, array: T[]): void {
  const index = array.indexOf(element);
  if (index > -1) {
    array.splice(index, 1);
  }
}

export type Writable<T> = { -readonly [K in keyof T]: T[K] };

export type StringKeys<T> = keyof T & string;

/**
 * Returns a promise which is resolved on next macro-task execution.
 * Useful to ensure that all micro- and macro-tasks queued before have been already executed.
 */
export function nextTick(): Promise<void> {
  // We queue 2 consequent timeouts instead of one to let next macro-task fully execute.
  // There reason is that it has been discovered that sometimes MessageChannel queued messages are not being immediately
  // delivered to the micro-task queue. Because of that they were not executed immediately and executed on next
  // macro-tasks.
  // Now we skip that macro-task and execute on macro-task after that.
  // Looks like it's enough to reliably tell that all queued messages are delivered by that time.

  return new Promise((resolve) => setTimeout(() => setTimeout(resolve)));
}
