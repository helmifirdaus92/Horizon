/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

type EventHandler<TArg> = TArg extends void ? () => void : (arg: TArg) => void;

export interface EventSource<TArg = void> {
  on(handler: EventHandler<TArg>): void;
}

export class EventEmitter<TArg = void> implements EventSource<TArg> {
  private handlers: EventHandler<TArg>[] = [];

  on(handler: EventHandler<TArg>): void {
    this.handlers.push(handler);
  }

  emit(arg: TArg): void {
    this.handlers.forEach((h) => h(arg));
  }

  subscribe(source: EventSource<TArg>) {
    (source as EventSource<any>).on((arg: TArg) => this.emit(arg));
  }

  /**
   * Makes current EventEmitter truly subscribe-only.
   */
  asSource(): EventSource<TArg> {
    return {
      on: (handler) => this.on(handler),
    };
  }
}
