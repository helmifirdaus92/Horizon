/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { FieldRawValue } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { isSameGuid } from 'app/shared/utils/utils';

export class FieldState {
  get rawValue(): string {
    return this.value.rawValue;
  }
  constructor(
    public readonly fieldId: string,
    public readonly itemId: string,
    public readonly value: FieldRawValue,
    public readonly reset: boolean,
    public readonly itemVersion?: number,
  ) {}

  isSameField(field: FieldState): boolean {
    return (
      isSameGuid(this.fieldId, field.fieldId) &&
      isSameGuid(this.itemId, field.itemId) &&
      // For backward compatibility we only check item version if it exists
      (!field.itemVersion || this.itemVersion === field.itemVersion)
    );
  }
}
