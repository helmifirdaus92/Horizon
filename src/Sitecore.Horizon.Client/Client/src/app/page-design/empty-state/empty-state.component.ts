/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

const DEFAULT_IMAGE_PATH = 'https://delivery-sitecore.sitecorecontenthub.cloud/api/public/content/spot-cactus-neutral';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss'],
  imports: [CommonModule, TranslateModule],
  standalone: true,
})
export class EmptyStateComponent {
  @Input() title = '';
  @Input() path = DEFAULT_IMAGE_PATH;
  @Input() btnText = '';
  @Input() description?: string;
  @Input() paddingTop = 80;
  @Input() isDisabled?: boolean;
  @Output() btnClick = new EventEmitter();
}
