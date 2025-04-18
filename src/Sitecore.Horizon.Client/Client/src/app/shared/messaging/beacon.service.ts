/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ContextService } from '../client-state/context.service';
import { RenderingHostService } from '../rendering-host/rendering-host.service';
import { BeaconState } from './horizon-canvas.contract.parts';
import { MessagingService } from './messaging.service';

@Injectable({ providedIn: 'root' })
export class BeaconService {
  private readonly _beaconMessages$ = new Subject<BeaconState>();
  readonly beaconMessages$ = this._beaconMessages$.asObservable();

  constructor(
    private readonly _messagingService: MessagingService,
    private readonly _context: ContextService,
    private readonly _renderingHostService: RenderingHostService,
  ) {}

  init() {
    const beaconChannel = this._messagingService.getBeaconCanvasChannel();
    beaconChannel.on('state', async (msg: BeaconState) => {
      this._beaconMessages$.next(msg);

      await this.synchronizeContextWithBeacon(msg);
    });
  }

  private async synchronizeContextWithBeacon(beaconState: BeaconState) {
    // When canvas uses rendering host directly, it doesn't have information about current variant.
    // Keep existing variant when update a context from the beacon message.
    if (await this._renderingHostService.isDirectIntegrationEnabled()) {
      beaconState = { ...beaconState, variant: this._context.variant };
    }

    this._context.updateContext(beaconState, { eventSource: 'CANVAS_BEACON' });
  }
}
