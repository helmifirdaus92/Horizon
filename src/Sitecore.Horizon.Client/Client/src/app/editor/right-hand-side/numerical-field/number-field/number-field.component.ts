/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { FieldChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { RhsEditorMessaging } from '../../rhs-editor-messaging';
import { NumericFieldInputValidator } from '../numerical-field.component';

@Component({
  selector: 'app-number-field',
  templateUrl: './number-field.component.html',
})
export class NumberFieldComponent {
  @Input() chrome?: FieldChromeInfo;
  @Input() rhsMessaging?: RhsEditorMessaging;

  readonly fieldValidator: NumericFieldInputValidator;

  constructor() {
    this.fieldValidator = {
      isValidInput: (input: string) => {
        if (input === '') {
          return true;
        }
        return Number.isFinite(Number(input));
      },
      validationErrorInlineMessageKey: 'EDITOR.NUMBER.NOT_VALID_NUMBER',
      validationErrorNotificationMessageKey: 'EDITOR.NUMBER.NOT_VALID_VALUE_WAS_NOT_SAVED',
    };
  }
}
