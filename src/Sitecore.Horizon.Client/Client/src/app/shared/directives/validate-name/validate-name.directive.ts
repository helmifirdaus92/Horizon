/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appForbiddenNames]',
  providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenNamesDirective, multi: true }],
})
export class ForbiddenNamesDirective implements Validator {
  @Input('appForbiddenNames') forbiddenNames?: string[];

  validate(control: AbstractControl): ValidationErrors | null {
    if (!(control.touched || control.dirty)) {
      return null;
    }

    const isForbidden =
      this.forbiddenNames &&
      this.forbiddenNames.some((name) => name.toLowerCase().trim() === (control.value ?? '').toLowerCase().trim());

    if (isForbidden) {
      return { isForbidden: true };
    }

    return null;
  }
}
