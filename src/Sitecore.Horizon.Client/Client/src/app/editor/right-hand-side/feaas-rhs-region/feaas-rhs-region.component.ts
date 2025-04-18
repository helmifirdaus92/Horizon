/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { RenderingPropertiesSdkMessagingService } from 'app/editor/right-hand-side/rendering-details/rendering-properties.sdk-messaging.service';
import { ChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-feaas-rhs-region',
  templateUrl: './feaas-rhs-region.component.html',
  styleUrls: ['./feaas-rhs-region.component.scss'],
})
export class FeaasRhsRegionComponent {
  public extensions: Array<{ uid: string }> = [];

  @Input()
  public chrome: ChromeInfo | undefined = undefined;

  messagingStatus$: Observable<'connected' | 'disconnected'>;

  constructor(private readonly renderingMessaging: RenderingPropertiesSdkMessagingService) {
    this.messagingStatus$ = this.renderingMessaging.messagingStatus$;
  }
}
