/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export class CancelEventArgs<TArg> {
  private canceled = false;

  constructor(public data: TArg) {}

  cancel() {
    this.canceled = true;
  }

  isCanceled(): boolean {
    return this.canceled;
  }
}
