/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { PersonalizationVariant } from '../personalization.types';

@Directive({
  selector: '[appValidateVariantName]',
  providers: [{ provide: NG_VALIDATORS, useExisting: VariantNameValidatorDirective, multi: true }],
})
export class VariantNameValidatorDirective implements Validator {
  @Input('appValidateVariantName') variants?: PersonalizationVariant[];

  validate(control: AbstractControl): ValidationErrors | null {
    if (!(control.touched || control.dirty)) {
      return null;
    }

    const isVariantAlreadyUsed =
      this.variants &&
      this.variants.some(
        (item) => item.variantName.toLowerCase().trim() === (control.value ?? '').toLowerCase().trim(),
      );

    if (isVariantAlreadyUsed) {
      return { isAlreadyUsed: true };
    }

    if (control.value?.length > 255) {
      return { maxLength: true };
    }

    if (control.value?.length === 0) {
      return { minLength: true };
    }

    // RegEx transcription: Not: a-z or A-Z or 0-9 or _ or ' '
    if (/[^a-zA-Z0-9_ ]|^[\s ]/.test(control.value || '')) {
      return { notAllowedCharacter: true };
    }

    return null;
  }
}
