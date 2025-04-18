/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import {
  AccordionModule,
  ContentEditableModule,
  EmptyStateModule,
  HeaderWithButtonModule,
  ListModule,
  LoadingIndicatorModule,
  PopoverModule,
  SearchInputModule,
} from '@sitecore/ng-spd-lib';
import { AnalyticsContextService } from 'app/analytics/analytics-context.service';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { WarningDialogModule } from 'app/shared/dialogs/warning-dialog/warning-dialog.module';
import { Item } from 'app/shared/graphql/item.interface';
import { PipesModule } from 'app/shared/pipes/pipes.module';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { SiteLanguageServiceTestingModule } from 'app/shared/site-language/site-language.service.testing';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { LONG_NAME, TestBedInjectSpy, nextTick } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { Subject, firstValueFrom, of } from 'rxjs';
import { EditorWorkspaceService } from '../../../editor/editor-workspace/editor-workspace.service';
import { PersonalizationContextMenuComponent } from './context-menu/personalization-context-menu.component';
import { CreateVariantDialogService } from './create-variant-dialog/create-variant-dialog.service';
import { PersonalizationAPIServiceDisconnected } from './personalization-api/personalization.api.disconnected';
import { PersonalizationAPIService } from './personalization-api/personalization.api.service';
import { AbTestComponentService } from './personalization-services/ab-test-component.service';
import { PersonalizationDalService } from './personalization-services/personalization.dal.service';
import { PersonalizationLayoutService } from './personalization-services/personalization.layout.service';
import { PersonalizationNotificationsService } from './personalization-services/personalization.notifications.service';
import { PersonalizationService } from './personalization-services/personalization.service';
import { PersonalizationComponent } from './personalization.component';
import { PersonalizationVariant } from './personalization.types';

let _activeVariant: PersonalizationVariant | null = null;
let _isPersonalizationModeValue = false;
const personalizationServiceStub = {
  getIsInPersonalizationMode(): boolean {
    return _isPersonalizationModeValue;
  },

  setIsInPersonalizationMode(value: boolean): void {
    _isPersonalizationModeValue = value;
  },

  getActiveVariant(): PersonalizationVariant | null {
    return _activeVariant;
  },

  setActiveVariant(value: PersonalizationVariant | null) {
    _activeVariant = value;
  },
};

describe(PersonalizationComponent.name, () => {
  let sut: PersonalizationComponent;
  let fixture: ComponentFixture<PersonalizationComponent>;
  let context: ContextServiceTesting;
  let personalizationAPI: PersonalizationAPIServiceDisconnected;
  let personalizationService: jasmine.SpyObj<PersonalizationService>;
  let personalizationLayoutService: jasmine.SpyObj<PersonalizationLayoutService>;
  let personalizationNotificationsService: jasmine.SpyObj<PersonalizationNotificationsService>;
  let editorWorkspaceService: jasmine.SpyObj<EditorWorkspaceService>;
  let createVariantDialogService: jasmine.SpyObj<CreateVariantDialogService>;
  let personalizationDalServiceSpy: jasmine.SpyObj<PersonalizationDalService>;
  let siteServiceSpy: jasmine.SpyObj<SiteService>;
  let abTestComponentServiceSpy: jasmine.SpyObj<AbTestComponentService>;
  let featureFlagsService: jasmine.SpyObj<FeatureFlagsService>;
  let analyticsContextService: jasmine.SpyObj<AnalyticsContextService>;

  // 2 sequential "async/await" requests inside of "subscribe" callback cannot be handled automatically by waitForAsync,
  // so we have to control it manually by resolving an empty Promise to compensate the actual delay.
  const detectChanges = async () => {
    fixture.detectChanges();
    await nextTick();
    fixture.detectChanges();
  };

  function getFlowDefinitionList() {
    return {
      list: fixture.debugElement
        .queryAll(By.css('.scroll-list ng-spd-list button[ngspdlistitem]'))
        .map((item) => item.nativeElement),

      variantName: fixture.debugElement
        .queryAll(By.css('.scroll-list ng-spd-list button[ngspdlistitem] .text'))
        .map((item) => item.nativeElement),

      audienceTitle: fixture.debugElement
        .queryAll(By.css('.scroll-list ng-spd-list button[ngspdlistitem] .audience-title'))
        .map((item) => item.nativeElement),
    };
  }

  function getCreateNewFlowDefinitionBtn() {
    return fixture.debugElement.query(By.css('.subheader button')).nativeElement;
  }

  function getDeleteBtn() {
    return fixture.debugElement.query(By.css(`ng-spd-popover ng-spd-list button:nth-child(3)`)).nativeElement;
  }

  function getEditBtn() {
    return fixture.debugElement.query(By.css(`ng-spd-popover ng-spd-list button:first-child`)).nativeElement;
  }

  function getRenameBtn() {
    return fixture.debugElement.query(By.css(`ng-spd-popover ng-spd-list button:nth-child(2)`)).nativeElement;
  }

  const editableNode = () => fixture.debugElement.query(By.css('span[contenteditable=true]'));

  const createVariantBtn = (): HTMLElement => {
    return fixture.debugElement.query(By.css('.sliding')).nativeElement;
  };

  const noCdpAppEl = () => fixture.debugElement.query(By.css('.no-cdpApp-template')).nativeElement;

  function openContextMenu() {
    const contextMenuButton = fixture.debugElement.query(
      By.css(`button[icon='dots-horizontal']:first-child`),
    ).nativeElement;
    contextMenuButton.click();
  }

  function clickDeleteAction() {
    const deleteAction = getDeleteBtn();
    deleteAction.click();
  }
  function clickRenameAction() {
    const renameAction = getRenameBtn();
    renameAction.click();
  }

  function confirmDeleteAction() {
    const confirmBtn = document.querySelector('ng-spd-dialog-actions button:nth-child(2)') as HTMLButtonElement;
    confirmBtn.click();
  }

  async function selectVariant(index: number) {
    const variantToSelect = getFlowDefinitionList().list[index];
    variantToSelect.click();
    await detectChanges();
  }

  const renamePageVariant = (name: string) => {
    openContextMenu();
    fixture.detectChanges();

    clickRenameAction();
    fixture.detectChanges();

    editableNode().triggerEventHandler('submit', name);
    fixture.detectChanges();
  };

  async function deleteVariant(index: number) {
    const variantToDelete: HTMLElement = getFlowDefinitionList().list[index];
    variantToDelete.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    openContextMenu();
    await detectChanges();

    clickDeleteAction();
    await detectChanges();

    confirmDeleteAction();
    await detectChanges();
  }

  const sampleVariant = {
    template: '{variantId: variant2-en}',
    variantId: 'variant2-en',
    variantName: 'Visitor from Oslo',
    audienceName: 'User has visited home page',
    enableEdit: false,
    conditionGroups: [
      {
        conditions: [
          {
            templateId: 'page_views',
            params: {
              Visited: 'has',
              'Page name': '/selectFlights',
            },
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AppLetModule,
        NoopAnimationsModule,
        ContextServiceTestingModule,
        TranslateServiceStubModule,
        TranslateModule,
        ListModule,
        LoadingIndicatorModule,
        AccordionModule,
        SlideInPanelModule,
        SearchInputModule,
        PopoverModule,
        WarningDialogModule,
        EmptyStateModule,
        HeaderWithButtonModule,
        PipesModule,
        StaticConfigurationServiceStubModule,
        ContentEditableModule,
        SiteLanguageServiceTestingModule,
        A11yModule,
      ],
      declarations: [PersonalizationComponent, PersonalizationContextMenuComponent],
      providers: [
        {
          provide: PersonalizationAPIService,
          useClass: PersonalizationAPIServiceDisconnected,
        },
        {
          provide: PersonalizationService,
          useValue: jasmine.createSpyObj<PersonalizationService>('PersonalizationService', [
            'setIsInPersonalizationMode',
            'getIsInPersonalizationMode',
            'setActiveVariant',
            'getActiveVariant',
          ]),
        },
        {
          provide: PersonalizationLayoutService,
          useValue: jasmine.createSpyObj<PersonalizationLayoutService>('PersonalizationLayoutService', [
            'removePersonalizationRulesFromLayout',
            'isVariantUsedInAnyRule',
          ]),
        },
        {
          provide: PersonalizationNotificationsService,
          useValue: jasmine.createSpyObj<PersonalizationNotificationsService>('PersonalizationNotificationsServices', [
            'initShowingNotifications',
            'showContentIsDefaultNotification',
            'showApiBadRequestError',
            'stopShowingNotifications',
            'showVariantAlreadyExistsNotification',
            'showVariantNameExceedLimitNotification',
            'showVariantIsEmptyNotification',
          ]),
        },
        {
          provide: PersonalizationDalService,
          useValue: jasmine.createSpyObj<PersonalizationDalService>('PersonalizationDalService', {
            deleteLayoutRulesForAllVersions: of({} as Item),
          }),
        },
        {
          provide: EditorWorkspaceService,
          useValue: jasmine.createSpyObj<EditorWorkspaceService>('EditorWorkspaceService', ['watchCanvasLoadState']),
        },
        {
          provide: CreateVariantDialogService,
          useValue: jasmine.createSpyObj<CreateVariantDialogService>('CreateVariantDialogService', ['show']),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('SiteService', ['getPointOfSale']),
        },
        {
          provide: AbTestComponentService,
          useValue: jasmine.createSpyObj<AbTestComponentService>('AbTestComponentService', [
            'getAbTestsConfiguredOnPage',
            'refetchFlows',
          ]),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']),
        },
        {
          provide: AnalyticsContextService,
          useValue: jasmine.createSpyObj<AnalyticsContextService>('AnalyticsContextService', [
            'watchDuration',
            'watchVariantFilterChanges',
            'getPointOfSale',
            'setVariantFilterValue',
            'getSiteInformation',
          ]),
        },
      ],
    }).compileComponents();
  });

  beforeEach(waitForAsync(() => {
    context = TestBed.inject(ContextServiceTesting);
    context.provideDefaultTestContext();
    personalizationDalServiceSpy = TestBedInjectSpy(PersonalizationDalService);
    personalizationAPI = TestBed.inject(PersonalizationAPIService) as PersonalizationAPIServiceDisconnected;
    createVariantDialogService = TestBedInjectSpy(CreateVariantDialogService);

    personalizationService = TestBedInjectSpy(PersonalizationService);
    personalizationLayoutService = TestBedInjectSpy(PersonalizationLayoutService);
    personalizationNotificationsService = TestBedInjectSpy(PersonalizationNotificationsService);
    editorWorkspaceService = TestBedInjectSpy(EditorWorkspaceService);
    featureFlagsService = TestBedInjectSpy(FeatureFlagsService);
    analyticsContextService = TestBedInjectSpy(AnalyticsContextService);
    editorWorkspaceService.watchCanvasLoadState.and.returnValue(
      of({ isLoading: false, itemId: 'itemId001', language: 'en' }),
    );
    siteServiceSpy = TestBedInjectSpy(SiteService);
    abTestComponentServiceSpy = TestBedInjectSpy(AbTestComponentService);
    abTestComponentServiceSpy.getAbTestsConfiguredOnPage.and.resolveTo([]);

    _activeVariant = null;
    _isPersonalizationModeValue = false;
    personalizationService.getActiveVariant.and.callFake(personalizationServiceStub.getActiveVariant);
    personalizationService.setActiveVariant.and.callFake((value) => personalizationServiceStub.setActiveVariant(value));
    personalizationService.getIsInPersonalizationMode.and.callFake(
      personalizationServiceStub.getIsInPersonalizationMode,
    );
    personalizationService.setIsInPersonalizationMode.and.callFake((value) =>
      personalizationServiceStub.setIsInPersonalizationMode(value),
    );

    fixture = TestBed.createComponent(PersonalizationComponent);

    ConfigurationService.cdpTenant = {
      id: '789',
      name: 'cdtenant',
      displayName: 'cdtenant1',
      organizationId: 'test-org',
      apiUrl: 'http://cdp.com',
      appUrl: 'https://sample-app-url.com',
      analyticsAppUrl: '',
    };

    ConfigurationService.xmCloudTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'test-org',
      url: 'http://cm.com',
      gqlEndpointUrl: 'http://cm.com/graph',
      cdpEmbeddedTenantId: '123',
      customerEnvironmentType: 'prd',
      environmentId: '321',
      environmentName: 'prodev',
      projectId: '12',
      projectName: 'proj',
    };

    sut = fixture.componentInstance;

    const permissions = { canCreate: true, canWrite: true };
    spyOn(context, 'getItem').and.returnValue(Promise.resolve({ permissions } as Item));
  }));

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
    ConfigurationService.cdpTenant = null;
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('WHEN cdpAppUrls is configured & POS is defined', () => {
    beforeEach(async () => {
      sut.isCdpAppConfigured = true;
      siteServiceSpy.getPointOfSale.and.returnValue(Promise.resolve('PointOfSale'));
      abTestComponentServiceSpy.getAbTestsConfiguredOnPage.and.resolveTo([]);
      await detectChanges();
    });

    it('should enable personalization mode ', () => {
      expect(personalizationService.setIsInPersonalizationMode).toHaveBeenCalledWith(true);
    });

    it('should call initShowingNotifications() of personalization notifications service on ngOnInit', () => {
      expect(personalizationNotificationsService.initShowingNotifications).toHaveBeenCalled();
    });

    it('should call stopShowingNotifications() of personalization notifications service on ngOnDestroy', () => {
      sut.ngOnDestroy();
      expect(personalizationNotificationsService.stopShowingNotifications).toHaveBeenCalled();
    });

    it('should set active variant as null WHEN OnInit', async () => {
      await detectChanges();

      expect(personalizationServiceStub.getActiveVariant()).toBe(null);
    });

    it('should not emit context changes on the first load', () => {
      const updateContextSpy = spyOn(context, 'updateContext').and.callThrough();
      fixture.detectChanges();

      expect(updateContextSpy).not.toHaveBeenCalled();
    });

    it('should not emit context changes on destroy if the active variant is the default one', async () => {
      const updateContextSpy = spyOn(context, 'updateContext').and.callThrough();
      fixture.detectChanges();

      // First call
      await selectVariant(1);
      fixture.detectChanges();

      // Second call => select the default variant
      await selectVariant(0);
      fixture.detectChanges();

      sut.ngOnDestroy();
      fixture.detectChanges();

      const updateContextCalls = updateContextSpy.calls.allArgs();
      const [call1, call2] = updateContextCalls;

      expect(updateContextCalls.length).toBe(2);
      expect(call1[0].variant).toBe('cfa85597e43545479aadc27df7ff134e');
      expect(call2[0].variant).toBe(undefined);
    });

    describe('flowDefinitions list', () => {
      it('should render flowDefinitions list with variantName & audienceTitle', async () => {
        const flowDefinitionList = getFlowDefinitionList().list;
        const variantName = getFlowDefinitionList().variantName;
        const audienceTitle = getFlowDefinitionList().audienceTitle;
        const [a1, a2, a3] = variantName;
        const [b1, b2] = audienceTitle;

        expect(flowDefinitionList.length).toBe(3);
        expect(a1.innerText).toEqual('COMMON.DEFAULT');
        expect(a2.innerText).toEqual('Visitor from Copenhagen');
        expect(a3.innerText).toEqual('Visitor from Oslo');

        expect(b1.innerText).toEqual('PERSONALIZATION.AUDIENCE: User has visited all pages');
        expect(b2.innerText).toEqual('PERSONALIZATION.AUDIENCE: User has visited home page');
      });

      it('should update flowDefinitions list WHEN context item changes', async () => {
        personalizationAPI.init([
          {
            traffic: {
              type: 'audienceTraffic',
              weightingAlgorithm: 'USER_DEFINED',
              splits: [sampleVariant],
            },
          },
        ]);
        context.provideTestValue({ itemId: 'newItemId', itemVersion: 1 });

        await detectChanges();

        const personalizationList = getFlowDefinitionList().list;
        const variantName = getFlowDefinitionList().variantName;
        const [a1, a2] = variantName;

        expect(personalizationList.length).toBe(2);
        expect(a1.textContent).toEqual('COMMON.DEFAULT');
        expect(a2.textContent).toEqual('Visitor from Oslo');
      });
    });

    describe('WHEN select variant', () => {
      it('should update context', async () => {
        expect(context.variant).toBe(undefined);

        await selectVariant(1); // cfa85597e43545479aadc27df7ff134e

        expect(context.variant).toBe('cfa85597e43545479aadc27df7ff134e');
      });

      it('should set selected variant as active variant', async () => {
        await selectVariant(1);

        expect(personalizationService.setActiveVariant).toHaveBeenCalledWith(sut.activeVariant);
      });

      it('should NOT emit context change if select the same variant', () => {
        const updateContextSpy = spyOn(context, 'updateContext').and.callThrough();

        // First call of the same variant. E.g. when there're no POS defined
        sut.selectVariant(undefined, false);

        // Second call => select a variant => this one should emit context change
        sut.selectVariant(sampleVariant, false);

        // Third call => select the same variant
        sut.selectVariant(sampleVariant, false);

        const updateContextCalls = updateContextSpy.calls.allArgs();
        const [call1] = updateContextCalls;

        expect(updateContextCalls.length).toBe(1);
        expect(call1[0].variant).toBe(sampleVariant.variantId);
      });
    });

    describe('createVariant', () => {
      it('should open create variant dialog', async () => {
        fixture.detectChanges();
        createVariantBtn().click();

        expect(createVariantDialogService.show).toHaveBeenCalledTimes(1);
      });

      it('should create new flowDefinition if it is null', async () => {
        sut.flowDefinition = null;
        fixture.detectChanges();

        createVariantBtn().click();
        await Promise.resolve();

        expect(personalizationAPI.flowDefinition).toBeTruthy();
      });

      it('should disable create new button if the list exceeds the limit', () => {
        // Enabled by default
        expect(createVariantBtn().getAttribute('disabled')).toBe(null);

        // Disabled if >= 8
        sut.variants = Array(8).fill(sampleVariant);

        fixture.detectChanges();
        expect(createVariantBtn().getAttribute('disabled')).toBe('');
      });

      it('should unarchive flow definition if it is archived and has variants when creating a new variant', async () => {
        // Arrange
        personalizationAPI.init([
          {
            archived: true,
            traffic: {
              type: 'audienceTraffic',
              weightingAlgorithm: 'USER_DEFINED',
              splits: [sampleVariant],
            },
          },
        ]);

        createVariantDialogService.show.and.returnValue(of({ id: 'new-variant-id', name: 'New Variant' }));
        const unarchiveFlowDefinitionSpy = spyOn(personalizationAPI, 'unarchiveFlowDefinition');

        // Act
        createVariantBtn().click();
        await fixture.whenStable();
        fixture.detectChanges();

        // Assert
        expect(unarchiveFlowDefinitionSpy).toHaveBeenCalled();
      });
    });

    describe('editVariant', () => {
      it('should open edit variant dialog', async () => {
        openContextMenu();
        await detectChanges();

        getEditBtn().click();
        fixture.detectChanges();

        expect(createVariantDialogService.show).toHaveBeenCalledTimes(1);
      });
    });

    describe('renamePageVariant', () => {
      it('should invoke `showVariantAlreadyExistsNotification` if renamed variant name already exist', () => {
        renamePageVariant('Visitor from Oslo');

        expect(personalizationNotificationsService.showVariantAlreadyExistsNotification).toHaveBeenCalledTimes(1);
      });

      it('should invoke `showVariantIsEmptyNotification` if renamed variant name is empty', () => {
        renamePageVariant('');

        expect(personalizationNotificationsService.showVariantIsEmptyNotification).toHaveBeenCalledTimes(1);
      });

      it('should invoke `showVariantNameExceedLimitNotification` if renamed variant exceeds limit', () => {
        renamePageVariant(LONG_NAME);

        expect(personalizationNotificationsService.showVariantNameExceedLimitNotification).toHaveBeenCalledTimes(1);
      });

      it('should rename the page variant', async () => {
        renamePageVariant('new-name');

        await detectChanges();

        expect(sut.flowDefinition?.traffic.splits[0].variantName).toBe('new-name');
      });
    });

    describe('WHEN delete a variant', () => {
      it('should remove the variant from personalization list', async () => {
        expect(sut.flowDefinition?.traffic.splits.length).toBe(2);
        expect(getFlowDefinitionList().list.length).toBe(3);
        await deleteVariant(0);

        const [el1, el2] = getFlowDefinitionList().list;
        expect(getFlowDefinitionList().list.length).toBe(2);
        expect(el1.textContent).toContain('COMMON.DEFAULTPERSONALIZATION.DEFAULT_VARIANT_DETAILS');
        expect(el2.textContent).toContain('Visitor from OsloPERSONALIZATION.AUDIENCE: User has visited home page');
        expect(sut.flowDefinition?.traffic.splits.length).toBe(1);
      });

      it('should remove the variant from layout', async () => {
        // act
        await deleteVariant(0);

        // assert
        expect(personalizationLayoutService.removePersonalizationRulesFromLayout).toHaveBeenCalledWith(
          'cfa85597e43545479aadc27df7ff134e',
        );
        expect(sut.flowDefinition?.traffic.splits.length).toBe(1);
      });

      it('should invoke `deleteLayoutRulesForAllVersions`', async () => {
        await deleteVariant(0);

        expect(personalizationDalServiceSpy.deleteLayoutRulesForAllVersions).toHaveBeenCalledTimes(1);
      });

      describe('AND it is the selected variant', () => {
        it('should set the active variant to null and select the default variant from flowDefinitions', async () => {
          await selectVariant(0);
          await deleteVariant(0);

          fixture.detectChanges();

          expect(sut.activeVariant).toEqual(null);
          const personalizationList = getFlowDefinitionList().list;

          const defaultVariantIndex = personalizationList.length - 2;

          expect(personalizationList[defaultVariantIndex].classList.contains('select')).toBeTrue();
        });
      });
    });

    describe('storeScroll', () => {
      it('should handle a scrolling event', () => {
        sut.storeScroll({ target: { scrollTop: 10 } } as any);
        expect(sut.hasScroll).toBe(true);

        sut.storeScroll({ target: { scrollTop: 0 } } as any);
        expect(sut.hasScroll).toBe(false);
      });
    });

    describe('OnDestroy', () => {
      it('should reset Personalization mode and context variant', async () => {
        // First select non default variant
        selectVariant(1);
        await detectChanges();

        // Destroy, so mode should be switched to default
        await sut.ngOnDestroy();

        expect(personalizationService.setIsInPersonalizationMode).toHaveBeenCalledWith(false);
        expect(personalizationService.setActiveVariant).toHaveBeenCalledWith(null);
        expect(context.variant).toBe(undefined);
      });
    });

    describe('Loading', () => {
      it('should show loading when fetches flow definition and disable Create new button', async () => {
        const resolver = new Subject<any>();
        spyOn(personalizationAPI, 'getActivePersonalizeFlowDefinition').and.callFake(async () => {
          return await firstValueFrom(resolver);
          // return personalizationAPI.getActiveFlowDefinition();
        });

        context.setTestItemId('123');
        await detectChanges();

        expect(fixture.debugElement.query(By.css('.scroll-list ng-spd-list'))).toBeFalsy();
        expect(fixture.debugElement.query(By.css('ng-spd-loading-indicator'))).toBeTruthy();
        expect(getCreateNewFlowDefinitionBtn().disabled).toBeTrue();
      });
    });

    describe('API error handling', () => {
      it('should show empty state when Api is disconnected', async () => {
        sut.isApiConnected = false;
        fixture.detectChanges();

        const emptyState = fixture.debugElement.query(By.css('ng-spd-empty-state'));

        expect(emptyState).toBeTruthy();
      });

      it('should show error notification if request is invalid ', async () => {
        // Rewrite the original method to avoid printing the thrown Error in the console and therefore failing the tests.
        const _handleAPIResponse = sut.handleAPIResponse.bind(sut);
        spyOn(sut, 'handleAPIResponse').and.callFake((requestResult: any) => {
          try {
            return _handleAPIResponse(requestResult);
          } catch {
            return { apiIsBroken: true, requestIsInvalid: true, data: null };
          }
        });

        const addUpdateVariantToFlowDefinitionSpy = spyOn<any>(
          personalizationAPI,
          'createPageFlowDefinition',
        ).and.callThrough();
        addUpdateVariantToFlowDefinitionSpy.and.resolveTo({ data: null, apiIsBroken: false, requestIsInvalid: true });
        sut.flowDefinition = null;
        fixture.detectChanges();

        createVariantBtn().click();
        await Promise.resolve();

        expect(personalizationNotificationsService.showApiBadRequestError).toHaveBeenCalledTimes(1);
      });
    });

    describe('CanvasIsloading state', () => {
      it('should pass canvasIsLoading true to contextMenuComponent when canvas is loading', async () => {
        openContextMenu();

        sut.canvasIsLoading$ = of(true);
        await detectChanges();

        const deleteBtn = getDeleteBtn() as HTMLButtonElement;
        expect(deleteBtn.disabled).toBeTrue();
      });

      it('should pass canvasIsLoading false to contextMenuComponent when canvas is not loading', async () => {
        openContextMenu();

        sut.canvasIsLoading$ = of(false);
        await detectChanges();

        const deleteBtn = getDeleteBtn() as HTMLButtonElement;
        expect(deleteBtn.disabled).toBeFalse();
      });
    });
  });

  describe('WHEN cdpAppUrls is not configured', () => {
    it('should not show loading indicator and show no cdpApp template ', async () => {
      sut.isCdpAppConfigured = false;

      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('ng-spd-loading-indicator'))).toBeFalsy();
      expect(noCdpAppEl()).toBeDefined();
    });

    describe('AND pos is not defined', () => {
      describe('AND isFeatureEnabled() is enabled', () => {
        it('should show no-pos-template with correct text', async () => {
          const mockSiteInfo = { collectionId: 'mockCollectionId', id: 'site 1', hostId: 'host 1' };
          featureFlagsService.isFeatureEnabled.and.returnValue(true);
          sut.isCdpAppConfigured = true;
          siteServiceSpy.getPointOfSale.and.returnValue(Promise.resolve(null));
          analyticsContextService.getSiteInformation.and.returnValue(of(mockSiteInfo));

          await detectChanges();

          const posEl = () => fixture.debugElement.query(By.css('.no-pos-template')).nativeElement;
          const posElTitle = () => fixture.debugElement.query(By.css('.no-pos-template .header .title')).nativeElement;
          const posElDesc = () => fixture.debugElement.query(By.css('.no-pos-template .description')).nativeElement;
          expect(analyticsContextService.getSiteInformation).toHaveBeenCalled();
          expect(posEl()).toBeDefined();
          expect(posElTitle().textContent).toBe('PERSONALIZATION.NO_PERSONALIZE_IDENTIFIER.HEADER');
          expect(posElDesc().textContent).toBe('PERSONALIZATION.NO_PERSONALIZE_IDENTIFIER.DESCRIPTION');
        });
      });

      describe('AND isFeatureEnabled() is not enabled', () => {
        it('should show no-pos-template with correct text', async () => {
          featureFlagsService.isFeatureEnabled.and.returnValue(false);
          sut.isCdpAppConfigured = true;
          siteServiceSpy.getPointOfSale.and.returnValue(Promise.resolve(null));

          await detectChanges();

          const posEl = () => fixture.debugElement.query(By.css('.no-pos-template')).nativeElement;
          const posElTitle = () => fixture.debugElement.query(By.css('.no-pos-template .header .title')).nativeElement;
          const posElDesc = () => fixture.debugElement.query(By.css('.no-pos-template .description')).nativeElement;
          expect(posEl()).toBeDefined();
          expect(posElTitle().textContent).toBe('PERSONALIZATION.NO_POS_IDENTIFIER.HEADER');
          expect(posElDesc().textContent).toBe('PERSONALIZATION.NO_POS_IDENTIFIER.DESCRIPTION');
        });
      });

      it('should not make to call to [getActiveFlowDefinition] of personalizationApi service ', async () => {
        sut.isCdpAppConfigured = false;
        siteServiceSpy.getPointOfSale.and.returnValue(Promise.resolve(null));

        const flowDefinitionSpy = spyOn(personalizationAPI, 'getActivePersonalizeFlowDefinition');
        await detectChanges();

        expect(flowDefinitionSpy).not.toHaveBeenCalled();
      });

      it('should not call initShowingNotifications() of personalization notifications service ', async () => {
        sut.isCdpAppConfigured = false;
        siteServiceSpy.getPointOfSale.and.returnValue(Promise.resolve(null));
        await detectChanges();

        expect(personalizationNotificationsService.initShowingNotifications).not.toHaveBeenCalled();
      });

      it('should disable personalization mode', async () => {
        siteServiceSpy.getPointOfSale.and.returnValue(Promise.resolve(null));
        await detectChanges();

        expect(personalizationService.setIsInPersonalizationMode).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('WHEN context site changes', () => {
    it('should enable personalization mode if POS is defined', async () => {
      sut.isCdpAppConfigured = true;
      siteServiceSpy.getPointOfSale.and.returnValue(Promise.resolve('pointOfSale'));
      await detectChanges();

      context.updateContext({ siteName: 'website' });
      fixture.detectChanges();

      expect(personalizationService.setIsInPersonalizationMode).toHaveBeenCalledWith(true);
    });

    it('should disable personalization mode if POS is not defined', async () => {
      sut.isCdpAppConfigured = true;
      siteServiceSpy.getPointOfSale.and.returnValue(Promise.resolve(null));
      await detectChanges();

      context.updateContext({ siteName: 'testSite' });
      fixture.detectChanges();

      expect(personalizationService.setIsInPersonalizationMode).toHaveBeenCalledWith(false);
    });
  });

  describe('permission', () => {
    beforeEach(async () => {
      sut.isCdpAppConfigured = true;
      siteServiceSpy.getPointOfSale.and.returnValue(Promise.resolve('PointOfSale'));
      context.provideDefaultTestContext();
    });

    it('should disable create new button when user has no edit rights', async () => {
      const permissions = { canWrite: false };
      context.getItem = jasmine.createSpy('getItem').and.returnValue(Promise.resolve({ permissions } as Item));
      await detectChanges();

      const contextMenuButton: HTMLElement = fixture.debugElement.query(By.css(`.context-menu`)).nativeElement;
      fixture.detectChanges();

      expect(getCreateNewFlowDefinitionBtn().disabled).toBeTrue();
      expect(contextMenuButton.classList).toContain('hide');
    });

    it('should enable create new button when user has edit rights', async () => {
      const permissions = { canWrite: true };
      context.getItem = jasmine.createSpy('getItem').and.returnValue(Promise.resolve({ permissions } as Item));
      await detectChanges();

      const contextMenuButton: HTMLElement = fixture.debugElement.query(By.css(`.context-menu`)).nativeElement;
      fixture.detectChanges();

      expect(getCreateNewFlowDefinitionBtn().disabled).toBeFalse();
      expect(contextMenuButton.classList).not.toContain('hide');
    });
  });

  describe('component test configured', () => {
    beforeEach(async () => {
      sut.isCdpAppConfigured = true;
      siteServiceSpy.getPointOfSale.and.returnValue(Promise.resolve('PointOfSale'));
      abTestComponentServiceSpy.getAbTestsConfiguredOnPage.and.resolveTo([{} as any]);
      await detectChanges();
    });

    it('should set personalization mode to false when component test configured on page ', async () => {
      expect(personalizationService.setIsInPersonalizationMode).toHaveBeenCalledWith(false);
    });

    it('should show component test enabled message when component test configured on page ', async () => {
      const componentTestMessageEl = fixture.debugElement.query(
        By.css('.component-test-enabled-template'),
      ).nativeElement;

      expect(componentTestMessageEl).toBeDefined();
    });
  });

  describe('isFeatureEnabled()', () => {
    it('should return true when the feature is enabled', () => {
      // Arrange
      featureFlagsService.isFeatureEnabled.and.returnValue(true);

      // Act
      const result = sut.isFeatureEnabled();

      // Assert
      expect(featureFlagsService.isFeatureEnabled).toHaveBeenCalledWith('pages_site-analytics-identifier');
      expect(result).toBe(true);
    });

    it('should return false when the feature is disabled', () => {
      // Arrange
      featureFlagsService.isFeatureEnabled.and.returnValue(false);

      // Act
      const result = sut.isFeatureEnabled();

      // Assert
      expect(featureFlagsService.isFeatureEnabled).toHaveBeenCalledWith('pages_site-analytics-identifier');
      expect(result).toBe(false);
    });
  });
});
