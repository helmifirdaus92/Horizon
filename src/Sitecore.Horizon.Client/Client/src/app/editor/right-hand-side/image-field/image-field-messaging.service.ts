/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { MessagingP2PChannel, MessagingP2PChannelDefFromChannel } from '@sitecore/horizon-messaging';
import { parseMediaRawValue } from 'app/shared/platform-media/media.utils';
import { Lifetime } from 'app/shared/utils/lifetime';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { Observable, ReplaySubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { RhsEditorMessaging } from '../rhs-editor-messaging';

export interface CanvasImageValue {
  rawValue: string;
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export type CanvasChannel = MessagingP2PChannel<
  // Inbound events
  {
    'value:change': CanvasImageValue | null;
  },
  // Outbound events
  {},
  // Remote RPC services
  {
    getValue(): CanvasImageValue | null;
    setValue(value: CanvasImageValue): void;
    clearValue(): void;
  },
  // Provided RPC services
  {}
>;

export const CanvasChannelDef: MessagingP2PChannelDefFromChannel<CanvasChannel> = {
  name: 'general',
};

export interface MediaValue {
  rawValue: string;
  src?: string;
  mediaId?: string;
  alt?: string;
  width?: number;
  height?: number;
  embeddedHtml?: string;
  isDam?: boolean;
  damExtraProperties?: Array<{ name: string; value: string }>;
}

export function isSameValue(oldValue: MediaValue | null, newValue: MediaValue | null): boolean {
  if (!oldValue && !newValue) {
    return true;
  }

  if (!oldValue || !newValue) {
    return false;
  }

  return oldValue.rawValue === newValue.rawValue;
}

@Injectable()
export class ImageFieldMessagingService {
  private readonly _currentValue$ = new ReplaySubject<MediaValue | null>(1);

  readonly currentValue$: Observable<MediaValue | null> = this._currentValue$.pipe(
    distinctUntilChanged((oldValue, newValue) => isSameValue(oldValue, newValue)),
    shareReplayLatest(),
  );

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

  set(value: MediaValue): Promise<void> {
    /*
      We don't need to update the value internally because canvas re-emits the new value through messaging.
    */
    return this.messaging.rpc.setValue({
      rawValue: value.rawValue,
      src: value.src || undefined,
      alt: value.alt,
      height: value.height,
      width: value.width,
    });
  }

  clear(): Promise<void> {
    return this.messaging.rpc.clearValue();
  }

  private pushCurrentValue(value: CanvasImageValue | null): void {
    let mediaId: string | undefined;
    if (value?.rawValue) {
      mediaId = parseMediaRawValue(value.rawValue).mediaId;
    }

    this._currentValue$.next(value ? { ...value, mediaId } : null);
  }
}
