/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, OnDestroy } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { combineLatest, from, map, Observable } from 'rxjs';
import { PersonalizationAPIService } from '../personalization-api/personalization.api.service';
import {
  formatFriendlyId,
  isMatchingPageComponentId,
  isPageComponentFriendlyId,
} from '../personalization-api/personalization.api.utils';
import { BXFlowDefinitionBasicInfo } from '../personalization.types';
import { AbTestComponentService } from './ab-test-component.service';

export interface cdpSiteData {
  hasPagePersonalization: (pageId: string) => boolean;
  hasPageWithAbTest: (pageId: string, includeCompleted: boolean) => boolean;
  hasComponentAbTest: (pageId: string, renderingInstanceId: string, includeCompleted: boolean) => boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CdpSiteDataService implements OnDestroy {
  private readonly lifetime = new Lifetime();
  private personalizationScope: string | undefined = undefined;
  private flowDefinitions: BXFlowDefinitionBasicInfo[] = [];

  private _cdpSiteData$: Observable<cdpSiteData>;

  constructor(
    private abTestComponentService: AbTestComponentService,
    private personalizationApiService: PersonalizationAPIService,
    private contextService: ContextService,
  ) {
    this._cdpSiteData$ = combineLatest([
      from(this.personalizationApiService.getPersonalizationScope()),
      this.abTestComponentService.flowDefinition$,
    ]).pipe(
      takeWhileAlive(this.lifetime),
      map(([personalizationScope, flowDefinitions]) => {
        this.personalizationScope = personalizationScope;
        this.flowDefinitions = flowDefinitions;

        return {
          hasPagePersonalization: (pageId: string) => this.hasPagePersonalization(pageId),
          hasPageWithAbTest: (pageId: string, includeCompleted: boolean) =>
            this.hasPageWithAbTest(pageId, includeCompleted),
          hasComponentAbTest: (pageId: string, renderingInstanceId: string, includeCompleted: boolean) =>
            this.hasComponentAbTest(pageId, renderingInstanceId, includeCompleted),
        };
      }),
    );
  }

  watchCdpSiteData(): Observable<cdpSiteData> {
    return this._cdpSiteData$;
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  private hasPagePersonalization(pageId: string): boolean {
    return this.flowDefinitions
      .filter((f) => f.status != 'COMPLETED')
      .some((flow) =>
        flow.friendlyId.includes(
          formatFriendlyId(true, this.personalizationScope, pageId, '', this.contextService.language),
        ),
      );
  }

  private hasPageWithAbTest(pageId: string, includeCompleted: boolean): boolean {
    const flowDefinitions = includeCompleted
      ? this.flowDefinitions
      : this.flowDefinitions.filter((f) => f.status != 'COMPLETED');

    return flowDefinitions.some((flow) =>
      isPageComponentFriendlyId(flow.friendlyId, pageId, this.personalizationScope, this.contextService.language),
    );
  }

  private hasComponentAbTest(pageId: string, renderingInstanceId: string, includeCompleted: boolean): boolean {
    const flowDefinitions = includeCompleted
      ? this.flowDefinitions
      : this.flowDefinitions.filter((f) => f.status != 'COMPLETED');

    return flowDefinitions.some((flow) =>
      isMatchingPageComponentId(
        flow.friendlyId,
        pageId,
        this.personalizationScope,
        this.contextService.language,
        renderingInstanceId,
      ),
    );
  }
}
