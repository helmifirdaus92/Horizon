/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemField } from 'app/shared/graphql/item.dal.service';

@Component({
  selector: 'app-field-header',
  templateUrl: './field-header.component.html',
  styleUrls: ['./field-header.component.scss'],
})
export class FieldHeaderComponent {
  @Input({ required: true }) field: ItemField;
  @Input() isStandardValue = false;
  @Input() mapSelectedValue: Array<{ displayName: string; itemId: string }> = [];
  @Input() isRearrangeSupported = false;
  @Input() size?: string;

  @Output() resetField = new EventEmitter<void>();
  @Output() toggleRearrangeItems = new EventEmitter<void>();
}
