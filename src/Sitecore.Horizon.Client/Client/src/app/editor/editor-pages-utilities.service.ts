/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { PAGE_DESIGN_TEMPLATE_ID, PARTIAL_DESIGN_TEMPLATE_ID } from 'app/page-design/page-templates.types';
import { Context, ContextService } from 'app/shared/client-state/context.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { isSameGuid } from 'app/shared/utils/utils';
import { filter, firstValueFrom, map, Observable, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ItemTypesUtilityService {
  constructor(
    private readonly itemDalService: BaseItemDalService,
    private readonly context: ContextService,
    private readonly siteService: SiteService,
  ) {}

  ensureFirstEmitIsSitePage<T>(input$: Observable<T>, getContext: (input: T) => Context): Observable<T> {
    let firstEmitValidated = false;

    return input$.pipe(
      switchMap(async (input) => {
        if (firstEmitValidated) {
          return { input, validated: true };
        }

        const isSitePage = await this.isSitePage(getContext(input));
        if (isSitePage) {
          firstEmitValidated = true;
          return { input, validated: true };
        }

        await this.changeContextToSiteStartPage();
        firstEmitValidated = true;

        return { input, validated: false };
      }),
      filter((data) => data.validated),
      map((data) => data.input),
    );
  }

  private async isSitePage(context: Context): Promise<boolean> {
    const siteId = this.siteService.getSiteByName(context.siteName)?.id;
    if (!siteId) {
      throw Error('site could not be found');
    }

    const item = await firstValueFrom(
      this.itemDalService.getItemType(context.itemId, context.language, context.siteName, siteId, context.itemVersion),
    );

    const isPartialDesign = item.baseTemplateIds.some((baseTemplate) =>
      isSameGuid(baseTemplate, PARTIAL_DESIGN_TEMPLATE_ID),
    );
    const isPageDesign = item.baseTemplateIds.some((baseTemplate) => isSameGuid(baseTemplate, PAGE_DESIGN_TEMPLATE_ID));

    // TODO - enable lines below when Page Branches feature is enabled
    // Disabled because of the customer request: https://sitecore.atlassian.net/browse/PGS-2382
    // const isPageBranch = item.ancestors.some((ancestor) => isSameGuid(ancestor.template.id, PAGE_BRANCH_TEMPLATE_ID));
    // return !isPartialDesign && !isPageDesign && !isPageBranch;

    return !isPartialDesign && !isPageDesign;
  }

  private async changeContextToSiteStartPage(): Promise<void> {
    const siteStartPage = await firstValueFrom(
      this.siteService.getStartItem(this.context.siteName, this.context.language),
    );

    this.context.updateContext({ itemId: siteStartPage.id });
  }
}
