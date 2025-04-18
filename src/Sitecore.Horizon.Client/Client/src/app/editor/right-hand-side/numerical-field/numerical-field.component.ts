/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FieldChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { NumericalFieldMessagingService } from './numerical-field-messaging.service';

export interface NumericFieldInputValidator {
  isValidInput: (input: string) => boolean;
  validationErrorInlineMessageKey: string;
  validationErrorNotificationMessageKey: string;
}

@Component({
  selector: 'app-numerical-field',
  templateUrl: './numerical-field.component.html',
  styleUrls: ['./numerical-field.component.scss'],
  providers: [NumericalFieldMessagingService],
})
export class NumericalFieldComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() chrome?: FieldChromeInfo;
  @Input() rhsMessaging?: RhsEditorMessaging;
  @Input() placeholderText?: string;
  @Input() fieldValidator: NumericFieldInputValidator = {
    isValidInput: () => true,
    validationErrorInlineMessageKey: '',
    validationErrorNotificationMessageKey: '',
  };
  @ViewChild('numericalInputField', { read: ElementRef }) numericalInputField?: ElementRef;

  isValidInput = true;
  private readonly lifetime = new Lifetime();
  private lastSavedValue: string | null = null;
  private _currentValue = '';

  get currentValue() {
    return this._currentValue;
  }
  set currentValue(value: string) {
    this.isValidInput = this.fieldValidator.isValidInput(value);
    this._currentValue = value;
  }

  constructor(
    private readonly messagingService: NumericalFieldMessagingService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
  ) {}

  ngOnInit() {
    if (!this.rhsMessaging || !this.chrome) {
      throw Error('Messaging or chrome is not assigned, please check markup.');
    }

    this.messagingService.init(this.rhsMessaging);

    this.messagingService.currentValue$.pipe(takeWhileAlive(this.lifetime)).subscribe((value) => {
      this.currentValue = value ?? '';
      this.lastSavedValue = this.currentValue;
    });
  }

  ngOnDestroy(): void {
    this.trySaveInputValue();
    if (this.currentValue !== this.lastSavedValue) {
      this.timedNotificationsService.push(
        'EditNumericalField-' + this.chrome?.chromeId,
        this.translateService.get(this.fieldValidator.validationErrorNotificationMessageKey),
        'error',
      );
    }
    this.lifetime.dispose();
  }

  ngAfterViewInit() {
    // We need to be sure that we set the initial value from the canvas first and then only we focus it
    // Otherwise focus will be lost if value is set after focus
    setTimeout(() => {
      this.numericalInputField?.nativeElement.focus();
    }, 0);
  }

  trySaveInputValue() {
    if (this.currentValue === this.lastSavedValue) {
      return;
    }
    if (!this.isValidInput) {
      return;
    }
    this.lastSavedValue = this.currentValue;
    this.messagingService.set(this.currentValue);
  }
}
