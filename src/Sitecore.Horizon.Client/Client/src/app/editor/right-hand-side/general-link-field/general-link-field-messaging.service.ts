/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { MessagingP2PChannel, MessagingP2PChannelDefFromChannel } from '@sitecore/horizon-messaging';
import { Lifetime } from 'app/shared/utils/lifetime';
import { Observable, ReplaySubject } from 'rxjs';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { GeneralLinkValue } from './general-link.type';

export type CanvasChannel = MessagingP2PChannel<
  // Inbound events
  {
    'value:change': GeneralLinkValue | null;
  },
  // Outbound events
  {},
  // Remote RPC services
  {
    getValue(): GeneralLinkValue | null;
    setValue(value: GeneralLinkValue | null): void;
  },
  // Provided RPC services
  {}
>;

export const CanvasChannelDef: MessagingP2PChannelDefFromChannel<CanvasChannel> = {
  name: 'general',
};

@Injectable()
export class GeneralLinkFieldMessagingService {
  private readonly _currentValue$ = new ReplaySubject<GeneralLinkValue | null>(1);

  get currentValue$(): Observable<GeneralLinkValue | null> {
    return this._currentValue$.asObservable();
  }

  private lifetime!: Lifetime;
  private messaging!: CanvasChannel;

  init(rhsMessaging: RhsEditorMessaging) {
    this.lifetime = new Lifetime();
    this.messaging = rhsMessaging.getChannel(CanvasChannelDef);

    rhsMessaging.onReconnect(async () => {
      this.pushCurrentValue(await this.messaging.rpc.getValue());
    }, this.lifetime);

    this.lifetime.registerCallbacks(this.messaging.on('value:change', (value) => this.pushCurrentValue(value)));
  }

  destroy() {
    this.lifetime.dispose();
  }

  set(value: GeneralLinkValue | null): Promise<void> {
    /*
      We don't need to update the value internally because canvas re-emits the new value through messaging.
    */
    return this.messaging.rpc.setValue(value);
  }

  private pushCurrentValue(value: GeneralLinkValue | null): void {
    this._currentValue$.next(value);
  }
}
