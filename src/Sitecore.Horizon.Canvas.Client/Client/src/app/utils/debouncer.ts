/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export class Debouncer<T> {
  private pending: { timer: string | number | NodeJS.Timeout | undefined; value: T } | undefined;

  constructor(
    private readonly saveHandler: (value: T) => void,
    private readonly timeoutMs: number,
  ) {}

  putValue(value: T, debounce: boolean): void {
    // Clear previous debounce timer, as we are going to either setup new, or just save the value immediately.
    this.clearPending();

    if (!debounce) {
      this.saveHandler(value);
      return;
    }

    const timer = setTimeout(() => this.flush(), this.timeoutMs);
    this.pending = { value, timer };
  }

  flush(): void {
    if (!this.pending) {
      return;
    }

    clearTimeout(this.pending.timer);
    this.saveHandler(this.pending.value);

    this.pending = undefined;
  }

  private clearPending(): void {
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending = undefined;
    }
  }
}
