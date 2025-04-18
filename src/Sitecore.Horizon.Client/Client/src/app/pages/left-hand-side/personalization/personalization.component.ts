/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AnalyticsContextService } from 'app/analytics/analytics-context.service';
import { checkCdpIsConfigured, checkPosIdentifierIsDefined } from 'app/analytics/analytics-util/analytics-utils';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { PersonalizationNotificationsService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.notifications.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { ApiResponse, getAnalyticsIdentifierUrl, getDashboardAppUrl } from 'app/shared/utils/utils';
import { environment } from 'environments/environment';
import { EMPTY, Observable, combineLatest, firstValueFrom, map, switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import { EditorWorkspaceService } from '../../../editor/editor-workspace/editor-workspace.service';
import { panelAnimations } from '../content-tree-panel/lhs-slide-in-panel.animations';
import { CreateVariantDialogService } from './create-variant-dialog/create-variant-dialog.service';
import { PersonalizationAPIService } from './personalization-api/personalization.api.service';
import { AbTestComponentService } from './personalization-services/ab-test-component.service';
import { PersonalizationDalService } from './personalization-services/personalization.dal.service';
import { PersonalizationLayoutService } from './personalization-services/personalization.layout.service';
import { PersonalizationService } from './personalization-services/personalization.service';
import {
  BXPersonalizationFlowDefinition,
  PersonalizationFlowDefinition,
  PersonalizationVariant,
} from './personalization.types';

function findVariantById(variants: CustomVariant[], variantId: string): CustomVariant | undefined {
  return variants.find((item) => item.variantId === variantId);
}

interface CustomVariant extends PersonalizationVariant {
  enableEdit?: boolean;
}

@Component({
  selector: 'app-personalization',
  templateUrl: './personalization.component.html',
  styleUrls: ['./personalization.component.scss'],
  animations: panelAnimations,
})
export class PersonalizationComponent implements OnInit, OnDestroy {
  private lifetime: Lifetime = new Lifetime();

  flowDefinition: PersonalizationFlowDefinition | null = null;
  variants: CustomVariant[] = [];
  activeVariant: PersonalizationVariant | null = null;
  hasScroll = false;
  isLoading = true;
  isApiConnected = true;

  canEditVariant$: Observable<boolean> = EMPTY;

  variantName = '';
  canvasIsLoading$: Observable<boolean> = EMPTY;
  isPosIdentifierDefined = true;

  itemChanges$: Observable<unknown> = EMPTY;

  dashboardSettingUrl$: Observable<SafeUrl> = EMPTY;

  isAbTestConfigured = false;

  isCdpAppConfigured = checkCdpIsConfigured(environment.personalizationIntegrationConnectedMode, {
    cdpApiUrl: ConfigurationService.cdpTenant?.apiUrl,
    cdpAppUrl: ConfigurationService.cdpTenant?.appUrl,
  });

  isFeatureEnabled = () => this.featureFlagService.isFeatureEnabled('pages_site-analytics-identifier');

  constructor(
    private readonly contextService: ContextService,
    private readonly personalizationApiService: PersonalizationAPIService,
    private readonly personalizationService: PersonalizationService,
    private readonly personalizationNotificationsService: PersonalizationNotificationsService,
    private readonly personalizationLayoutService: PersonalizationLayoutService,
    private readonly personalizationDalService: PersonalizationDalService,
    private readonly editorWorkspaceService: EditorWorkspaceService,
    private readonly createVariantDialogService: CreateVariantDialogService,
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly siteService: SiteService,
    private readonly abTestComponentService: AbTestComponentService,
    private readonly domSanitizer: DomSanitizer,
    private readonly featureFlagService: FeatureFlagsService,
    private readonly analitycsContextService: AnalyticsContextService,
  ) {}

  ngOnInit() {
    if (this.isFeatureEnabled()) {
      this.dashboardSettingUrl$ = this.analitycsContextService.getSiteInformation().pipe(
        switchMap(async (site) => {
          return this.domSanitizer.bypassSecurityTrustUrl(
            getAnalyticsIdentifierUrl(
              this.staticConfigurationService.dashboardAppBaseUrl,
              site?.collectionId,
              site?.id,
              site?.hostId,
            ),
          );
        }),
        shareReplayLatest(),
      );
    } else {
      this.dashboardSettingUrl$ = this.contextService.siteName$.pipe(
        switchMap(async (siteName) =>
          this.domSanitizer.bypassSecurityTrustUrl(
            getDashboardAppUrl(this.staticConfigurationService.dashboardAppBaseUrl, 'settings', siteName),
          ),
        ),
        shareReplayLatest(),
      );
    }

    this.canvasIsLoading$ = this.editorWorkspaceService.watchCanvasLoadState().pipe(map((value) => value.isLoading));

    this.canEditVariant$ = this.contextService.itemId$.pipe(
      switchMap(() => this.contextService.getItem()),
      map((item) => item.permissions.canWrite),
    );

    combineLatest([this.contextService.siteName$, this.contextService.language$])
      .pipe(
        switchMap(() => this.readPointOfSale()),
        switchMap(() => this.contextService.itemId$),
        takeWhileAlive(this.lifetime),
      )
      .subscribe(async () => {
        if (!this.isCdpAppConfigured || !this.isPosIdentifierDefined) {
          this.disablePersonalizationMode();
        } else {
          this.isLoading = true;
          this.isAbTestConfigured =
            (
              await this.abTestComponentService.getAbTestsConfiguredOnPage(
                this.contextService.itemId,
                this.contextService.language,
              )
            ).length > 0;

          if (this.isAbTestConfigured) {
            this.disablePersonalizationMode();
          } else {
            await this.enablePersonalizationMode();
          }
        }

        this.selectVariant(undefined, true);
        this.isLoading = false;
      });

    this.contextService.itemVersion$.pipe(takeWhileAlive(this.lifetime)).subscribe(() => {
      this.selectVariant(undefined, true);
    });
  }

  private async readPointOfSale(): Promise<void> {
    const sitePos = await this.siteService.getPointOfSale();
    this.isPosIdentifierDefined = checkPosIdentifierIsDefined(sitePos);
  }

  async ngOnDestroy() {
    this.lifetime.dispose();

    this.personalizationService.setIsInPersonalizationMode(false);
    this.personalizationNotificationsService.stopShowingNotifications();

    await this.selectVariant(undefined, !this.activeVariant);
  }

  reloadApplication(): void {
    window.location.reload();
  }

  storeScroll(event: Event): void {
    this.hasScroll = (event.target as HTMLElement).scrollTop > 0;
  }

  async selectVariant(item?: CustomVariant, skipContextUpdate?: boolean): Promise<void> {
    if (
      item?.variantId === this.activeVariant?.variantId &&
      item?.variantId === this.personalizationService.getActiveVariant()?.variantId
    ) {
      return;
    }

    this.activeVariant = item ?? null;
    this.personalizationService.setActiveVariant(this.activeVariant);

    if (!skipContextUpdate) {
      await this.contextService.updateContext({
        variant: item?.variantId || undefined,
        itemVersion: this.contextService.itemVersion,
      });
    }
  }

  async createVariant(): Promise<void> {
    this.isLoading = true;

    if (!this.flowDefinition) {
      await this.createFlowDefinition();
    }

    const createdVariant = await firstValueFrom(
      this.createVariantDialogService.show({
        flowDefinition: this.flowDefinition,
        variantId: uuid().replace(/-/g, ''),
        action: 'createVariant',
      }),
    );

    if (createdVariant) {
      await this.reloadFlowDefinition();
      // If the user closes the dialog after the personalize iframe loads, we cannot determine if a valid variant was created.
      // Therefore, we re-fetch the flow to check if a variant was created.
      // If not, we archive it so the user can create an A/B test later and hide the personalize icon.
      // Note: Creating the first variant will unarchive the flowDefinition.
      if (this.flowDefinition?.traffic?.splits.length === 0) {
        await this.personalizationApiService.archiveFlowDefinition(this.flowDefinition);
      }

      // If the last variant was removed, the flow definition is archived.
      // When creating a new variant, we need to unarchive the flow definition if it is archived and has variants.
      if (this.flowDefinition?.archived && this.flowDefinition?.traffic?.splits.length > 0) {
        await this.unarchiveFlowDefinition();
      }

      const newVariant = this.variants.find((item) => item.variantId === createdVariant.id);

      this.selectVariant(newVariant);
    }

    await this.abTestComponentService.refetchFlows(this.contextService.itemId, this.contextService.language);

    this.isLoading = false;
  }

  async editVariant(id: string): Promise<void> {
    const editedVariant = await firstValueFrom(
      this.createVariantDialogService.show({
        flowDefinition: this.flowDefinition,
        variantId: id,
        action: 'editVariant',
      }),
    );

    if (editedVariant) {
      this.isLoading = true;

      await this.reloadFlowDefinition();
    }

    this.isLoading = false;
  }

  async renamePageVariant(variantId: string, variantName: string, referenceEl: HTMLElement) {
    const originalVariant = findVariantById(this.variants, variantId);
    const originalVariantName = originalVariant?.variantName ?? '';
    const resetVariantNameToOriginal = () => {
      referenceEl.innerText = originalVariantName;
    };

    if (!originalVariant || (variantName && originalVariant?.variantName.trim() === variantName.trim())) {
      return;
    }

    if (!this.verifyRenameVariantIsValid(variantId, variantName)) {
      resetVariantNameToOriginal();

      return;
    }

    if (this.flowDefinition) {
      await this.personalizationApiService
        .renameVariantNameFromFlowDefinition(this.flowDefinition, variantId, variantName)
        .then(this.handleAPIResponse.bind(this))
        .catch(() => {
          resetVariantNameToOriginal();

          throw new Error('Request is invalid');
        })
        .then(this.setFlowDefinitionFromResponse.bind(this));
    }
  }

  async deleteVariant(variant: PersonalizationVariant): Promise<void> {
    if (!this.flowDefinition) {
      return;
    }

    this.isLoading = true;

    await this.personalizationApiService
      .deleteVariantFromFlowDefinition(this.flowDefinition, variant)
      .then(this.handleAPIResponse.bind(this))
      .then(this.setFlowDefinitionFromResponse.bind(this))
      .then(async () => {
        await this.personalizationLayoutService.removePersonalizationRulesFromLayout(variant.variantId);

        try {
          await firstValueFrom(
            this.personalizationDalService.deleteLayoutRulesForAllVersions({
              path: this.contextService.itemId,
              language: this.contextService.language,
              siteName: this.contextService.siteName,
              VariantId: variant.variantId,
            }),
          );
        } catch {
          // remove try-catch block after all customers consume latest XM Cloud with required GraphQL endpoint
        }

        // If deleting the last variant, we will refetch the flows to update tree icons
        // and reflect that the page is no longer personalized.
        if (this.flowDefinition?.traffic?.splits?.length === 0) {
          await this.abTestComponentService.refetchFlows(this.contextService.itemId, this.contextService.language);
        }

        // if deleting an active variant we will switch to default variant.
        if (this.activeVariant?.variantId === variant.variantId) {
          this.selectVariant();
        }
      });

    this.isLoading = false;
  }

  private verifyRenameVariantIsValid(renameVariantId: string, variantName: string): boolean {
    const isVariantNameAlreadyExist = this.variants?.some(
      (item: any) => item.variantId !== renameVariantId && item.variantName.trim() === variantName.trim(),
    );

    if (isVariantNameAlreadyExist) {
      this.personalizationNotificationsService.showVariantAlreadyExistsNotification();
      return false;
    }
    if (!variantName.length) {
      this.personalizationNotificationsService.showVariantIsEmptyNotification();
      return false;
    }
    if (variantName.length > 255) {
      this.personalizationNotificationsService.showVariantNameExceedLimitNotification();
      return false;
    }

    return true;
  }

  private async createFlowDefinition(): Promise<void> {
    await (
      this.personalizationApiService.createPageFlowDefinition() as Promise<ApiResponse<BXPersonalizationFlowDefinition>>
    )
      .then(this.handleAPIResponse.bind(this))
      .then(this.setFlowDefinitionFromResponse.bind(this));
  }

  private async unarchiveFlowDefinition(): Promise<void> {
    if (this.flowDefinition) {
      await (
        this.personalizationApiService.unarchiveFlowDefinition(this.flowDefinition) as Promise<
          ApiResponse<BXPersonalizationFlowDefinition>
        >
      )
        .then(this.handleAPIResponse.bind(this))
        .then(this.setFlowDefinitionFromResponse.bind(this));
    }
  }

  private async reloadFlowDefinition(): Promise<void> {
    await this.personalizationApiService
      .getActivePersonalizeFlowDefinition()
      .then(this.handleAPIResponse.bind(this))
      .then(this.setFlowDefinitionFromResponse.bind(this));
  }

  private setFlowDefinitionFromResponse(exp?: ApiResponse<BXPersonalizationFlowDefinition>): void {
    if (!exp?.data) {
      this.flowDefinition = null;
      this.variants = [];
      this.selectVariant();

      return;
    }

    this.flowDefinition = exp.data;
    this.variants = this.flowDefinition.traffic.splits;
  }

  private async enablePersonalizationMode() {
    this.personalizationService.setIsInPersonalizationMode(true);
    this.personalizationNotificationsService.initShowingNotifications();
    return await this.reloadFlowDefinition();
  }

  private disablePersonalizationMode() {
    this.personalizationService.setIsInPersonalizationMode(false);
  }

  // Make this method public for testing reasons
  // We expect that if "apiIsBroken" or "requestIsInvalid" is true, the succeeding "then" operator should bot be called,
  // but instead a valid error should be thrown. In tests this behavior with an Error makes the tests failing, so we want to mock this method instead.
  handleAPIResponse<T>(requestResult: ApiResponse<T>): ApiResponse<T> {
    if (requestResult?.apiIsBroken === true) {
      this.isApiConnected = false;

      this.isLoading = false;
      throw new Error('Api is broken');
    }

    if (requestResult.requestIsInvalid === true) {
      this.personalizationNotificationsService.showApiBadRequestError();

      this.isLoading = false;
      throw new Error('Request is invalid');
    }

    return requestResult;
  }
}
