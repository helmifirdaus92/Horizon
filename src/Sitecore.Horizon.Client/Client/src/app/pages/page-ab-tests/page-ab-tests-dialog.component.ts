/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContextService } from 'app/shared/client-state/context.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { filter } from 'rxjs';
import { AbTestComponentService } from '../left-hand-side/personalization/personalization-services/ab-test-component.service';
import { VariantPublishedStatusService } from '../left-hand-side/personalization/personalization-services/variant-published-status.service';
import { BXComponentFlowDefinition } from '../left-hand-side/personalization/personalization.types';

export interface ComponentFlowDefinitionWithPublishedStatus extends BXComponentFlowDefinition {
  isPagePublished: boolean;
}

@Component({
  selector: 'page-ab-tests-details-dialog',
  templateUrl: './page-ab-tests-dialog.component.html',
  styleUrls: ['./page-ab-tests-dialog.component.scss'],
})
export class PageAbTestsDialogComponent implements OnInit, OnDestroy {
  pageAbTests: ComponentFlowDefinitionWithPublishedStatus[] = [];
  selectedAbTest: ComponentFlowDefinitionWithPublishedStatus | null = null;
  contextValue$ = this.contextService.value$;
  isLoading = false;

  private lifetime = new Lifetime();

  constructor(
    private readonly contextService: ContextService,
    private readonly abTestComponentService: AbTestComponentService,
    private readonly variantPublishedStatusService: VariantPublishedStatusService,
  ) {}

  ngOnInit(): void {
    // Set flow definitions when variants are fetched.
    // 'variantsFetched' is set to true when both flows and page variants are fetched.
    // It is also set when the flow status changes.
    // This prevents fetching flows multiple times.
    this.variantPublishedStatusService.variantsFetched$
      .pipe(
        takeWhileAlive(this.lifetime),
        filter((variantsFetched) => variantsFetched),
      )
      .subscribe(async () => {
        this.isLoading = true;
        try {
          const pageAbTests = await this.abTestComponentService.getAbTestsConfiguredOnPage(
            this.contextService.itemId,
            this.contextService.language,
          );
          this.pageAbTests = pageAbTests
            ?.map((pageAbTest) => ({
              ...pageAbTest,
              isPagePublished: this.variantPublishedStatusService.isPagePublished(pageAbTest),
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

          this.selectedAbTest = this.pageAbTests.length === 1 ? this.pageAbTests[0] : null;
        } catch (error) {
          console.error('Error fetching flow definitions:', error);
          this.pageAbTests = [];
        } finally {
          this.isLoading = false;
        }
      });
  }

  viewDetails(abTest: ComponentFlowDefinitionWithPublishedStatus): void {
    this.selectedAbTest = abTest;
    this.abTestComponentService.setSelectedTest(abTest);
  }

  goBack(): void {
    this.selectedAbTest = null;
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }
}
