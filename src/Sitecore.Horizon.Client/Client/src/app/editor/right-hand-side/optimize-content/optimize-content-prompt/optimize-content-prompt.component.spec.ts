/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  ButtonModule,
  DialogModule,
  HorizontalBarsLoadingIndicatorModule,
  IconButtonModule,
  ListModule,
  LoadingIndicatorModule,
  PopoverModule,
  TabsModule,
} from '@sitecore/ng-spd-lib';
import { FieldsTrackerService } from 'app/editor/lhs-panel/data-view/fields-tracker.service';
import { VariantRecommendationApiService } from 'app/editor/right-hand-side/optimize-content/services/variant-recommendation.api.service';
import { VariantsResponse } from 'app/editor/right-hand-side/optimize-content/services/variant-recommendation.types';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import {
  cdpSiteData,
  CdpSiteDataService,
} from 'app/pages/left-hand-side/personalization/personalization-services/cdp-site-data.service';
import {
  CanvasPageStateManagerTesting,
  CanvasPageStateManagerTestingModule,
} from 'app/shared/client-state/canvas-page-state-manager.testing';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { SiteApiService } from 'app/shared/rest/site/site.api.service';
import { Language, Site, SiteService } from 'app/shared/site-language/site-language.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { firstValueFrom, Observable, of } from 'rxjs';
import { RenderingFieldsService } from '../../rendering-details/rendering-fields.service';
import { CreateExperimentDialogService } from '../../test-component/create-experiment-dialog/create-experiment-dialog.service';
import { ExperimentContentService } from '../create-experiment/experiment-content.service';
import { OptimizeContentPanelService } from '../optimize-content-panel/optimize-content-panel.service';
import { BrandManagementApiService } from '../services/brand-management.api.service';
import { OptimizeContentPromptComponent } from './optimize-content-prompt.component';

const mockRnderingChrome: RenderingChromeInfo = {
  contextItem: {
    id: 'test-id',
    version: 1,
    language: 'en',
  },
  chromeType: 'rendering',
  renderingInstanceId: 'test-instance-id',
  renderingDefinitionId: 'test-rendering-definition-id',
  isPersonalized: false,
  appliedPersonalizationActions: [],
  inlineEditorProtocols: [],

  parentPlaceholderChromeInfo: {
    chromeType: 'placeholder',
    placeholderKey: 'test-placeholder-key',
    name: 'Test Placeholder',
    displayName: 'Test Placeholder Display Name',

    chromeId: 'test-parent-chrome-id',
    allowedRenderingIds: [],
    contextItem: {
      id: 'test-context-item-id',
      version: 1,
      language: 'en',
    },
  },
  displayName: 'Test Display Name',
  compatibleRenderings: [],
  chromeId: 'test-chrome-id',
};

const testLanguages: Language[] = [
  { displayName: 'French', name: 'fr', nativeName: 'Français', iso: 'fr', englishName: 'French' },
  { displayName: 'English', name: 'en', nativeName: 'English', iso: 'en', englishName: 'English' },
  {
    name: 'pt-BR',
    displayName: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    iso: 'pt-BR',
    englishName: 'Portuguese (Brazil)',
  },
];

describe(OptimizeContentPromptComponent.name, () => {
  let sut: OptimizeContentPromptComponent;
  let fixture: ComponentFixture<OptimizeContentPromptComponent>;
  let variantRecommendationApiServiceSpy: jasmine.SpyObj<VariantRecommendationApiService>;
  let cdpSiteDataServiceSpy: jasmine.SpyObj<CdpSiteDataService>;
  let renderingFieldsServiceSpy: jasmine.SpyObj<RenderingFieldsService>;
  let fieldsTrackerServiceSpy: jasmine.SpyObj<FieldsTrackerService>;
  let optimizeContentPanelServiceSpy: jasmine.SpyObj<OptimizeContentPanelService>;
  let createExperimentDialogServiceSpy: jasmine.SpyObj<CreateExperimentDialogService>;
  let timedNotificationServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let canvasPageStateManager: CanvasPageStateManagerTesting;
  let siteApiServiceSpy: jasmine.SpyObj<SiteApiService>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;
  let brandManagementApiServiceSpy: jasmine.SpyObj<BrandManagementApiService>;
  let context: ContextServiceTesting;
  let siteServiceSpy: jasmine.SpyObj<SiteService>;

  beforeEach(async(() => {
    cdpSiteDataServiceSpy = jasmine.createSpyObj('CdpSiteDataService', {
      watchCdpSiteData: of({
        hasPagePersonalization: () => false,
        hasPageWithAbTest: () => false,
        hasComponentAbTest: () => false,
      } as cdpSiteData),
    });

    TestBed.configureTestingModule({
      declarations: [OptimizeContentPromptComponent],
      imports: [
        CommonModule,
        TranslateModule,
        TabsModule,
        DialogModule,
        IconButtonModule,
        ButtonModule,
        TranslateServiceStubModule,
        HttpClientTestingModule,
        StaticConfigurationServiceStubModule,
        PopoverModule,
        BrowserAnimationsModule,
        ListModule,
        HorizontalBarsLoadingIndicatorModule,
        CanvasPageStateManagerTestingModule,
        ContextServiceTestingModule,
        LoadingIndicatorModule,
      ],
      providers: [
        {
          provide: VariantRecommendationApiService,
          useValue: jasmine.createSpyObj('VariantRecommendationApiService', ['getVariants', 'updateVariant']),
        },
        {
          provide: CdpSiteDataService,
          useValue: cdpSiteDataServiceSpy,
        },
        {
          provide: RenderingFieldsService,
          useValue: jasmine.createSpyObj('RenderingFieldsService', ['fetchTextRenderingFields']),
        },
        {
          provide: CreateExperimentDialogService,
          useValue: jasmine.createSpyObj<CreateExperimentDialogService>('CreateExperimentDialogService', [
            'promptCreateAbTestComponent',
            'show',
          ]),
        },
        {
          provide: FieldsTrackerService,
          useValue: jasmine.createSpyObj<FieldsTrackerService>('FieldsTrackerService', [
            'watchFieldsValueChange',
            'notifyFieldValueChange',
            'setEditingMode',
            'watchEditingMode',
            'watchInitialItemFieldsState',
          ]),
        },
        {
          provide: OptimizeContentPanelService,
          useValue: jasmine.createSpyObj<OptimizeContentPanelService>('OptimizeContentPanelService', [
            'openPanel',
            'closePanel',
          ]),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', [
            'pushNotification',
            'push',
          ]),
        },
        {
          provide: ExperimentContentService,
          useValue: jasmine.createSpyObj<ExperimentContentService>('ExperimentContentService', [
            'setupExperimentForContent',
          ]),
        },
        {
          provide: SiteApiService,
          useValue: jasmine.createSpyObj<SiteApiService>('SiteApiService', ['getSiteById']),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', [
            'isFeatureEnabled',
            'isXmAppsSitesApiEnabledAndSupported',
          ]),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('SiteService', [
            'getContextSite',
            'getSiteByName',
            'getSiteLanguages',
          ]),
        },
        {
          provide: BrandManagementApiService,
          useValue: jasmine.createSpyObj<BrandManagementApiService>('BrandManagementApiService', ['getBrandKit']),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    timedNotificationServiceSpy = TestBedInjectSpy(TimedNotificationsService);
    optimizeContentPanelServiceSpy = TestBedInjectSpy(OptimizeContentPanelService);
    fieldsTrackerServiceSpy = TestBedInjectSpy(FieldsTrackerService);
    fieldsTrackerServiceSpy.watchFieldsValueChange.and.returnValue(of([]));
    variantRecommendationApiServiceSpy = TestBedInjectSpy(VariantRecommendationApiService);
    variantRecommendationApiServiceSpy.getVariants.and.returnValue(
      of({
        id: 'mockResponseId',
        variants: [
          {
            id: 'variant1',
            fields: [{ name: 'field1', value: 'value1' }],
          },
        ],
      }),
    );
    variantRecommendationApiServiceSpy.updateVariant.and.returnValue(of({ success: true }));

    brandManagementApiServiceSpy = TestBedInjectSpy(BrandManagementApiService);
    brandManagementApiServiceSpy.getBrandKit.and.returnValue(of({ name: 'MockBrandKit', id: 'mock-brand-kit-id' }));

    createExperimentDialogServiceSpy = TestBedInjectSpy(CreateExperimentDialogService);
    createExperimentDialogServiceSpy.promptCreateAbTestComponent.and.returnValue(Promise.resolve(null));

    renderingFieldsServiceSpy = TestBedInjectSpy(RenderingFieldsService);
    renderingFieldsServiceSpy.fetchTextRenderingFields.and.returnValue(
      Promise.resolve([
        {
          name: 'field1',
          value: 'Test value',
          fieldType: 'text',
          fieldId: '1',
          fieldName: 'Field 1',
          textValue: 'Test value',
        },
        {
          name: 'field2',
          value: 'Test value2',
          fieldType: 'text',
          fieldId: '2',
          fieldName: 'Field 2',
          textValue: 'Test value2',
        },
      ]),
    );

    canvasPageStateManager = TestBed.inject(CanvasPageStateManagerTesting);
    canvasPageStateManager.provideDefaultTestState();
    canvasPageStateManager.setTestMode('persist');

    siteApiServiceSpy = TestBedInjectSpy(SiteApiService);
    siteApiServiceSpy.getSiteById.and.returnValue(of({ brandKitId: 'mockBrandKitId' } as Site));

    siteServiceSpy = TestBedInjectSpy(SiteService);
    siteServiceSpy.getContextSite.and.returnValue({ brandKitId: 'mockBrandKitId' } as Site);
    siteServiceSpy.getSiteByName.and.returnValue({ id: 'rootItemId001' } as Site);
    siteServiceSpy.getSiteLanguages.and.returnValue(testLanguages);

    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);
    featureFlagsServiceSpy.isXmAppsSitesApiEnabledAndSupported.and.returnValue(true);

    context = TestBed.inject(ContextServiceTesting);
    context.provideDefaultTestContext();

    fixture = TestBed.createComponent(OptimizeContentPromptComponent);
    sut = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    sut.promptHistory = [];
  });

  describe('Initialization', () => {
    it('should initialize correctly', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };

      // Act
      await sut.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(sut.enableAbTest).toBe(true);
    });

    it('should initialize correctly with no chrome', async () => {
      // Act
      await sut.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(sut.enableAbTest).toBe(false);
    });
  });

  describe('Predefined Prompts', () => {
    it('should update translate prompt with site languages', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };

      // Act
      await sut.ngOnInit();
      fixture.detectChanges();

      // Assert
      const translatePrompt = sut.predefinedPrompts.find(({ code }) => code === sut.TRANSLATE_ACTION_CODE);
      expect(translatePrompt).toBeDefined();
      expect(translatePrompt?.childNodes?.length).toBe(3);
      expect(translatePrompt?.childNodes?.[0].text).toBe('French');
      expect(translatePrompt?.childNodes?.[1].text).toBe('English');
      expect(translatePrompt?.childNodes?.[2].text).toBe('Portuguese (Brazil)');
    });

    it('should send correct prompt text to API request', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      sut.predefinedCode = undefined;
      sut.promptText = 'Test prompt';

      // Act
      await sut.generateResponse();
      fixture.detectChanges();

      // Assert
      expect(variantRecommendationApiServiceSpy.getVariants).toHaveBeenCalledWith(
        jasmine.objectContaining({
          prompt: 'Test prompt',
        }),
      );
    });

    it('should send correct prompt code to API request', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      sut.predefinedCode = 30;

      // Act
      await sut.generateResponse();
      fixture.detectChanges();

      // Assert
      expect(variantRecommendationApiServiceSpy.getVariants).toHaveBeenCalledWith(
        jasmine.objectContaining({
          predefinedPrompt: 30,
        }),
      );
    });

    it('should send correct prompt code with language to API request for translate', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      sut.predefinedCode = sut.TRANSLATE_ACTION_CODE;
      sut.selectedParentId = 'translate';
      sut.promptText = 'French';

      // Act
      await sut.generateResponse();
      fixture.detectChanges();

      // Assert
      expect(variantRecommendationApiServiceSpy.getVariants).toHaveBeenCalledWith(
        jasmine.objectContaining({
          predefinedPrompt: sut.TRANSLATE_ACTION_CODE,
          language: 'French',
        }),
      );
    });

    it('should render child nodes correctly based on selectedParentId and hasChildNodes', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      await sut.ngOnInit();
      sut.selectedParentId = 'changeTone';
      fixture.detectChanges();

      // Act
      const childNodes = fixture.nativeElement.querySelectorAll('.child-item');

      // Assert
      expect(sut.selectedParentId).toBe('changeTone');
      expect(childNodes.length).toBe(5);
      expect(childNodes[0].textContent.trim()).toBe('CONTENT_OPTIMIZATION.PROMPTS.FORMAL');
      expect(childNodes[1].textContent.trim()).toBe('CONTENT_OPTIMIZATION.PROMPTS.CASUAL');
      expect(childNodes[2].textContent.trim()).toBe('CONTENT_OPTIMIZATION.PROMPTS.INFORMATIVE');
      expect(childNodes[3].textContent.trim()).toBe('CONTENT_OPTIMIZATION.PROMPTS.FRIENDLY');
      expect(childNodes[4].textContent.trim()).toBe('CONTENT_OPTIMIZATION.PROMPTS.BOLD');
    });

    it('should render sites languages when selectedParentId is translate', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      await sut.ngOnInit();
      sut.selectedParentId = 'translate';
      fixture.detectChanges();

      // Act
      const childNodes = fixture.nativeElement.querySelectorAll('.child-item');

      // Assert
      expect(childNodes.length).toBe(3);
      expect(childNodes[0].textContent.trim()).toBe('French');
      expect(childNodes[1].textContent.trim()).toBe('English');
      expect(childNodes[2].textContent.trim()).toBe('Portuguese (Brazil)');
    });

    it('should render single language message when selectedParentId is translate and no child nodes', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      siteServiceSpy.getSiteLanguages.and.returnValue([
        {
          name: 'pt-BR',
          displayName: 'Portuguese (Brazil)',
          nativeName: 'Português (Brasil)',
          iso: 'pt-BR',
          englishName: 'Portuguese (Brazil)',
        },
      ]);
      await sut.ngOnInit();

      sut.selectedParentId = 'translate';
      fixture.detectChanges();

      // Act
      const singleLanguageMessage = fixture.nativeElement.querySelector('.single-language-message');

      // Assert
      expect(singleLanguageMessage).toBeTruthy();
      expect(singleLanguageMessage.textContent.trim()).toContain('CONTENT_OPTIMIZATION.SINGLE_LANGUAGE_IN_SITE');
    });
  });

  describe('Response Generation', () => {
    it('should generate response correctly', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      sut.promptText = 'Test prompt';

      // Act
      await sut.generateResponse();
      fixture.detectChanges();

      // Assert
      expect(sut.isProcessing).toBe(false);
      expect(sut.predefinedCode).toBeUndefined();
    });

    it('should pass properly mapped field values to API request', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      sut.promptText = 'Test prompt';

      // Act
      await sut.generateResponse();
      fixture.detectChanges();

      // Assert
      expect(variantRecommendationApiServiceSpy.getVariants).toHaveBeenCalledWith(
        jasmine.objectContaining({
          prompt: 'Test prompt',
          numberOfVariants: 1,
          componentId: 'test-instance-id',
          fields: [
            {
              name: '1',
              value: 'Test value',
            },
            {
              name: '2',
              value: 'Test value2',
            },
          ],
        }),
      );
    });

    it('should handle API response correctly', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      const optimizedVariants: VariantsResponse = {
        id: 'mockResponseId',
        variants: [
          {
            id: 'variant1',
            fields: [{ name: 'field1', value: 'value1' }],
          },
        ],
      };

      // Act
      await sut.generateResponse();
      fixture.detectChanges();

      // Assert
      expect(sut.optimizedVariants).toEqual(optimizedVariants);
      expect(sut.aiRecommendations.length).toBe(1);
    });

    it('should save fields correctly and set mode to draft', async () => {
      // Arrange
      sut.aiRecommendations = [{ fieldId: 'test-field', fieldName: 'Test Field', textValue: 'Test value' }];
      sut.chrome = { ...mockRnderingChrome };

      // Act
      await sut.generateResponse();
      fixture.detectChanges();

      // Assert
      expect(fieldsTrackerServiceSpy.notifyFieldValueChange).toHaveBeenCalled();
      expect(fieldsTrackerServiceSpy.setEditingMode).toHaveBeenCalledWith('draft');
    });

    it('should show error notification if API error occurs', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      const optimizedVariants: VariantsResponse = {
        id: 'mockResponseId',
        apiError: true,
        variants: [],
      };
      variantRecommendationApiServiceSpy.getVariants.and.returnValue(of(optimizedVariants));

      // Act
      await sut.generateResponse();
      fixture.detectChanges();

      // Assert

      const [id, text$, severity] = timedNotificationServiceSpy.push.calls.mostRecent().args;
      const text = await firstValueFrom(text$ as Observable<string>);
      expect(text).toBe('CONTENT_OPTIMIZATION.API_ERROR_MESSAGE');
      expect(severity).toBe('error');
      expect(id).toBe('optimizeContentPromptApiError');

      expect(sut.isProcessing).toBe(false);
      expect(sut.predefinedCode).toBeUndefined();
    });

    it('should add to prompt history when response is generated', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      sut.promptText = 'Test prompt';

      // Act
      await sut.generateResponse();
      fixture.detectChanges();

      // Assert
      expect(sut.promptHistory.length).toBe(1);
      expect(sut.promptHistory[0].promptText).toBe('Test prompt');
      expect(sut.promptHistory[0].displayName).toBe('CONTENT_OPTIMIZATION.WHOLE_COMPONENT');
    });

    it('should handle child nodes in predefined prompts correctly', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      sut.showChildNodes('changeTone');

      // Act
      fixture.detectChanges();

      // Assert
      expect(sut.selectedParentId).toBe('changeTone');
    });
  });

  describe('Feedback Handling', () => {
    it('should handle feedback correctly', () => {
      // Arrange
      const optimizedVariants: VariantsResponse = {
        id: 'mockResponseId',
        variants: [
          {
            id: 'variant1',
            fields: [{ name: 'field1', value: 'value1' }],
          },
        ],
      };
      sut.optimizedVariants = optimizedVariants;

      // Act
      sut.giveFeedback('good');
      fixture.detectChanges();

      // Assert
      expect(variantRecommendationApiServiceSpy.updateVariant).toHaveBeenCalled();
    });

    it('should reset feedback correctly', () => {
      // Arrange
      // Act
      sut.resetFeedback();

      // Assert
      expect(sut.isFeedbackSent).toBe(false);
      expect(sut.isFeedbackNotificationVisible).toBe(false);
    });

    it('should show error notification if feedback submission fails', async () => {
      // Arrange
      const optimizedVariants: VariantsResponse = {
        id: 'mockResponseId',
        variants: [
          {
            id: 'variant1',
            fields: [{ name: 'field1', value: 'value1' }],
          },
        ],
      };
      sut.optimizedVariants = optimizedVariants;
      variantRecommendationApiServiceSpy.updateVariant.and.returnValue(of({ success: false, error: 'Error' }));

      // Act
      sut.giveFeedback('good');
      fixture.detectChanges();

      // Assert
      const [id, text$, severity] = timedNotificationServiceSpy.push.calls.mostRecent().args;
      const text = await firstValueFrom(text$ as Observable<string>);

      expect(timedNotificationServiceSpy.push).toHaveBeenCalledTimes(1);
      expect(text).toBe('CONTENT_OPTIMIZATION.FEEDBACK_SUBMISSION_FALIED');
      expect(severity).toBe('error');
      expect(id).toBe('feedbackSubmissionError');
    });

    it('should handle feedback visibility correctly', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      sut.promptText = 'Test prompt';

      // Act
      await sut.generateResponse();
      fixture.detectChanges();

      // Assert
      expect(sut.isFeedbackSent).toBe(false);
      expect(sut.isFeedbackNotificationVisible).toBe(false);

      // Act
      sut.giveFeedback('good');
      fixture.detectChanges();

      // Assert
      expect(sut.isFeedbackSent).toBe(true);
      expect(sut.isFeedbackNotificationVisible).toBe(true);
    });
  });

  describe('View State Handling', () => {
    it('should reset view state correctly', () => {
      // Arrange
      // Act
      sut.resetViewState();
      fixture.detectChanges();

      // Assert
      expect(sut.isProcessing).toBe(false);
      expect(sut.promptValue).toBeNull();
    });

    it('should handle key press correctly', () => {
      // Arrange
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      sut.promptText = 'Test prompt';
      spyOn(sut, 'generateResponse');

      // Act
      sut.onKeyPress(event);

      // Assert
      expect(sut.generateResponse).toHaveBeenCalled();
    });
  });

  describe('BrandKit Handling', () => {
    it('should set brandKitId when stream is paid edition', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      featureFlagsServiceSpy.isXmAppsSitesApiEnabledAndSupported.and.returnValue(true);
      siteServiceSpy.getContextSite.and.returnValue({ brandKitId: 'mockBrandKitId' } as Site);
      ConfigurationService.isStreamPaidEdition = () => true;

      // Act
      await sut.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(sut.brandKitId).toBe('mockBrandKitId');
    });

    it('should not set brandKitId when stream is not paid edition', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      featureFlagsServiceSpy.isXmAppsSitesApiEnabledAndSupported.and.returnValue(true);
      ConfigurationService.isStreamPaidEdition = () => false;

      // Act
      await sut.ngOnInit();
      fixture.detectChanges();

      // Assert
      expect(sut.brandKitId).toBeUndefined();
    });

    it('should set brandKitId when stream is paid edition', async () => {
      // Arrange
      sut.chrome = { ...mockRnderingChrome };
      featureFlagsServiceSpy.isXmAppsSitesApiEnabledAndSupported.and.returnValue(true);
      ConfigurationService.isStreamPaidEdition = () => true;
      siteServiceSpy.getSiteByName.and.returnValue({ id: 'rootItemId001' } as Site);

      // Act
      await sut.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      // Assert
      expect(sut.brandKitId).toBe('mockBrandKitId');
    });

    it('should return correct tooltip text for brandkit prompt when stream is not paid edition', () => {
      // Arrange
      sut.isStreamPaidEdition = false;

      // Act
      const tooltipText = sut.getBrandkitTooltipText();

      // Assert
      expect(tooltipText).toEqual('CONTENT_OPTIMIZATION.PROMPTS.ADHERE_TO_BRANDKIT');
    });

    it('should return correct tooltip text for brandkit prompt when brandkit is not available', () => {
      // Arrange
      sut.isStreamPaidEdition = true;
      sut.brandKitId = undefined;

      // Act
      const tooltipText = sut.getBrandkitTooltipText();

      // Assert
      expect(tooltipText).toBe('CONTENT_OPTIMIZATION.BRAND_KIT_NOT_AVAILABLE');
    });

    it('should return correct tooltip text for brandkit prompt when brandkit is available', () => {
      // Arrange
      sut.isStreamPaidEdition = true;
      sut.brandKitId = 'mockBrandKitId';

      // Act
      const tooltipText = sut.getBrandkitTooltipText();

      // Assert
      expect(tooltipText).toBe('CONTENT_OPTIMIZATION.BRAND_KIT_ADHERENCE');
    });

    it('should render brand kit name when brand kit is available', async () => {
      sut.isStreamPaidEdition = true;
      sut.brandKitId = 'mockBrandKitId';

      await sut.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();

      const brandkitTextContainer: HTMLSpanElement = fixture.nativeElement.querySelector('span.brandkit-name');

      expect(brandkitTextContainer.textContent).toEqual('MockBrandKit');
    });

    it('should render correct text when brand kit name is empty string', async () => {
      sut.isStreamPaidEdition = true;
      sut.brandKitId = 'mockBrandKitId';

      brandManagementApiServiceSpy.getBrandKit.and.returnValue(of({ name: '', id: 'mock-brandkit-id' }));

      await sut.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();

      const brandkitTextContainer: HTMLSpanElement = fixture.nativeElement.querySelector('span.brandkit-name');
      const fallbackTextContainer: HTMLSpanElement = fixture.nativeElement.querySelector('span.adhere-brandkit');

      expect(brandkitTextContainer).toBeNull();
      expect(fallbackTextContainer.textContent).toEqual('CONTENT_OPTIMIZATION.PROMPTS.ADHERE_TO_BRANDKIT');
    });
  });
});
