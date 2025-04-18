/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule, ItemCardModule, PopoverModule, TableModule } from '@sitecore/ng-spd-lib';
import { LHSNavigationService } from 'app/pages/left-hand-side/lhs-navigation.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { WarningDialogModule } from 'app/shared/dialogs/warning-dialog/warning-dialog.module';
import { Item as ContextItem } from 'app/shared/graphql/item.interface';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of, ReplaySubject, Subject, throwError } from 'rxjs';

import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { XmCloudFeatureCheckerService } from 'app/shared/xm-cloud/xm-cloud-feature-checker.service';
import { PageDesignModule } from '../page-design.module';
import { PageTemplatesService } from '../page-templates.service';
import { TEMPLATE_ROOT_ITEM_ID, TenantPageTemplate } from '../page-templates.types';
import { DuplicateItemDialogService } from '../shared/duplicate-item-dialog/duplicate-item-dialog.service';
import { adminPermissions } from '../shared/page-templates-test-data';
import { RenameItemDialogService } from '../shared/rename-item-dialog/rename-item-dialog.service';
import { AssignPageDesignDialogService } from '../templates-view/assign-page-design-dialog/assign-page-design-dialog.service';
import { FeatureNotAvailableDialogComponent } from '../templates-view/feature-not-available-dialog/feature-not-available-dialog.component';
import { InsertOptionsConfigurationsDialogService } from './insert-options-configurations-dialog/insert-options-configurations-dialog.service';
import { PageTemplatesComponent } from './page-templates.component';

const Initial_Context = {
  itemId: 'itemId1',
  language: 'lang1',
  siteName: 'website1',
};

const testTemplateItemDetail = {
  path: '/test/item',
  displayName: 'Test Item',
  itemId: 'testId',
  parentId: 'parentId',
  name: 'testItem',
  version: 1,
  hasChildren: false,
  thumbnailUrl: 'testUrl',
  hasPresentation: true,
  isFolder: false,
  insertOptions: [],
  createdDate: new Date('2023-01-01T00:00:00').toISOString(),
  updatedDate: new Date('2023-01-01T01:00:00').toISOString(),
  access: adminPermissions,
};

describe(PageTemplatesComponent.name, () => {
  let sut: PageTemplatesComponent;
  let fixture: ComponentFixture<PageTemplatesComponent>;
  let activeNavigation$: Subject<string>;
  let lhsNavigationServiceSpy: jasmine.SpyObj<LHSNavigationService>;
  let contextService: ContextServiceTesting;
  let pageTemplatesServiceSpy: jasmine.SpyObj<PageTemplatesService>;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let insertOptionsConfigurationsDialogServiceSpy: jasmine.SpyObj<InsertOptionsConfigurationsDialogService>;
  let assignPageDesignDialogServiceSpy: jasmine.SpyObj<AssignPageDesignDialogService>;
  let xmCloudFeatureCheckerServiceSpy: jasmine.SpyObj<XmCloudFeatureCheckerService>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;

  const confirmInDialog = () =>
    (document.querySelector('ng-spd-dialog-actions button:nth-child(2)') as HTMLButtonElement).click();

  const cancelInDialog = () => (document.querySelector('ng-spd-dialog-actions button') as HTMLButtonElement).click();

  const getTemplates = () => fixture.debugElement.queryAll(By.css('.templates-list-container tbody tr'));

  const getContextMenu = () => fixture.debugElement.query(By.css('ng-spd-popover'));

  const getFeatureNotAvailableDialog = () => document.querySelector('ng-spd-dialog-header');

  const getBtnFromTemplateContextMenu = (itemIndex: number, buttonIndex: number) => {
    const itemCard = getTemplates()[itemIndex];

    (itemCard.queryAll(By.css('.modified-date button'))[0].nativeElement as HTMLButtonElement).click();
    fixture.detectChanges();

    const buttons = getContextMenu().queryAll(By.css('button'));
    return buttons[buttonIndex].nativeElement as HTMLButtonElement;
  };

  const assignPageDesignButton = () => fixture.debugElement.queryAll(By.css('.assign-page-design .configure-button'));
  const textElement = () => fixture.debugElement.query(By.css('.insert-options span')).nativeElement as HTMLElement;

  const permissions = { canCreate: true, canWrite: true, canRename: true, canDelete: true, canPublish: true };

  const mockPageDesign = {
    path: '/path/to/page-design2',
    displayName: 'page design 2',
    itemId: '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
    name: 'page design 2',
    version: 1,
    hasChildren: false,
    insertOptions: [],
    thumbnailUrl: '',
    hasPresentation: true,
    isFolder: false,
    createdDate: '20230428T111641Z',
    updatedDate: '20230429T111641Z',
    access: adminPermissions,
    children: undefined,
  };
  const mockPageTemplates = [
    {
      template: { templateId: 'test-template', name: 'Test Template', access: adminPermissions },
      pageDesign: mockPageDesign,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ContextServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        AppLetModule,
        PageDesignModule,
        WarningDialogModule,
        PopoverModule,
        IconButtonModule,
        ItemCardModule,
        BrowserAnimationsModule,
        TableModule,
      ],
      declarations: [PageTemplatesComponent, FeatureNotAvailableDialogComponent],
      providers: [
        {
          provide: LHSNavigationService,
          useValue: jasmine.createSpyObj<LHSNavigationService>('LHSNavigationService', ['watchRouteSegment']),
        },
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', [
            'getTenantPageTemplates',
            'getTemplateUsageCount',
            'getItemDetails',
            'deleteItem',
            'isPageTemplatesFeatureAvailable',
            'updateStandardValuesInsertOptions',
            'createTemplatesStandardValuesItems',
          ]),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', ['pushNotification']),
        },
        {
          provide: RenameItemDialogService,
          useValue: jasmine.createSpyObj<RenameItemDialogService>('RenameDesignItemDialogService', ['show']),
        },
        {
          provide: DuplicateItemDialogService,
          useValue: jasmine.createSpyObj<DuplicateItemDialogService>('DuplicateDesignItemDialogService', ['show']),
        },
        {
          provide: InsertOptionsConfigurationsDialogService,
          useValue: jasmine.createSpyObj<InsertOptionsConfigurationsDialogService>(
            'InsertOptionsConfigurationsDialogService',
            ['show'],
          ),
        },
        {
          provide: AssignPageDesignDialogService,
          useValue: jasmine.createSpyObj<AssignPageDesignDialogService>('AssignPageDesignDialogService', ['show']),
        },
        {
          provide: XmCloudFeatureCheckerService,
          useValue: jasmine.createSpyObj<XmCloudFeatureCheckerService>('XmCloudFeatureCheckerService', [
            'isTemplateAccessFieldAvailable',
            'isTemplateStandardValuesAvailable',
          ]),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']),
        },
      ],
    }).compileComponents();
    insertOptionsConfigurationsDialogServiceSpy = TestBedInjectSpy(InsertOptionsConfigurationsDialogService);
    assignPageDesignDialogServiceSpy = TestBedInjectSpy(AssignPageDesignDialogService);
    activeNavigation$ = new ReplaySubject(1);
    lhsNavigationServiceSpy = TestBedInjectSpy(LHSNavigationService);
    lhsNavigationServiceSpy.watchRouteSegment.and.returnValue(activeNavigation$);
    activeNavigation$.next('templates');

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(Initial_Context);

    pageTemplatesServiceSpy = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesServiceSpy.getTenantPageTemplates.and.returnValue(of([]));

    pageTemplatesServiceSpy.getItemDetails.and.returnValue(of(testTemplateItemDetail));
    pageTemplatesServiceSpy.getTemplateUsageCount.and.returnValue(of(5));
    pageTemplatesServiceSpy.isPageTemplatesFeatureAvailable.and.returnValue(of(false));

    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);

    xmCloudFeatureCheckerServiceSpy = TestBedInjectSpy(XmCloudFeatureCheckerService);
    xmCloudFeatureCheckerServiceSpy.isTemplateAccessFieldAvailable.and.resolveTo(true);
    xmCloudFeatureCheckerServiceSpy.isTemplateStandardValuesAvailable.and.resolveTo(false);

    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);
    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);

    fixture = TestBed.createComponent(PageTemplatesComponent);

    ConfigurationService.xmCloudTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'test-org',
      url: 'http://cm.com/',
      gqlEndpointUrl: 'http://cm.com/graph',
      cdpEmbeddedTenantId: '123',
      customerEnvironmentType: 'prd',
      environmentId: '321',
      environmentName: 'prodev',
      projectId: '12',
      projectName: 'proj',
    };

    sut = fixture.componentInstance;

    spyOn(contextService, 'getItem').and.returnValue(Promise.resolve({ permissions } as ContextItem));

    fixture.detectChanges();
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should show feature not available dialog for non-SXA sites', async () => {
    pageTemplatesServiceSpy.isPageTemplatesFeatureAvailable.and.returnValue(of(true));
    await sut.ngOnInit();

    expect(getFeatureNotAvailableDialog()).toBeTruthy();
  });

  it('should initialize activeNavigation$ and pageTemplates', async () => {
    await sut.ngOnInit();

    expect(lhsNavigationServiceSpy.watchRouteSegment).toHaveBeenCalled();
    expect(contextService.siteName$).toBeTruthy();
    expect(pageTemplatesServiceSpy.getTenantPageTemplates).toHaveBeenCalledWith('website1');
    // expect(pageTemplatesServiceSpy.getTenantPageTemplates).toHaveBeenCalledTimes(1);
  });

  it('should render templates list when activeNavigation is templates and pageTemplates is not empty', async () => {
    pageTemplatesServiceSpy.getTenantPageTemplates.and.returnValue(
      of([
        {
          template: { templateId: 'test-template', name: 'Test Template', access: adminPermissions },
          pageDesign: mockPageDesign,
        },
      ]),
    );
    await sut.ngOnInit();
    fixture.detectChanges();

    const templatesList = fixture.debugElement.query(By.css('.templates-list-container'));
    expect(templatesList).toBeTruthy();
    expect(sut.isLoadingTemplates).toBeFalsy();
  });

  it('should reset page templates items to empty, show error message if service returns an error', async () => {
    // Arrange
    pageTemplatesServiceSpy.getTenantPageTemplates.and.returnValue(throwError(() => new Error('Test error')));

    // Act
    contextService.provideDefaultTestContext();
    await sut.ngOnInit();

    // Assert
    expect(sut.pageTemplates).toEqual([]);
    const [{ id, text, severity }] = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args;
    // expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
    expect(text).toBe('PAGE_DESIGNS.WORKSPACE.BAD_REQUEST_ERROR_MESSAGE');
    expect(severity).toBe('error');
    expect(id).toBe('templateDesignRequestError');
  });

  describe('openTemplateInContentEditor', () => {
    it('should open template root in content editor in a new tab', () => {
      spyOn(window, 'open');

      sut.openTemplateInContentEditor();

      const expectedUrl = `http://cm.com/sitecore/shell/Applications/Content%20Editor.aspx?fo=${TEMPLATE_ROOT_ITEM_ID}&lang=lang1`;
      expect(window.open).toHaveBeenCalledWith(expectedUrl, '_blank');
    });

    it('should open passed template in content editor in a new tab', () => {
      spyOn(window, 'open');

      const templateId = 'DD1715FE-6A13-4FCF-845F-DE308BA9741D';
      sut.openTemplateInContentEditor(templateId);

      const expectedUrl = `http://cm.com/sitecore/shell/Applications/Content%20Editor.aspx?fo=${templateId}&lang=lang1`;
      expect(window.open).toHaveBeenCalledWith(expectedUrl, '_blank');
    });
  });

  describe('configureInsertOptions', () => {
    it('should open the consfigure insert options dialog with required parameters', () => {
      const pageTemplate: TenantPageTemplate = {
        template: { templateId: 'test-template', name: 'Test Template', access: adminPermissions },
        pageDesign: null,
      };
      sut.pageTemplates = [
        { ...pageTemplate },
        { pageDesign: null, template: { templateId: 'template-id2', name: 'template2' } },
      ];

      // Act
      sut.configureInsertOptions(pageTemplate.template.templateId);

      // Assert
      expect(insertOptionsConfigurationsDialogServiceSpy.show).toHaveBeenCalledWith({
        templateId: pageTemplate.template.templateId,
        templatesList: sut.pageTemplates,
      });
    });

    it('should set text to `SET` if insert options for templates is not empty', async () => {
      // Arrange
      const pageTemplate: TenantPageTemplate = {
        template: {
          templateId: 'test-template',
          name: 'Test Template',
          standardValuesItem: {
            itemId: 'sv-id1',
            insertOptions: [{ templateId: 'template-id1' }, { templateId: 'template-id2' }],
          },
          access: adminPermissions,
        },
        pageDesign: mockPageDesign,
      };
      pageTemplatesServiceSpy.getTenantPageTemplates.and.returnValue(of([pageTemplate]));

      // Act
      await sut.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert
      expect(textElement().textContent).toEqual(' PAGE_DESIGNS.WORKSPACE.TEMPLATES_TABLE.NONE_SET ');
    });

    it('should set text to `NOT SET` if insert options for templates is empty', async () => {
      // Arrange
      const pageTemplate: TenantPageTemplate = {
        template: {
          templateId: 'test-template',
          name: 'Test Template',
          standardValuesItem: {
            itemId: 'sv-id1',
            insertOptions: [],
          },
          access: adminPermissions,
        },
        pageDesign: mockPageDesign,
      };
      pageTemplatesServiceSpy.getTenantPageTemplates.and.returnValue(of([pageTemplate]));

      // Act
      await sut.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();

      // Assert
      expect(textElement().textContent).toEqual(' PAGE_DESIGNS.WORKSPACE.TEMPLATES_TABLE.NONE_SET ');
    });
  });

  describe('assignPageDesign', () => {
    it('should open the assign page design dialog with required parameters', async () => {
      // Arrange
      pageTemplatesServiceSpy.getTenantPageTemplates.and.returnValue(of(mockPageTemplates));

      // Act
      await sut.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();
      assignPageDesignButton()[0].nativeElement.click();

      // Arrange
      expect(assignPageDesignDialogServiceSpy.show).toHaveBeenCalledWith(
        'testId',
        mockPageTemplates,
        '110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9',
      );
    });
  });

  describe('delete template', () => {
    beforeEach(async () => {
      pageTemplatesServiceSpy.getTenantPageTemplates.and.returnValue(
        of([
          {
            template: { templateId: 'test-template', name: 'Test Template', access: adminPermissions },
            pageDesign: mockPageDesign,
          },
        ]),
      );
      pageTemplatesServiceSpy.getItemDetails.and.returnValue(
        of({
          path: '/test/item',
          displayName: 'Test Template',
          itemId: 'test-template',
          parentId: 'parentId',
          name: 'testTemplate',
          version: 1,
          hasChildren: false,
          thumbnailUrl: 'testUrl',
          hasPresentation: true,
          isFolder: false,
          insertOptions: [],
          createdDate: new Date('2023-01-01T00:00:00').toISOString(),
          updatedDate: new Date('2023-01-01T01:00:00').toISOString(),
          access: adminPermissions,
        }),
      );

      await sut.ngOnInit();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('should call deleteItem with "templateId"', async () => {
      // Arrange
      const itemId = 'test-template';
      pageTemplatesServiceSpy.deleteItem.and.returnValue(of({ successful: true, errorMessage: null, item: null }));

      // Act
      getBtnFromTemplateContextMenu(0, 3).click();
      await fixture.whenStable();

      confirmInDialog();
      await fixture.whenStable();

      // Assert
      expect(pageTemplatesServiceSpy.deleteItem).toHaveBeenCalledWith(itemId, false);
    });

    it('should not call deleteItem with "itemId" WHEN dialog is declined', async () => {
      // Arrange
      pageTemplatesServiceSpy.deleteItem.and.returnValue(of({ successful: true, errorMessage: null, item: null }));

      // Act
      getBtnFromTemplateContextMenu(0, 3).click();
      await fixture.whenStable();

      cancelInDialog();
      await fixture.whenStable();

      // Assert
      expect(pageTemplatesServiceSpy.deleteItem).not.toHaveBeenCalled();
    });

    it('should update the templates in the list', async () => {
      // Arrange
      const itemId = 'test-template';
      pageTemplatesServiceSpy.deleteItem.and.returnValue(of({ successful: true, errorMessage: null, item: null }));

      // Act
      getBtnFromTemplateContextMenu(0, 3).click();
      await fixture.whenStable();

      confirmInDialog();
      await fixture.whenStable();

      // Assert
      expect(sut.pageTemplates.find((pageTemplate) => pageTemplate.template.templateId === itemId)).toBeFalsy();
    });

    it('should show notification error when delete template fails', async () => {
      // Arrange
      pageTemplatesServiceSpy.deleteItem.and.returnValue(
        of({ successful: false, errorMessage: 'errorMessage', item: null }),
      );

      // Act
      getBtnFromTemplateContextMenu(0, 3).click();
      await fixture.whenStable();

      confirmInDialog();
      await fixture.whenStable();

      // Assert
      const [{ id, text, severity }] = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args;
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
      expect(text).toBe('errorMessage');
      expect(severity).toBe('error');
      expect(id).toBe('pageTemplateRequestError');
    });
  });
});
