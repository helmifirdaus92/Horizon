/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingIndicatorModule } from '@sitecore/ng-spd-lib';
import { TagComponent } from 'app/component-lib/tag/tag.component';
import { PageSettingsDialogModule } from 'app/pages/page-settings/page-settings-dialog.module';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import {
  BaseItemDalService,
  ItemDalService,
  ItemField,
  ItemFieldValidationResult,
} from 'app/shared/graphql/item.dal.service';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { FieldState } from 'sdk/contracts/editing-shell.contract';
import { EditorWorkspaceService } from '../../editor-workspace/editor-workspace.service';
import { EditorModule } from '../../editor.module';
import { DataViewComponent } from './data-view.component';
import { FieldsTrackerService } from './fields-tracker.service';

describe(DataViewComponent.name, () => {
  let sut: DataViewComponent;
  let fixture: ComponentFixture<DataViewComponent>;
  let fieldsTrackerServiceSpy: jasmine.SpyObj<FieldsTrackerService>;
  let itemDalServiceSpy: jasmine.SpyObj<ItemDalService>;

  const testItem = {
    id: 'id001',
    version: 1,
    revision: 'rev001',
    language: 'en',
    access: {
      canRead: true,
      canWrite: true,
    },
  };

  const mockItemFields: ItemField[] = [
    {
      item: testItem,
      value: { rawValue: 'value1' },
      containsStandardValue: false,
      access: {
        canRead: true,
        canWrite: true,
      },
      templateField: {
        templateFieldId: 'templateFieldId1',
        name: 'Content',
        type: 'Rich Text',
        sectionName: 'Content',
        dataSource: [
          {
            displayName: 'ds1',
            itemId: 'id1',
          },
        ] as any,
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        versioning: 'SHARED',
      },
      validation: [
        {
          message: 'Invalid value',
          valid: false,
          validator: 'Extern Link Target',
          result: undefined,
        },
      ],
    },
    {
      item: testItem,
      value: { rawValue: 'value2' },
      containsStandardValue: false,
      access: {
        canRead: true,
        canWrite: true,
      },
      templateField: {
        templateFieldId: 'templateFieldId2',
        name: 'Title',
        type: 'Single-Line Text',
        sectionName: 'Content',
        dataSource: [
          {
            displayName: 'ds2',
            itemId: 'id2',
          },
        ] as any,
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        versioning: 'VERSIONED',
      },
      validation: [
        {
          message: 'Invalid value',
          valid: false,
          validator: 'XHtml Validator',
        },
      ],
    },
    {
      item: testItem,
      value: { rawValue: 'value3' },
      containsStandardValue: true,
      access: {
        canRead: true,
        canWrite: true,
      },
      templateField: {
        templateFieldId: 'templateFieldId3',
        name: 'NavigationClass',
        type: 'Droplink',
        sectionName: 'Navigation',
        dataSource: [
          {
            displayName: 'Home',
            itemId: 'ds_1',
          },
          {
            displayName: 'About',
            itemId: 'ds_123',
          },
        ] as any,
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        versioning: 'SHARED',
      },
      validation: [],
    },
    {
      item: testItem,
      value: { rawValue: '{ID4}' },
      containsStandardValue: true,
      access: {
        canRead: true,
        canWrite: true,
      },
      templateField: {
        templateFieldId: 'templateFieldId4',
        name: 'NavigationFilter',
        type: 'Checklist',
        sectionName: 'Navigation',
        dataSource: [
          {
            displayName: 'ds4',
            itemId: 'id4',
          },
        ] as any,
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        versioning: 'UNVERSIONED',
      },
      validation: [],
    },
    {
      item: testItem,
      value: { rawValue: 'value5' },
      containsStandardValue: false,
      access: {
        canRead: true,
        canWrite: true,
      },
      templateField: {
        templateFieldId: 'templateFieldId5',
        name: 'Tag',
        type: 'Tag Treelist',
        sectionName: 'SxaTags',
        dataSource: [],
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        versioning: 'SHARED',
      },
      validation: [],
    },
    {
      item: testItem,
      value: { rawValue: 'value6' },
      containsStandardValue: true,
      access: {
        canRead: true,
        canWrite: true,
      },
      templateField: {
        templateFieldId: 'templateFieldId6',
        name: 'Droplist',
        type: 'Droplist',
        sectionName: 'NewSection',
        dataSource: [
          {
            displayName: 'Home',
            itemId: 'id1',
          },
          {
            displayName: 'About',
            itemId: 'id2',
          },
        ] as any,
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        versioning: 'UNVERSIONED',
      },
      validation: [],
    },
    {
      item: testItem,
      value: { rawValue: 'value7' },
      containsStandardValue: false,
      access: {
        canRead: true,
        canWrite: true,
      },
      templateField: {
        templateFieldId: 'templateFieldId7',
        name: 'Content',
        type: 'Rich Text',
        sectionName: 'Content',
        dataSource: [
          {
            displayName: 'ds2',
            itemId: 'id2',
          },
        ] as any,
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        versioning: 'SHARED',
      },
      validation: [
        {
          message: 'Warning message',
          valid: false,
          validator: 'Extern Link Target',
          result: ItemFieldValidationResult.Warning,
        },
      ],
    },
  ] as ItemField[];

  const detectChanges = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const listButtons = () => fixture.debugElement.queryAll(By.css('.drop-list ng-spd-droplist button'));

  beforeEach(async () => {
    itemDalServiceSpy = jasmine.createSpyObj('ItemDalService', ['fetchItemFields', 'fetchItemField']);

    await TestBed.configureTestingModule({
      imports: [
        PageSettingsDialogModule,
        TranslateModule,
        TranslateServiceStubModule,
        EditorModule,
        NoopAnimationsModule,
        LoadingIndicatorModule,
        TagComponent,
      ],
      declarations: [DataViewComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: FieldsTrackerService,
          useValue: jasmine.createSpyObj<FieldsTrackerService>('DataViewService', [
            'watchFieldsValueChange',
            'watchFieldsSaved',
            'notifyFieldValueChange',
            'notifyInitialItemFieldsState',
          ]),
        },
        {
          provide: EditorWorkspaceService,
          useValue: jasmine.createSpyObj<EditorWorkspaceService>('EditorWorkspaceService', ['watchCanvasLoadState']),
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>({}, { isSaveSupportsResetField: () => true } as any),
        },
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>('BaseItemDalService', [
            'fetchItemFields',
            'fetchItemField',
          ]),
        },
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>(['getEditingCanvasChannel']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataViewComponent);
    sut = fixture.componentInstance;

    fieldsTrackerServiceSpy = TestBedInjectSpy(FieldsTrackerService);
    itemDalServiceSpy = TestBedInjectSpy(BaseItemDalService);
    itemDalServiceSpy.fetchItemFields.and.resolveTo(mockItemFields);
    itemDalServiceSpy.fetchItemField.and.returnValue(of(mockItemFields[0]));
    fieldsTrackerServiceSpy.watchFieldsValueChange.and.returnValue(of([]));
    fieldsTrackerServiceSpy.watchFieldsSaved.and.returnValue(of([]));
    sut.isLoading = false;

    await detectChanges();
  });

  beforeEach(async () => {
    sut.item = { id: 'id001', language: 'en', version: 1 };
    await detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should show list of sections with fields when itemId changed', async () => {
      const sectionsElement = fixture.debugElement.queryAll(By.css('ng-spd-accordion-header'));

      expect(sectionsElement.length).toBe(4);
      expect(sectionsElement[0].nativeElement.textContent).toContain('Content');
      expect(sectionsElement[1].nativeElement.textContent).toContain('Navigation');
    });

    it('should render templateField datasource as a list if field type is Droplink', async () => {
      const dropList = fixture.debugElement.queryAll(By.css('ng-spd-droplist button'));
      dropList[0].nativeElement.click();
      fixture.detectChanges();

      const dropListItem = fixture.debugElement.queryAll(By.css('ng-spd-droplist-item'));
      expect(dropListItem.length).toBe(2);
      expect(dropListItem[0].nativeElement.innerText).toContain('Home');
      expect(dropListItem[1].nativeElement.innerText).toContain('About');
    });

    it('should render templateField datasource value with checkbok if field type is Checklist', async () => {
      listButtons()[1].nativeElement.click();
      fixture.detectChanges();

      const checkBoxEl = fixture.debugElement.queryAll(By.css('ng-spd-checkbox'));
      const textContent = fixture.debugElement.queryAll(By.css('ng-spd-checkbox span:nth-child(2)'));

      expect(checkBoxEl.length).toBe(1);
      expect(textContent[0].nativeElement.textContent).toContain('ds4');
    });

    it('should render field value as input if field type is Single-Line Text', async () => {
      const singleLineTextarea = fixture.debugElement.queryAll(By.css('input'))[0];

      expect(singleLineTextarea.nativeElement.value).toBe('value2');
    });

    it('should update field value in data view when it is changed from canvas', async () => {
      const fieldToUpdate: FieldState = {
        value: { rawValue: 'new updated value' },
        fieldId: 'templateFieldId5',
        itemId: 'id001',
        itemVersion: 1,
        reset: false,
      };

      fieldsTrackerServiceSpy.watchFieldsValueChange.and.returnValue(of([fieldToUpdate]));

      sut.ngOnInit();
      sut.isLoading = false;
      await detectChanges();

      const updateFiledTextarea = fixture.debugElement.queryAll(By.css('textarea'))[0];

      expect(updateFiledTextarea.nativeElement.value).toBe('new updated value');
    });

    it('should show error block with message if field value is invalid', async () => {
      const errorBlocks = fixture.debugElement.queryAll(By.css('.error-message'));

      expect(errorBlocks.length).toBe(2);
      expect(errorBlocks[0].nativeElement.textContent).toContain('EDITOR.SAVE.ERRORS.XHTML_VALIDATOR_MESSAGE');
      expect(errorBlocks[1].nativeElement.textContent).toContain('Invalid value');
    });

    it('should show warning block with message if field value has warnings', async () => {
      const errorBlocks = fixture.debugElement.queryAll(By.css('.warning-message'));

      expect(errorBlocks.length).toBe(1);
      expect(errorBlocks[0].nativeElement.textContent).toContain('Warning message');
    });

    it('should show number of selected items in checklist field', async () => {
      const listButtons = fixture.debugElement.queryAll(By.css('ng-spd-droplist'));
      const textContent = listButtons[1].nativeElement.textContent;

      expect(textContent).toContain('EDITOR.DATA_VIEW.ITEMS_SELECTED {"selectedItems":1}');
    });
  });

  describe('onSelectedDropLinkItemChange()', () => {
    it('should update the field value when the droplink item is selected', async () => {
      const dropList = fixture.debugElement.query(By.css('ng-spd-droplist button'));
      dropList.nativeElement.click();
      fixture.detectChanges();

      const dropListItem = fixture.debugElement.queryAll(By.css('ng-spd-droplist-item'));
      dropListItem[1].nativeElement.click();
      fixture.detectChanges();

      const updatedFieldState: FieldState = {
        value: { rawValue: '{DS_123}' },
        fieldId: 'templateFieldId3',
        itemId: 'id001',
        itemVersion: 1,
        reset: false,
      };

      expect(fieldsTrackerServiceSpy.notifyFieldValueChange).toHaveBeenCalledWith([updatedFieldState]);
    });
  });

  describe('onSelectedDropListItemChange()', () => {
    it('should update the field value when the dropList item is selected', async () => {
      const dropList = fixture.debugElement.queryAll(By.css('ng-spd-droplist button'));
      dropList[2].nativeElement.click();
      fixture.detectChanges();

      const dropListItem = fixture.debugElement.queryAll(By.css('ng-spd-droplist-item'));
      dropListItem[1].nativeElement.click();
      fixture.detectChanges();

      const updatedFieldState: FieldState = {
        value: { rawValue: 'About' },
        fieldId: 'templateFieldId6',
        itemId: 'id001',
        itemVersion: 1,
        reset: false,
      };

      expect(fieldsTrackerServiceSpy.notifyFieldValueChange).toHaveBeenCalledWith([updatedFieldState]);
    });
  });

  describe('resetToStandardValue()', () => {
    it('should reset the field value to standard value', async () => {
      const resetBtn = fixture.debugElement.queryAll(By.css('button.reset'));
      resetBtn[0].nativeElement.click();
      fixture.detectChanges();

      const field = mockItemFields[1];
      const updatedFieldState: FieldState = {
        value: field.value,
        fieldId: field.templateField.templateFieldId,
        itemId: 'id001',
        itemVersion: 1,
        reset: true,
      };
      expect(mockItemFields[1].containsStandardValue).toBe(true);
      expect(fieldsTrackerServiceSpy.notifyFieldValueChange).toHaveBeenCalledWith([updatedFieldState]);
    });
  });
});
