/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

type AsyncEventHandler<TArg> = TArg extends void ? () => Promise<void> : (arg: TArg) => Promise<void>;

export interface AsyncEventSource<TArg = void> {
  on(handler: AsyncEventHandler<TArg>): void;
}

export class AsyncEventEmitter<TArg = void> implements AsyncEventSource<TArg> {
  private handlers: AsyncEventHandler<TArg>[] = [];

  on(handler: AsyncEventHandler<TArg>): void {
    this.handlers.push(handler);
  }

  async emit(arg: TArg): Promise<void> {
    for (const handler of this.handlers) {
      await handler(arg);
    }
  }

  subscribe(source: AsyncEventSource<TArg>) {
    (source as AsyncEventSource<any>).on((arg: TArg) => this.emit(arg));
  }

  /**
   * Makes current AsyncEventEmitter truly subscribe-only.
   */
  asSource(): AsyncEventSource<TArg> {
    return {
      on: (handler) => this.on(handler),
    };
  }
}
