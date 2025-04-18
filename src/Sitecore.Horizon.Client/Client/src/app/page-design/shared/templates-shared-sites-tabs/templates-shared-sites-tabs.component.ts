/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SiteType } from '../../page-templates.types';

@Component({
  selector: 'app-templates-shared-sites-tabs',
  templateUrl: './templates-shared-sites-tabs.component.html',
  styleUrls: ['./templates-shared-sites-tabs.component.scss'],
})
export class TemplatesSharedSitesTabsComponent {
  @Output() changeSiteType = new EventEmitter<SiteType>();
  @Input() selectedSiteType: SiteType | null = null;
}
