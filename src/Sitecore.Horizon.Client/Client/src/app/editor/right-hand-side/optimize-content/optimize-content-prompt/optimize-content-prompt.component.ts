/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CanvasPageStateManager } from 'app/editor/canvas-page/canvas-page-state-manager';
import { EditingMode, FieldsTrackerService } from 'app/editor/lhs-panel/data-view/fields-tracker.service';
import {
  createVariantsRequest,
  isFieldChromeInfo,
  isRenderingChromeInfo,
  mapVariantsToRecommendations,
  PromptContent,
} from 'app/editor/right-hand-side/optimize-content/services/utils';
import { VariantRecommendationApiService } from 'app/editor/right-hand-side/optimize-content/services/variant-recommendation.api.service';
import {
  Feedback,
  VariantsRequest,
  VariantsResponse,
} from 'app/editor/right-hand-side/optimize-content/services/variant-recommendation.types';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { CdpSiteDataService } from 'app/pages/left-hand-side/personalization/personalization-services/cdp-site-data.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { ChromeInfo, FieldChromeInfo, RenderingField } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { SiteApiService } from 'app/shared/rest/site/site.api.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { isSameGuid } from 'app/shared/utils/utils';
import { firstValueFrom, Subscription } from 'rxjs';
import { FieldState } from 'sdk';
import { RenderingFieldsService } from '../../rendering-details/rendering-fields.service';
import { ExperimentContentService } from '../create-experiment/experiment-content.service';
import { OptimizeContentPanelService } from '../optimize-content-panel/optimize-content-panel.service';
import { BrandManagementApiService } from '../services/brand-management.api.service';

interface PredefinedPrompt {
  text: string;
  icon?: string;
  code?: number;
  parentNodeId?: string;
  childNodes?: PredefinedPrompt[];
}

interface PromptHistory {
  promptText: string;
  displayName: string;
}

@Component({
  selector: 'app-optimize-content-prompt',
  templateUrl: './optimize-content-prompt.component.html',
  styleUrls: ['./optimize-content-prompt.component.scss'],
  //TODO this is workaround that needs to be removed when we swtich to Sites API
  providers: [SiteApiService],
})
export class OptimizeContentPromptComponent implements OnInit, OnDestroy {
  ADHERE_TO_BRANDKIT_CODE = 999;
  TRANSLATE_ACTION_CODE = 66;

  feedbackType: 'good' | 'bad' | null = null;
  displayPlaceholder: boolean = true;
  selectedParentId?: string;
  predefinedCode?: number;
  promptText = '';
  isContentOptimized = false;
  brandKitId: string | undefined;

  isStreamPaidEdition = false;

  contextLanguageName?: string | null = null;

  predefinedPrompts: PredefinedPrompt[] = [
    { code: 10, text: 'CONTENT_OPTIMIZATION.PROMPTS.IMPROVE_WRITING', icon: 'auto-fix' },
    { code: 20, text: 'CONTENT_OPTIMIZATION.PROMPTS.FIX_SPELLING', icon: 'spellcheck' },
    { code: 30, text: 'CONTENT_OPTIMIZATION.PROMPTS.MAKE_SHORTER', icon: 'text-short' },
    { code: 40, text: 'CONTENT_OPTIMIZATION.PROMPTS.MAKE_LONGER', icon: 'text-long' },
    { code: 50, text: 'CONTENT_OPTIMIZATION.PROMPTS.SUMMARIZE', icon: 'text-box-outline' },
    {
      text: 'CONTENT_OPTIMIZATION.PROMPTS.CHANGE_TONE',
      icon: 'microphone-variant',
      parentNodeId: 'changeTone',
      childNodes: [
        { code: 61, text: 'CONTENT_OPTIMIZATION.PROMPTS.FORMAL', icon: 'briefcase-outline' },
        { code: 62, text: 'CONTENT_OPTIMIZATION.PROMPTS.CASUAL', icon: 'shoe-sneaker' },
        { code: 64, text: 'CONTENT_OPTIMIZATION.PROMPTS.INFORMATIVE', icon: 'book-open-page-variant-outline' },
        { code: 65, text: 'CONTENT_OPTIMIZATION.PROMPTS.FRIENDLY', icon: 'emoticon-outline' },
        { code: 63, text: 'CONTENT_OPTIMIZATION.PROMPTS.BOLD', icon: 'bullhorn-outline' },
      ],
    },
    {
      code: this.TRANSLATE_ACTION_CODE,
      text: 'CONTENT_OPTIMIZATION.PROMPTS.TRANSLATE',
      parentNodeId: 'translate',
      icon: 'translate',
      childNodes: [],
    },
    {
      code: this.ADHERE_TO_BRANDKIT_CODE,
      text: 'CONTENT_OPTIMIZATION.PROMPTS.ADHERE_TO_BRANDKIT',
      icon: 'briefcase-outline',
    },
  ];

  private requestSubscription?: Subscription;
  private readonly lifetime = new Lifetime();

  private _chrome?: ChromeInfo;
  @Input()
  get chrome(): ChromeInfo | undefined {
    return this._chrome;
  }
  set chrome(value: ChromeInfo | undefined) {
    this._chrome = value;
  }

  optimizedVariants: VariantsResponse | null = null;
  fieldValues: RenderingField[] = [];

  promptValue: PromptContent | null = null;
  aiRecommendations: Array<{
    fieldId: string;
    fieldName: string;
    textValue: string;
  }> = [];

  isProcessing = false;

  hasApiError?: boolean;
  enableAbTest: boolean;

  isFeedbackSent: boolean = false;
  isFeedbackNotificationVisible: boolean = false;

  lastAppliedPromptText: string | null = null;
  lastAppliedDisplayName: string | null = null;

  promptHistory: PromptHistory[] = [];

  isLoading$: WritableSignal<boolean> = signal(false);
  brandKitName$: WritableSignal<string> = signal('');

  get editingMode(): EditingMode {
    return this.canvasPageStateManager.getCurrentMode();
  }

  constructor(
    private readonly variantRecommendationApiService: VariantRecommendationApiService,
    private readonly contextService: ContextService,
    private readonly translateService: TranslateService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly cdpSiteDataService: CdpSiteDataService,
    private readonly siteService: SiteService,
    private readonly fieldsTrackerService: FieldsTrackerService,
    private readonly optimizeContentPanelService: OptimizeContentPanelService,
    private readonly renderingFieldsService: RenderingFieldsService,
    private readonly canvasPageStateManager: CanvasPageStateManager,
    private readonly experimentContentService: ExperimentContentService,
    private readonly siteApiService: SiteApiService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly brandManagementService: BrandManagementApiService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoading$.set(true);

    this.enableAbTest = await this.shouldEnableAbTest();

    this.contextService.siteName$.pipe(takeWhileAlive(this.lifetime)).subscribe(async (siteName) => {
      this.isStreamPaidEdition = ConfigurationService.isStreamPaidEdition();

      if (this.isStreamPaidEdition) {
        this.brandKitId = await this.getBrandKitId();
      }

      if (this.brandKitId) {
        this.brandKitName$.set(await this.getBrandKitName(this.brandKitId));
      }

      this.contextLanguageName = this.siteService
        .getSiteLanguages(siteName)
        .find((l) => l.name === this.contextService.language)?.englishName;

      this.updateTranslatePrompt(siteName);
      this.isLoading$.set(false);
    });
  }

  ngOnDestroy(): void {
    this.requestSubscription?.unsubscribe();
    this.lifetime.dispose();
  }

  onInput(event: Event): void {
    const content = (event.target as HTMLElement).innerText ?? '';
    this.promptText = content.trim();
  }

  selectAction(text: string, code?: number): void {
    this.predefinedCode = code;
    this.promptText = text;
    this.generateResponse();
  }

  showChildNodes(parentId?: string): void {
    this.selectedParentId = parentId ?? this.selectedParentId;
    this.predefinedPrompts.forEach((prompt) => {
      if (prompt.parentNodeId === this.selectedParentId) {
        prompt.childNodes = prompt.childNodes?.map((child) => {
          return {
            ...child,
            text: this.translateService.instant(child.text),
          };
        });
      }
    });
  }

  hasChildNodes(prompt: PredefinedPrompt): boolean {
    return !!prompt.childNodes && prompt.childNodes.length > 0;
  }

  async generateResponse(): Promise<void> {
    this.resetFeedback();

    this.promptValue = {
      text: this.predefinedCode ? '' : this.promptText,
      code: this.getPromptCode(),
      language: this.selectedParentId === 'translate' ? this.promptText : undefined,
    };

    this.isProcessing = true;
    this.lastAppliedPromptText = this.promptText;
    this.promptText = '';

    const renderingInstanceId = await this.extractRenderingData();
    if (!renderingInstanceId) {
      this.isProcessing = false;
      return;
    }

    const request: VariantsRequest = createVariantsRequest(
      renderingInstanceId,
      this.promptValue,
      this.fieldValues,
      await this.getBrandKitId(),
    );

    this.requestSubscription = this.variantRecommendationApiService
      .getVariants(request)
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(async (optimizedVariants) => {
        this.handleApiResponse(optimizedVariants);
        if (!this.hasApiError) {
          this.setMode('draft');
          await this.saveFields();
        }

        this.isContentOptimized = true;
        this.isProcessing = false;
        this.predefinedCode = undefined;

        this.promptHistory.push({
          promptText: this.lastAppliedPromptText!,
          displayName: this.lastAppliedDisplayName!,
        });
      });
  }

  getPredefinedPrompt(): PredefinedPrompt[] {
    return this.predefinedPrompts.map((prompt) => ({
      ...prompt,
      text: this.translateService.instant(prompt.text),
    }));
  }

  KeepChanges(): void {
    this.canvasPageStateManager.KeepDraftChanges();
    this.optimizeContentPanelService.closePanel();
  }

  giveFeedback(feedbackType: 'good' | 'bad'): void {
    if (!this.optimizedVariants?.id) {
      return;
    }

    if (feedbackType === 'good' && this.isFeedbackSent) {
      return;
    }

    const feedback: Feedback = {
      type: feedbackType,
      message: feedbackType === 'good' ? 'Positive feedback' : 'Negative feedback',
      reason: '',
      categories: ['content'],
    };

    this.variantRecommendationApiService
      .updateVariant(this.optimizedVariants, feedback)
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((response) => {
        if (response.success) {
          this.isFeedbackSent = true;
          this.feedbackType = feedbackType;
          this.isFeedbackNotificationVisible = true;
        } else {
          this.showErrorNotfication(
            'feedbackSubmissionError',
            'CONTENT_OPTIMIZATION.FEEDBACK_SUBMISSION_FALIED',
            response.error || 'Unknown error',
          );
        }
      });
  }

  resetFeedback(): void {
    this.isFeedbackSent = false;
    this.isFeedbackNotificationVisible = false;
  }

  resetViewState(): void {
    this.requestSubscription?.unsubscribe();
    this.isProcessing = false;
    this.promptValue = null;
    this.resetFeedback();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        // Allow default behavior to move cursor to the next line
        return;
      } else {
        event.preventDefault();
        if (!!this.promptText) {
          this.generateResponse();
        }
      }
    }
  }

  async promptCreateAbTest(): Promise<void> {
    const renderingChrome = isRenderingChromeInfo(this.chrome) ? this.chrome : this.chrome?.parentRenderingChromeInfo;

    if (!renderingChrome) {
      console.warn('Can not find rendering chrome');
      return;
    }

    const renderingFields = this.canvasPageStateManager
      .getActivePageState()
      .getStateSnapshot()
      .fields?.filter((field) => isSameGuid(field.itemId, renderingChrome.contextItem.id));
    const result = await this.experimentContentService.setupExperimentForContent(renderingChrome, renderingFields);
    if (result.isSuccessful) {
      this.canvasPageStateManager.discardDraftChanges(false);
      this.optimizeContentPanelService.closePanel();
      this.contextService.updateContext({ itemVersion: this.contextService.itemVersion, variant: result.variantBId });
    }
  }

  setMode(editingMode: EditingMode): void {
    this.fieldsTrackerService.setEditingMode(editingMode);
  }

  getBrandkitTooltipText(): string {
    if (this.isStreamPaidEdition) {
      return this.brandKitId
        ? 'CONTENT_OPTIMIZATION.BRAND_KIT_ADHERENCE'
        : 'CONTENT_OPTIMIZATION.BRAND_KIT_NOT_AVAILABLE';
    }

    return 'CONTENT_OPTIMIZATION.PROMPTS.ADHERE_TO_BRANDKIT';
  }

  onPromptClick(prompt: PredefinedPrompt): void {
    if (this.hasChildNodes(prompt) || prompt.code === this.TRANSLATE_ACTION_CODE) {
      this.showChildNodes(prompt.parentNodeId);
    } else {
      this.selectAction(prompt.text, prompt.code);
    }
  }

  private async shouldEnableAbTest(): Promise<boolean> {
    if (isRenderingChromeInfo(this.chrome)) {
      return !(await this.isPersonalizedRendering(this.chrome.renderingInstanceId));
    }

    if (isFieldChromeInfo(this.chrome)) {
      const parentInstanceId = this.chrome.parentRenderingChromeInfo?.renderingInstanceId;
      return !!parentInstanceId && !(await this.isPersonalizedRendering(parentInstanceId));
    }

    return false;
  }

  private async isPersonalizedRendering(renderingInstanceId: string) {
    const cdpSiteConfig = await firstValueFrom(this.cdpSiteDataService.watchCdpSiteData());

    const pageHasPersonalization =
      this.contextService.variant && cdpSiteConfig.hasPagePersonalization(this.contextService.itemId);
    const componentHasAbTest = cdpSiteConfig.hasComponentAbTest(this.contextService.itemId, renderingInstanceId, false);

    return pageHasPersonalization || componentHasAbTest;
  }

  private async extractRenderingData(): Promise<string | undefined> {
    if (isRenderingChromeInfo(this.chrome)) {
      this.fieldValues = await this.renderingFieldsService.fetchTextRenderingFields(this.chrome);
      this.lastAppliedDisplayName = await firstValueFrom(
        this.translateService.get('CONTENT_OPTIMIZATION.WHOLE_COMPONENT'),
      );
      return this.chrome.renderingInstanceId;
    }

    if (isFieldChromeInfo(this.chrome)) {
      const parentChrome = this.chrome.parentRenderingChromeInfo;
      if (parentChrome) {
        const parentFields = await this.renderingFieldsService.fetchTextRenderingFields(parentChrome);
        this.fieldValues = parentFields.filter((field) => field.fieldId === (this.chrome as FieldChromeInfo).fieldId);
      }
      this.lastAppliedDisplayName = this.chrome?.displayName;
      return parentChrome?.renderingInstanceId;
    }

    return undefined;
  }

  private handleApiResponse(optimizedVariants: VariantsResponse) {
    this.hasApiError = optimizedVariants.apiError;

    if (this.hasApiError) {
      this.showErrorNotfication('optimizeContentPromptApiError', 'CONTENT_OPTIMIZATION.API_ERROR_MESSAGE');
      return;
    }
    if (optimizedVariants && optimizedVariants.variants) {
      this.optimizedVariants = optimizedVariants;
      this.aiRecommendations = mapVariantsToRecommendations(optimizedVariants, this.fieldValues).map((item) => {
        // Strip HTML tags for text values
        if (this.getFieldType(item.fieldId) !== 'rich text') {
          const tmpDivEl = document.createElement('div');
          tmpDivEl.innerHTML = item.textValue;
          item.textValue = tmpDivEl.textContent || tmpDivEl.innerText || item.textValue;
          tmpDivEl.remove();
        }
        return item;
      });
    } else {
      this.aiRecommendations = [];
    }
  }

  private async saveFields(): Promise<void> {
    const fieldState: FieldState[] = this.aiRecommendations.map((field) => {
      let rawValue = field.textValue || '';

      if (this.getFieldType() === 'rich text') {
        rawValue = rawValue.replace(/\r?\n/g, '<br>');
      }

      return {
        fieldId: field.fieldId,
        value: { rawValue },
        itemId: this.chrome?.contextItem.id,
        itemVersion: this.chrome?.contextItem.version,
        reset: false,
      } as FieldState;
    });
    this.fieldsTrackerService.notifyFieldValueChange(fieldState);
  }

  private getFieldType(fieldId?: string): string | undefined {
    const matchingField = this.fieldValues?.find((field) => {
      if (fieldId) {
        return field.fieldId === fieldId;
      } else {
        return this.aiRecommendations.some((recommendation) => recommendation.fieldId === field.fieldId);
      }
    });

    return matchingField?.fieldType;
  }

  private showErrorNotfication(notificationKey: string, translationKey: string, error?: unknown) {
    console.warn(`Error ${notificationKey}`, error);
    this.timedNotificationsService.push(notificationKey, this.translateService.get(translationKey), 'error');
  }

  private async getBrandKitId() {
    if (this.featureFlagsService.isXmAppsSitesApiEnabledAndSupported()) {
      return this.siteService.getContextSite()?.brandKitId;
    }

    // This needs to be removed when we switch to Sites API
    const siteId = this.siteService.getSiteByName(this.contextService.siteName)?.id;
    if (siteId) {
      return (await firstValueFrom(this.siteApiService.getSiteById(siteId, this.contextService.siteName))).brandKitId;
    }
    return undefined;
  }

  private async getBrandKitName(brandKitId: string): Promise<string> {
    return (await firstValueFrom(this.brandManagementService.getBrandKit({ brandKitId }))).name;
  }

  private updateTranslatePrompt(siteName: string): void {
    const translatePrompt = this.predefinedPrompts.find(({ code }) => code === this.TRANSLATE_ACTION_CODE);
    if (!translatePrompt) {
      return;
    }

    const languages = this.siteService.getSiteLanguages(siteName) || [];
    translatePrompt.childNodes = languages.map(({ englishName, displayName }) => ({
      text: englishName ?? displayName,
    }));
  }

  private getPromptCode() {
    if (this.predefinedCode === this.ADHERE_TO_BRANDKIT_CODE) {
      return undefined;
    }

    return this.selectedParentId === 'translate' ? this.TRANSLATE_ACTION_CODE : this.predefinedCode;
  }
}
