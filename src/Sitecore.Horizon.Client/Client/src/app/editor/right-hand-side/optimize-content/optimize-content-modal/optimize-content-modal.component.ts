/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-optimize-content-modal',
  templateUrl: './optimize-content-modal.component.html',
  styleUrls: ['./optimize-content-modal.component.scss'],
})
export class OptimizeContentModalComponent {
  @Input() headerText = '';
  @Input() description = '';
  @Input() src = '';
  @Input() alt = 'CONTENT_OPTIMIZATION.DIALOG_HEADER';
  @Input() modalWidth = 355;

  constructor() {}
}
