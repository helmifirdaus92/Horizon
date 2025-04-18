/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FieldChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { EMPTY, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { GeneralLinkFieldMessagingService } from './general-link-field-messaging.service';
import { GeneralLinkValue } from './general-link.type';

@Component({
  selector: 'app-general-link-field',
  templateUrl: './general-link-field.component.html',
  providers: [GeneralLinkFieldMessagingService],
})
export class GeneralLinkFieldComponent implements OnInit, OnDestroy {
  @Input() chrome?: FieldChromeInfo;
  @Input() rhsMessaging?: RhsEditorMessaging;
  @Input() size?: 'sm' | 'lg';

  currentValue$: Observable<{ value: GeneralLinkValue | null }> = EMPTY;
  dataReady = false;

  constructor(private readonly messagingService: GeneralLinkFieldMessagingService) {}

  ngOnInit() {
    if (!this.rhsMessaging || !this.chrome) {
      throw Error('Messaging or chrome is not assigned, please check markup.');
    }

    this.messagingService.init(this.rhsMessaging);

    this.currentValue$ = this.messagingService.currentValue$.pipe(map((value) => ({ value })));
  }

  ngOnDestroy() {
    this.messagingService.destroy();
  }

  linkValueChanged(newValue: GeneralLinkValue | null) {
    this.messagingService.set(newValue);
  }
}
