/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { FEaaSComponentsService } from 'app/editor/designing/feaas-components-gallery/feaas-components.service';
import { LhsPanelComponent } from 'app/editor/lhs-panel/lhs-panel.component';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { PersonalizationAPIService } from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.service';
import {
  getComponentVariantId,
  getVariantSection,
  makeFlowNameUnique,
} from 'app/pages/left-hand-side/personalization/personalization-api/personalization.api.utils';
import { AbTestComponentService } from 'app/pages/left-hand-side/personalization/personalization-services/ab-test-component.service';
import {
  PersonalizationLayoutService,
  PersonlizedRenderingInfo,
} from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import { VariantPublishedStatusService } from 'app/pages/left-hand-side/personalization/personalization-services/variant-published-status.service';
import { BXComponentVariant } from 'app/pages/left-hand-side/personalization/personalization.types';
import { PageAbTestsDialogComponent } from 'app/pages/page-ab-tests/page-ab-tests-dialog.component';
import { AbTestAnalyticsService } from 'app/pages/page-ab-tests/services/ab-test-analytics.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { DatasourceDialogService } from 'app/shared/dialogs/datasource-dialog/datasource-dialog.service';
import { DatasourcePickerService } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TimedNotification, TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { isSameGuid } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import { RenderingInitializationContext, RenderingInitializationDetails } from 'sdk';
import { v4 as uuid } from 'uuid';
import { AbTestInfo } from '../editor-rhs.component';
import { BYOC_RENDERING_ID, FEAAS_RENDERING_ID } from '../feaas-rhs-region/feaas-extension-filter';
import { panelAnimations } from '../rhs-slide-in-panel.animations';
import { ConfigureExperimentDialogService } from './configure-experiment-dialog/configure-experiment-dialog.service';
import { EndExperimentDialogService } from './end-experiment-dialog/end-experiment-dialog.service';

@Component({
  selector: 'app-test-component',
  templateUrl: './test-component.component.html',
  styleUrl: './test-component.component.scss',
  animations: panelAnimations,
  providers: [PersonalizationLayoutService, DatasourcePickerService],
})
export class TestComponentComponent implements OnInit, OnDestroy, AfterViewChecked {
  private readonly lifetime = new Lifetime();
  private readonly editingChannel: EditingMessagingChannel;

  @ViewChild('nameInput', { read: ElementRef }) nameInput?: ElementRef;

  abTest: AbTestInfo;
  @Input() set abTestValue(value: AbTestInfo) {
    if (value?.flowDefinition) {
      this.abTest = value;
      this.init();
    }
  }

  allowedRenderingIds: string[] = [];
  isLoading = true;

  testIndex = ['A', 'B', 'C', 'D', 'E', 'F'];
  selectedTestIndex = 0;

  showSelectComponent = false;
  showConfigureExperiment = false;

  editedVariantName = '';
  showEditVariantName = false;

  isPagePublished = false;

  constructor(
    private readonly dataSourceDialogService: DatasourceDialogService,
    private readonly dataSourcePickerService: DatasourcePickerService,
    private readonly personalizationLayoutService: PersonalizationLayoutService,
    private readonly contextService: ContextService,
    private readonly messagingService: MessagingService,
    private readonly canvasServices: CanvasServices,
    private readonly configureExperimentDialogService: ConfigureExperimentDialogService,
    private readonly dialogService: DialogOverlayService,
    private readonly translateService: TranslateService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly personalizationAPIService: PersonalizationAPIService,
    private readonly variantPublishedStatusService: VariantPublishedStatusService,
    private readonly endExperimentDialogService: EndExperimentDialogService,
    private readonly abTestComponentService: AbTestComponentService,
    private readonly feaasComponentService: FEaaSComponentsService,
    private readonly abTestAnalyticsService: AbTestAnalyticsService,
  ) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();
  }

  ngOnInit(): void {
    this.lifetime.registerCallbacks(
      this.editingChannel.on('page:load', () => {
        if (!this.abTest?.rendering?.renderingInstanceId) {
          return;
        }

        this.editingChannel.emit('chrome:select', {
          id: this.abTest.rendering.renderingInstanceId,
          chromeType: 'rendering',
          shouldScrollIntoView: true,
        });
      }),
    );
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  ngAfterViewChecked() {
    if (this.nameInput?.nativeElement && document.activeElement !== this.nameInput.nativeElement) {
      this.nameInput?.nativeElement.focus();
    }
  }

  init() {
    if (!this.abTest) {
      return;
    }

    if (!this.abTest.flowDefinition.variants[0].isControl) {
      console.warn('! Variants are not sorted properly !', this.abTest.flowDefinition.variants);

      // TODO: Follow up. Temp fix to put default variant as first
      this.abTest.flowDefinition.variants.sort((a, b) => {
        if (a.isControl && !b.isControl) {
          return -1;
        }
        return 0;
      });
    }

    // TODO: Make sure to sort splits to follow the variants new order
    const originalSplits = [...this.abTest.flowDefinition.traffic.splits];
    this.abTest.flowDefinition.traffic.splits = [];
    this.abTest.flowDefinition.variants.forEach((variant) => {
      const splitMatch = originalSplits.find((splitItem) => splitItem.ref === variant.ref);
      if (splitMatch) {
        this.abTest.flowDefinition.traffic.splits.push(splitMatch);
      } else {
        this.abTest.flowDefinition.traffic.splits.push({
          ref: variant.ref,
          split: 0,
        });
      }
    });

    // After Canvas reload we want to switch to the context variant. So, we only change the selected index, but not update context.variant again
    const index = this.abTest.flowDefinition.variants.findIndex(
      (v) => getComponentVariantId(v) === this.contextService.variant,
    );
    this.selectedTestIndex = index !== -1 ? index : 0;

    this.isPagePublished = this.variantPublishedStatusService.isPagePublished(this.abTest.flowDefinition);

    this.showLiveTestEditWarning();

    this.isLoading = false;
  }

  async endTest() {
    this.endExperimentDialogService
      .show({
        variants: this.abTest.flowDefinition.variants,
        isStatisticalSignificanceReached: !!this.abTest.flowDefinition.result,
      })
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(async (variant) => {
        this.abTest.flowDefinition.status = 'COMPLETED';

        try {
          await this.abTestComponentService.updateComponentFlowDefinition(this.abTest.flowDefinition);
          const refetchFlowsPromise = this.abTestComponentService.refetchFlows(
            this.contextService.itemId,
            this.contextService.language,
          );
          await this.personalizationLayoutService.applyVariantAsDefaultSetup(
            this.abTest.rendering.renderingInstanceId,
            getComponentVariantId(variant),
            false,
          );
          await refetchFlowsPromise;

          this.contextService.updateContext({
            variant: undefined,
            itemVersion: this.contextService.itemVersion,
          });

          await this.showEndTestNotification();
        } catch {
          this.timedNotificationsService.push(
            'endTestError',
            this.translateService.get('COMPONENT_TESTING.END_TEST_ERROR'),
          );
        }
      });
  }

  isControlVariant() {
    return this.selectedTestIndex === 0;
  }

  getOtherVariantsNames() {
    const names = this.abTest.flowDefinition.variants
      .map((v) => v.name.trim())
      .filter((n) => n !== this.abTest.flowDefinition.variants[this.selectedTestIndex].name.trim());
    return names;
  }

  onBlurEditName(isNameValid: boolean) {
    if (isNameValid) {
      this.onSubmitEditName(true);
    } else {
      this.onCancelEditName();
    }
  }

  async onSubmitEditName(isNameValid: boolean): Promise<void> {
    if (!isNameValid) {
      return;
    }

    const currentName = this.abTest.flowDefinition.variants[this.selectedTestIndex].name;
    if (this.editedVariantName.trim() !== currentName) {
      this.abTest.flowDefinition.variants[this.selectedTestIndex].name = this.editedVariantName.trim();
      await this.abTestComponentService.updateComponentFlowDefinition(this.abTest.flowDefinition);
    }
    this.showEditVariantName = false;
  }

  onCancelEditName() {
    this.showEditVariantName = false;
  }

  selectTestVariant(index: number, variant?: BXComponentVariant) {
    this.selectedTestIndex = index;
    this.isLoading = true;
    const variantId = getComponentVariantId(variant);

    this.contextService.updateContext(
      {
        variant: index && variantId ? variantId : undefined,
        itemVersion: this.contextService.itemVersion,
      },
      {
        eventSource: 'AB_TEST_COMPONENT_HANDLER',
      },
    );
  }

  async addVariant() {
    const existingNames: string[] = [...this.abTest.flowDefinition.variants].map((variant) => variant.name.trim());
    let name = 'Variant ' + this.testIndex[this.abTest.flowDefinition.variants.length];
    if (existingNames.indexOf(name) !== -1) {
      name = 'Variant ' + uuid();
    }

    const newVariant = getVariantSection(name, this.abTest.rendering.renderingInstanceId);
    const variantsArrayLength = this.abTest.flowDefinition.variants.push(newVariant);
    this.abTest.flowDefinition.traffic.splits.push({
      ref: newVariant.ref,
      split: 0,
    });

    await this.abTestComponentService.updateComponentFlowDefinition(this.abTest.flowDefinition);
    this.selectTestVariant(variantsArrayLength - 1, newVariant);
  }

  getAppliedActionTranslationKey() {
    const actions = this.abTest.rendering.appliedPersonalizationActions;

    if (actions.includes('HideRenderingAction')) {
      return 'COMPONENT_TESTING.HIDE_COMPONENT_APPLIED';
    } else if (actions.includes('SetRenderingAction')) {
      return 'COMPONENT_TESTING.SWAP_COMPONENT_APPLIED';
    } else {
      return 'COMPONENT_TESTING.COPY_COMPONENT_APPLIED';
    }
  }

  async startTest() {
    this.abTest.flowDefinition.status = 'PUBLISHING';
    const updateFlowDefinitionResult = await this.personalizationAPIService.updateComponentFlowDefinition(
      this.abTest.flowDefinition,
    );

    if (
      !updateFlowDefinitionResult.requestIsInvalid &&
      !updateFlowDefinitionResult.apiIsBroken &&
      updateFlowDefinitionResult.data
    ) {
      // Update the status from PUBLISHING to the new status returned by the API response
      // API changes response from PUBLISHING to PRODUCTION
      this.abTest.flowDefinition.status = updateFlowDefinitionResult.data.status;
      this.variantPublishedStatusService.updateLivePageVariantsCheckStatus(true);
    } else {
      this.timedNotificationsService.push(
        'start-experiment-error',
        this.translateService.get('COMPONENT_TESTING.START.START_EXPERIMENT_ERROR'),
      );
    }
  }

  async copyComponent() {
    const renderingInstanceId = this.abTest.rendering.renderingInstanceId;
    const rendering = this.canvasServices.getCurrentLayout().findRendering(renderingInstanceId);
    if (this.isFEaasRendering(rendering?.id || '')) {
      await this.copyFeaasOrByocComponent(rendering?.dataSource, rendering?.parameters);
      return;
    }

    const currentDataSource = rendering?.dataSource;
    let newDataSource: string = '';

    if (!currentDataSource) {
      newDataSource = await this.assignDataSource();
    } else {
      try {
        newDataSource = await this.duplicateDataSource(currentDataSource);
      } catch {
        // if for any reason automatic data source creation fails - prompt user to choose/create manually
        newDataSource = await this.assignDataSource();
      }
    }

    if (!newDataSource) {
      return;
    }

    const variantId = getComponentVariantId(this.abTest.flowDefinition.variants[this.selectedTestIndex]);
    this.personalizationLayoutService.addSetDataSourcePersonalizationRule(
      renderingInstanceId,
      variantId,
      newDataSource,
    );
  }

  async hideComponent() {
    const renderingInstanceId = this.abTest.rendering.renderingInstanceId;
    const variantId = getComponentVariantId(this.abTest.flowDefinition.variants[this.selectedTestIndex]);

    this.personalizationLayoutService.addHideRenderingPersonalizationRule(renderingInstanceId, variantId);
  }

  async swapComponent() {
    this.allowedRenderingIds = [...this.abTest.rendering.parentPlaceholderChromeInfo.allowedRenderingIds];
    this.showSelectComponent = true;
  }

  async changeRenderingAndDataSourceForVariant(renderingId: string) {
    this.showSelectComponent = false;
    const variantId = getComponentVariantId(this.abTest.flowDefinition.variants[this.selectedTestIndex]);
    if (!variantId) {
      return;
    }

    const renderingDetailsDraft: RenderingInitializationDetails = {
      renderingId,
      instanceId: this.abTest.rendering.renderingInstanceId,
      placeholderKey: this.abTest.rendering.parentPlaceholderChromeInfo.placeholderKey,
      parameters: {},
      dataSource: null,
    };
    const context = {
      renderingDetails: renderingDetailsDraft,
      cancelRenderingInsert: false,
    };
    const insertRenderingDetails: RenderingInitializationContext =
      await this.personalizationLayoutService.invokeInsertRenderingAction(context);

    let dataSource = insertRenderingDetails.renderingDetails.dataSource;
    if (!dataSource) {
      const dataSourceSelect = await firstValueFrom(
        this.dataSourceDialogService.show({
          renderingId,
          mode: 'ChangeDatasource',
        }),
      );
      dataSource = dataSourceSelect.layoutRecord;
    }

    const renderingRulesUpdate: PersonlizedRenderingInfo = {
      renderingId,
      dataSource,
      renderingParameters: insertRenderingDetails?.renderingDetails.parameters,
    };
    await this.personalizationLayoutService.addRenderingDetailsPersonalizationRule(
      this.abTest.rendering.renderingInstanceId,
      variantId,
      renderingRulesUpdate,
      true,
    );
  }

  async changeRenderingDetailsForFEaasOrByocVariant(renderingId: string) {
    this.showSelectComponent = false;
    const variantId = getComponentVariantId(this.abTest.flowDefinition.variants[this.selectedTestIndex]);
    if (!variantId) {
      return;
    }

    const renderingInstanceId = this.abTest.rendering.renderingInstanceId;
    const renderingDetailsDraft: RenderingInitializationDetails = {
      renderingId,
      instanceId: renderingInstanceId,
      placeholderKey: this.abTest.rendering.parentPlaceholderChromeInfo.placeholderKey,
      parameters: {},
      dataSource: null,
    };
    const context = {
      renderingDetails: renderingDetailsDraft,
      cancelRenderingInsert: false,
    };

    const rendering = await this.feaasComponentService.populateRenderingDetails(context);

    const renderingRulesUpdate: PersonlizedRenderingInfo = {
      renderingId: rendering.renderingDetails.renderingId,
      dataSource: rendering.renderingDetails.dataSource,
      renderingParameters: rendering.renderingDetails.parameters,
    };
    await this.personalizationLayoutService.addRenderingDetailsPersonalizationRule(
      renderingInstanceId,
      variantId,
      renderingRulesUpdate,
      true,
    );
  }

  async changeDataSourceForVariant(): Promise<void> {
    const renderingId = this.abTest.rendering.appliedPersonalizationActions.includes('SetRenderingAction')
      ? this.getRuleActionRenderingId()
      : this.abTest.rendering.renderingDefinitionId;

    if (!renderingId) {
      return;
    }

    this.dataSourceDialogService
      .show({
        renderingId,
        mode: 'ChangeDatasource',
        select: this.abTest.rendering.contextItem.id,
      })
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((ds) => {
        const variantId = getComponentVariantId(this.abTest.flowDefinition.variants[this.selectedTestIndex]);
        this.personalizationLayoutService.addSetDataSourcePersonalizationRule(
          this.abTest.rendering.renderingInstanceId,
          variantId,
          ds.layoutRecord,
        );
      });
  }

  async deleteVariant(variant: BXComponentVariant) {
    const { component: dialog } = WarningDialogComponent.show(this.dialogService);

    dialog.title = await firstValueFrom(this.translateService.get('COMPONENT_TESTING.DELETE_VARIANT'));
    dialog.text = await firstValueFrom(
      this.translateService.get('COMPONENT_TESTING.DELETE_VARIANT_DESCRIPTION', {
        name: this.abTest.flowDefinition.name,
      }),
    );
    dialog.declineText = await firstValueFrom(this.translateService.get('COMMON.CANCEL'));
    dialog.confirmText = await firstValueFrom(this.translateService.get('COMMON.DELETE'));

    const dialogResult = await firstValueFrom(dialog.dialogResultEvent);
    if (dialogResult.confirmed) {
      await this.personalizationLayoutService.removePersonalizationRuleFromRendering(
        this.abTest.rendering.renderingInstanceId,
        getComponentVariantId(variant),
        false,
      );

      const newSplits = [...this.abTest.flowDefinition.traffic.splits].filter((item) => item.ref !== variant.ref);
      const newVariants = [...this.abTest.flowDefinition.variants].filter((item) => item.ref !== variant.ref);

      this.abTest.flowDefinition.variants = newVariants;
      this.abTest.flowDefinition.traffic.splits = newSplits;

      this.selectTestVariant(0);

      await this.abTestComponentService.updateComponentFlowDefinition(this.abTest.flowDefinition);
    }
  }

  async resetVariant(variant: BXComponentVariant) {
    const { component: dialog } = WarningDialogComponent.show(this.dialogService);

    dialog.title = await firstValueFrom(this.translateService.get('COMPONENT_TESTING.RESET_VARIANT'));
    dialog.text = await firstValueFrom(
      this.translateService.get('COMPONENT_TESTING.RESET_VARIANT_DESCRIPTION', {
        name: this.abTest.flowDefinition.name,
      }),
    );
    dialog.declineText = await firstValueFrom(this.translateService.get('COMMON.CANCEL'));
    dialog.confirmText = await firstValueFrom(this.translateService.get('COMMON.RESET'));

    const dialogResult = await firstValueFrom(dialog.dialogResultEvent);
    if (dialogResult.confirmed) {
      await this.personalizationLayoutService.removePersonalizationRuleFromRendering(
        this.abTest.rendering.renderingInstanceId,
        getComponentVariantId(variant),
      );
    }
  }

  async configureExperiment(): Promise<void> {
    if (!this.abTest.flowDefinition) {
      return;
    }

    const dialogResult = await firstValueFrom(
      this.configureExperimentDialogService.show({
        flowDefinition: this.abTest.flowDefinition,
        existingNames: this.getExistingFlowNames(this.abTest.flowDefinition.name),
        renderingInstanceId: this.abTest.rendering.renderingInstanceId,
      }),
    );
    if (dialogResult && dialogResult.status === 'OK') {
      Object.assign(this.abTest.flowDefinition, dialogResult.flowDefinition);

      await this.abTestComponentService.updateComponentFlowDefinition(this.abTest.flowDefinition);
    }
  }

  async deleteTest(): Promise<void> {
    if (!this.abTest.flowDefinition || this.abTest.flowDefinition.status !== 'DRAFT') {
      return;
    }

    const { component: dialog } = WarningDialogComponent.show(this.dialogService);

    dialog.title = await firstValueFrom(this.translateService.get('COMPONENT_TESTING.DELETE_EXPERIMENT_DIALOG.TITLE'));
    dialog.text = await firstValueFrom(
      this.translateService.get('COMPONENT_TESTING.DELETE_EXPERIMENT_DIALOG.TEXT', {
        name: this.abTest.flowDefinition.name,
      }),
    );
    dialog.declineText = await firstValueFrom(this.translateService.get('COMMON.CANCEL'));
    dialog.confirmText = await firstValueFrom(this.translateService.get('COMMON.DELETE'));

    const dialogResult = await firstValueFrom(dialog.dialogResultEvent);
    if (dialogResult.confirmed) {
      const deletedTestId = this.abTest.flowDefinition.friendlyId;
      this.abTest.flowDefinition = makeFlowNameUnique(this.abTest.flowDefinition);
      this.abTest.flowDefinition.archived = true;

      try {
        await this.abTestComponentService.updateComponentFlowDefinition(this.abTest.flowDefinition);
        const refetchFlowsPromise = this.abTestComponentService.refetchFlows(
          this.contextService.itemId,
          this.contextService.language,
        );
        await this.personalizationLayoutService.clearPersonalizationForRendering(
          this.abTest.rendering.renderingInstanceId,
          false,
          true,
        );
        const refetchedFlows = await refetchFlowsPromise;

        this.contextService.updateContext({
          variant: undefined,
          itemVersion: this.contextService.itemVersion,
        });

        if (LhsPanelComponent.Content.value === PageAbTestsDialogComponent) {
          this.abTestComponentService.selectedTest$.pipe(takeWhileAlive(this.lifetime)).subscribe((selectedTest) => {
            if (selectedTest?.friendlyId === deletedTestId || refetchedFlows.flows.length === 0) {
              LhsPanelComponent.show(null);
            }
          });
        }
      } catch {
        this.timedNotificationsService.push(
          'removeExperimentError',
          this.translateService.get('COMPONENT_TESTING.DELETE_EXPERIMENT_DIALOG.DELETE_ERROR'),
        );
      }
    }
  }

  isFEaasRendering(renderingId: string): boolean {
    return isSameGuid(renderingId, FEAAS_RENDERING_ID) || isSameGuid(renderingId, BYOC_RENDERING_ID);
  }

  async openAnalytics() {
    await this.abTestAnalyticsService.openAnalytics(this.abTest.flowDefinition.friendlyId);
  }

  private async showLiveTestEditWarning() {
    if (this.abTest.flowDefinition.status === 'PRODUCTION' && this.isPagePublished) {
      const text = await firstValueFrom(this.translateService.get('COMPONENT_TESTING.TEST_LIVE_ON_PAGE_WARNING'));
      const notification = new TimedNotification('test-live-warning', text, 'warning');

      this.timedNotificationsService.pushNotification(notification);
    }
  }

  private async getExistingFlowNames(currentName: string): Promise<string[]> {
    const flowDefinitionsResponse = await this.personalizationAPIService.getCurrentSiteFlowDefinitions();

    if (!flowDefinitionsResponse.apiIsBroken && flowDefinitionsResponse.data) {
      return flowDefinitionsResponse.data.map((flow) => flow.name).filter((name) => name !== currentName) || [];
    }

    return [];
  }

  private getRuleActionRenderingId(): string | undefined {
    const renderingInstanceId = this.abTest.rendering.renderingInstanceId;
    const rendering = this.canvasServices.getCurrentLayout().findRendering(renderingInstanceId);

    const variantId = getComponentVariantId(this.abTest.flowDefinition.variants[this.selectedTestIndex]);
    const rule = rendering?.personalization?.ruleSet?.rules.find((rule) => rule.name === variantId);

    if (!rule) {
      return undefined;
    }

    const renderingDefinitionId = rule.actions?.find((action) => !!action.renderingItem)?.renderingItem;
    return renderingDefinitionId;
  }

  private async copyFeaasOrByocComponent(sourceDataSource?: string | null, parameters?: Record<string, string>) {
    const variantId = getComponentVariantId(this.abTest.flowDefinition.variants[this.selectedTestIndex]);
    if (!variantId) {
      return;
    }

    let datasource: string | undefined;
    if (sourceDataSource) {
      datasource = await this.duplicateDataSource(sourceDataSource);
    }

    const renderingInstanceId = this.abTest.rendering.renderingInstanceId;
    const renderingRulesUpdate: PersonlizedRenderingInfo = {
      dataSource: datasource,
      renderingParameters: parameters,
    };
    await this.personalizationLayoutService.addRenderingDetailsPersonalizationRule(
      renderingInstanceId,
      variantId,
      renderingRulesUpdate,
      true,
    );
  }

  private async duplicateDataSource(dataSource: string): Promise<string> {
    const result = await this.dataSourcePickerService.duplicateDataSource(dataSource);
    return result.layoutRecord;
  }

  private async assignDataSource(): Promise<string> {
    const result = await firstValueFrom(
      this.dataSourceDialogService.show({
        renderingId: this.abTest.rendering.renderingDefinitionId,
        mode: 'ChangeDatasource',
      }),
    );
    return result.layoutRecord;
  }

  private async showEndTestNotification() {
    const testName = this.abTest.flowDefinition.name;

    const message = await firstValueFrom<string>(
      this.translateService.get('COMPONENT_TESTING.END_TEST_NOTIFICATION', { name: testName }),
    );
    const actonTitle = await firstValueFrom<string>(this.translateService.get('COMPONENT_TESTING.END_TEST_ACTION'));
    const notification = new TimedNotification('endTestSuccess', message, 'success');
    notification.action = { run: () => this.openAnalytics(), title: actonTitle };
    notification.persistent = true;
    notification.textColorVariant = 'success';
    this.timedNotificationsService.pushNotification(notification);
  }
}
