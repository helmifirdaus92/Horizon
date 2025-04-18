/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { FieldChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { RhsEditorMessaging } from '../../rhs-editor-messaging';
import { NumericFieldInputValidator } from '../numerical-field.component';

export const INT_MIN_VALUE = -2147483648;
export const INT_MAX_VALUE = 2147483647;

@Component({
  selector: 'app-integer-field',
  templateUrl: './integer-field.component.html',
})
export class IntegerFieldComponent {
  @Input() chrome?: FieldChromeInfo;
  @Input() rhsMessaging?: RhsEditorMessaging;

  readonly fieldValidator: NumericFieldInputValidator;

  constructor() {
    this.fieldValidator = {
      isValidInput: (input: string) => {
        const inputNumber = Number(input);
        return Number.isInteger(inputNumber) && inputNumber >= INT_MIN_VALUE && inputNumber <= INT_MAX_VALUE;
      },
      validationErrorInlineMessageKey: 'EDITOR.INTEGER.NOT_VALID_INTEGER',
      validationErrorNotificationMessageKey: 'EDITOR.INTEGER.NOT_VALID_VALUE_WAS_NOT_SAVED',
    };
  }
}
