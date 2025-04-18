/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';

type FallbackIconType =
  | 'mdi-page-layout-header'
  | 'mdi-view-compact-outline'
  | 'mdi-view-dashboard-outline'
  | 'mdi-folder-outline';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss'],
})
export class ItemDetailsComponent {
  @Input() displayName?: string;
  @Input() thumbanailAltText?: string;
  @Input() createdDate?: string;
  @Input() updatedDate?: string;
  @Input() thumbnailUrl?: string;
  @Input() sourceSite?: string;
  @Input() fallbackIcon: FallbackIconType = 'mdi-view-compact-outline';
  @Input() pageDesignUsedByTemplatesCount?: number | null;
  @Input() templateUsedByPagesCount?: number | null;
  @Input() isLoading = false;
}
