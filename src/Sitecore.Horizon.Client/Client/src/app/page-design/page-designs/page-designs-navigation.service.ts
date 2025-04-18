/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { Observable } from 'rxjs';
import { PageTemplatesService } from '../page-templates.service';
import {
  FolderContext,
  ItemWithSite,
  PAGE_DESIGN_FOLDER_TEMPLATE_ID,
  PAGE_DESIGN_TEMPLATE_ID,
} from '../page-templates.types';
import { PageTemplatesItemsNavigationBaseService } from '../shared/page-templates-items-navigation-base.service';

@Injectable({
  providedIn: 'root',
})
export class PageDesignsNavigationService extends PageTemplatesItemsNavigationBaseService {
  protected readonly folderTemplateId = PAGE_DESIGN_FOLDER_TEMPLATE_ID;
  protected readonly itemTemplateId = PAGE_DESIGN_TEMPLATE_ID;

  constructor(
    pageTemplatesService: PageTemplatesService,
    contextService: ContextService,
    translateService: TranslateService,
    timedNotificationsService: TimedNotificationsService,
    router: Router,
  ) {
    super(pageTemplatesService, contextService, translateService, timedNotificationsService, router);
  }

  fetchDesignRoots(ctx: FolderContext): Observable<ItemWithSite[]> {
    return this.pageTemplatesService.getPageDesigsRootWithNoChildren(ctx.siteName);
  }
  fetchDesignRootsWithChildren(ctx: FolderContext): Observable<ItemWithSite[]> {
    return this.pageTemplatesService.getPageDesignsRoots(ctx.siteName, ctx.language);
  }
}
