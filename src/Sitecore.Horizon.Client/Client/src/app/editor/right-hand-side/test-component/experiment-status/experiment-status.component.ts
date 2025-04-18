/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { BadgeModule, IconButtonModule } from '@sitecore/ng-spd-lib';
import { BadgeVariant } from '@sitecore/ng-spd-lib/lib/badge/badge-variant.types';
import { FlowStatus } from 'app/pages/left-hand-side/personalization/personalization.types';

@Component({
  selector: 'app-experiment-status',
  templateUrl: './experiment-status.component.html',
  styleUrls: ['./experiment-status.component.scss'],
  imports: [CommonModule, TranslateModule, IconButtonModule, BadgeModule],
  standalone: true,
})
export class ExperimentStatusComponent {
  private _status: FlowStatus;
  private _isPagePublished: boolean;

  variant: BadgeVariant = 'basic';

  @Input()
  set isPagePublished(val: boolean) {
    this._isPagePublished = val;
    this.updateVariant();
  }
  get isPagePublished(): boolean {
    return this._isPagePublished;
  }

  @Input()
  set status(val: FlowStatus) {
    this._status = val;
    this.updateVariant();
  }
  get status(): FlowStatus {
    return this._status;
  }

  private updateVariant(): void {
    if (!this.isPagePublished && (this.status === 'COMPLETED' || this.status === 'PRODUCTION')) {
      this.variant = 'orange';
      return;
    }
    switch (this.status) {
      case 'DRAFT':
        this.variant = 'basic';
        break;
      case 'PRODUCTION':
        this.variant = 'purple';
        break;
      case 'COMPLETED':
        this.variant = 'green';
        break;
      default:
        this.variant = 'basic';
    }
  }
}
