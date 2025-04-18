/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FieldChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { DateFieldMessagingService } from './date-field-messaging.service';
import { convertDateToReadableFormat, convertDateToSitecoreIsoFormat, formatDate } from './date-field.utils';

@Component({
  selector: 'app-date-field',
  templateUrl: './date-field.component.html',
  styleUrls: ['./date-field.component.scss'],
  providers: [DateFieldMessagingService],
})
export class DateFieldComponent implements OnInit, OnDestroy {
  @Input() chrome?: FieldChromeInfo;
  @Input() rhsMessaging?: RhsEditorMessaging;

  private readonly lifetime = new Lifetime();
  lastSavedValue: string | null = null;
  private _currentValue = '';

  get currentValue() {
    return this._currentValue;
  }
  set currentValue(value: string) {
    this._currentValue = formatDate(value, this.chrome?.fieldType || '');
  }

  get readableFormat() {
    return convertDateToReadableFormat(this.currentValue, this.chrome?.fieldType || '');
  }

  constructor(private readonly messagingService: DateFieldMessagingService) {}

  ngOnDestroy(): void {
    this.saveNewValue();
    this.lifetime.dispose();
  }

  ngOnInit(): void {
    if (!this.rhsMessaging || !this.chrome) {
      throw Error('Messaging or chrome is not assigned, please check markup.');
    }

    this.messagingService.init(this.rhsMessaging);

    this.messagingService.currentValue$.pipe(takeWhileAlive(this.lifetime)).subscribe((value) => {
      if (value) {
        this.currentValue = value;
        this.lastSavedValue = this.currentValue;
      }
    });
  }

  saveNewValue() {
    if (this.currentValue === this.lastSavedValue) {
      return;
    }
    this.lastSavedValue = this.currentValue;
    if (this.currentValue === '') {
      this.messagingService.set('');
      return;
    }
    // Convert date/datetime field value to sitecore date format i.e. 'yyyyMMddTHHmmssZ' format.
    const formattedDate = convertDateToSitecoreIsoFormat(this.currentValue);
    this.messagingService.set(formattedDate);
  }
}
