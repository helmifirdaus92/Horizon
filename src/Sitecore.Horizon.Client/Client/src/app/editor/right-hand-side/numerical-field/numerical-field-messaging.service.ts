/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { MessagingP2PChannel, MessagingP2PChannelDefFromChannel } from '@sitecore/horizon-messaging';
import { Lifetime } from 'app/shared/utils/lifetime';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { RhsEditorMessaging } from '../rhs-editor-messaging';

export interface FieldRawValue {
  readonly rawValue: string;
}

export type CanvasChannel = MessagingP2PChannel<
  // Inbound events
  {
    'value:change': string | null;
  },
  // Outbound events
  {},
  // Remote RPC services
  {
    getValue(): string | null;
    setValue(value: string): void;
  },
  // Provided RPC services
  {}
>;

export function isSameValue(oldValue: string | null, newValue: string | null): boolean {
  if (!oldValue && !newValue) {
    return true;
  }

  if (!oldValue || !newValue) {
    return false;
  }

  return oldValue === newValue;
}

export const CanvasChannelDef: MessagingP2PChannelDefFromChannel<CanvasChannel> = {
  name: 'general',
};

@Injectable()
export class NumericalFieldMessagingService {
  private readonly _currentValue$ = new ReplaySubject<string | null>(1);

  readonly currentValue$: Observable<string | null> = this._currentValue$.pipe(
    distinctUntilChanged((oldValue, newValue) => isSameValue(oldValue, newValue)),
    shareReplayLatest(),
  );

  private readonly lifetime = new Lifetime();
  private messaging!: CanvasChannel;

  init(rhsMessaging: RhsEditorMessaging) {
    this.messaging = rhsMessaging.getChannel(CanvasChannelDef);

    rhsMessaging.onReconnect(async () => {
      this.pushCurrentValue(await this.messaging.rpc.getValue());
    }, this.lifetime);

    this.lifetime.registerCallbacks(this.messaging.on('value:change', (value) => this.pushCurrentValue(value)));
  }

  destroy() {
    this.lifetime.dispose();
  }

  set(value: string): Promise<void> {
    /*
      We don't need to update the value internally because canvas re-emits the new value through messaging.
    */
    return this.messaging.rpc.setValue(value);
  }

  private pushCurrentValue(value: string | null): void {
    this._currentValue$.next(value ?? null);
  }
}
