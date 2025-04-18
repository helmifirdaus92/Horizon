/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule, ListModule, PopoverModule } from '@sitecore/ng-spd-lib';

@Component({
  selector: 'app-variant-actions-context-menu',
  templateUrl: './variant-actions-context-menu.component.html',
  styleUrl: './variant-actions-context-menu.component.scss',
  imports: [CommonModule, TranslateModule, ListModule, PopoverModule, IconButtonModule, A11yModule],
  standalone: true,
})
export class VariantActionsContextMenuComponent {
  disabled = input<boolean>(false);
  disableDeleteVariant = input<boolean>(false);
  disableResetVariant = input<boolean>(false);

  renameBtnClick = output<MouseEvent>();
  deleteBtnClick = output<MouseEvent>();
  resetBtnClick = output<MouseEvent>();

  constructor() {}
}
