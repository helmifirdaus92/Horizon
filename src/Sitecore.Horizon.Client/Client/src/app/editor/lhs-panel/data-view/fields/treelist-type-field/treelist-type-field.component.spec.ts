/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DroplistModule } from '@sitecore/ng-spd-lib';
import { LhsPanelModule } from 'app/editor/lhs-panel/lhs-panel.module';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { DatasourcePickerService } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import {
  BaseItemDalService,
  ItemDalService,
  ItemField,
  ItemFieldDataSource,
} from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { TreeNode } from 'app/shared/item-tree/item-tree.component';
import { Site, SiteService } from 'app/shared/site-language/site-language.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { TreelistTypeFieldComponent } from './treelist-type-field.component';

class ConfigurationServiceMock implements Partial<ConfigurationService> {
  get globalTagsRepository(): string {
    return this._globalTagsRepository;
  }
  _globalTagsRepository = '';
}

@Component({
  template: `<app-treelist-type-field [field]="field" [currentValue]="currentValue"> </app-treelist-type-field>`,
})
class TestTreeListTypeFieldComponent {
  @Input() field: ItemField;
  @Input() currentValue: string;
}

describe(TreelistTypeFieldComponent.name, () => {
  let sut: TreelistTypeFieldComponent;
  let testComponent: TestTreeListTypeFieldComponent;
  let fixture: ComponentFixture<TestTreeListTypeFieldComponent>;
  let context: ContextServiceTesting;
  let itemDalServiceSpy: jasmine.SpyObj<ItemDalService>;
  let siteServiceSpy: jasmine.SpyObj<SiteService>;
  let configurationService: ConfigurationServiceMock;
  let dsPickerServiceSpy: jasmine.SpyObj<DatasourcePickerService>;

  const initialContext = {
    itemId: 'test',
    language: 'pt-BR',
    siteName: 'sitecore1',
    itemVersion: 1,
  };

  const testFieldDataSource = [
    {
      displayName: 'test',
      itemId: '{testId}',
      hasChildren: true,
      hasPresentation: true,
    },
  ];

  const detectChanges = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  const mockField = (dataSource: ItemFieldDataSource[] = testFieldDataSource): ItemField => {
    return {
      item: {
        id: 'id001',
        version: 1,
        revision: 'rev001',
        language: 'en',
        access: {
          canRead: true,
          canWrite: true,
        },
      },
      value: { rawValue: 'value1' },
      containsStandardValue: false,
      access: {
        canRead: true,
        canWrite: true,
      },
      templateField: {
        templateFieldId: 'templateFieldId1',
        name: 'Content',
        type: 'Multiroot Treelist',
        sectionName: 'Content',
        dataSource,
        versioning: 'SHARED',
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
      },
      validation: [
        {
          message: 'Invalid value',
          valid: false,
          validator: 'ValidatorName',
        },
      ],
    };
  };

  const dropListBtn = () => fixture.debugElement.query(By.css('ng-spd-droplist button')).nativeElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        LhsPanelModule,
        ContextServiceTestingModule,
        DroplistModule,
      ],
      declarations: [TreelistTypeFieldComponent, TestTreeListTypeFieldComponent],
      providers: [
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>({
            getItem: of({} as Item),
            getItemDisplayName: of('name'),
          }),
        },
        {
          provide: ConfigurationService,
          useClass: ConfigurationServiceMock,
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('SiteService', ['getContextSite']),
        },
        {
          provide: DatasourcePickerService,
          useValue: jasmine.createSpyObj<DatasourcePickerService>({
            fetchRawItemChildren: of([]),
          }),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestTreeListTypeFieldComponent);
    testComponent = fixture.componentInstance;
    testComponent.field = mockField();

    sut = fixture.debugElement.query(By.directive(TreelistTypeFieldComponent)).componentInstance;

    context = TestBed.inject(ContextServiceTesting);
    context.provideTestValue(initialContext);

    itemDalServiceSpy = TestBedInjectSpy(BaseItemDalService);

    siteServiceSpy = TestBedInjectSpy(SiteService);
    siteServiceSpy.getContextSite.and.returnValue({
      id: 'siteId',
      properties: { tagsFolderId: 'tagsFolderId' },
    } as Site);

    dsPickerServiceSpy = TestBedInjectSpy(DatasourcePickerService);
    dsPickerServiceSpy.fetchRawItemChildren.and.returnValue(
      of([{ id: 'test-item-id', displayName: 'test-item-from-service-name' }] as TreeNode[]),
    );

    configurationService = TestBed.inject(ConfigurationService) as any;

    sut.isAddMode = false;
    itemDalServiceSpy.getItemDisplayName.and.returnValue(of('name'));
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
    expect(testComponent).toBeTruthy();
  });

  describe('Multiroot Treelist', () => {
    it('should initialize the tree data on component load', async () => {
      const fieldDataSource: ItemFieldDataSource[] = [
        {
          displayName: 'testDs',
          itemId: 'testId',
          hasChildren: true,
          hasPresentation: true,
        },
        {
          displayName: 'testDs2',
          itemId: 'testId2',
          hasChildren: true,
          hasPresentation: true,
        },
      ];

      sut.field = mockField(fieldDataSource);
      dropListBtn().click();
      await detectChanges();

      expect(sut.data).toEqual([
        {
          id: 'testId',
          displayName: 'testDs',
          isFolder: false,
          isSelectable: true,
          hasChildren: true,
        },
        {
          id: 'testId2',
          displayName: 'testDs2',
          isFolder: false,
          isSelectable: true,
          hasChildren: true,
        },
      ]);
    });

    it('should show the selected field item', async () => {
      testComponent.currentValue = '{testId}';

      await detectChanges();

      const selectedValueTags = fixture.nativeElement.querySelectorAll('.multi-tree-list-items app-tag');

      expect(selectedValueTags.length).toBe(1);
      expect(selectedValueTags[0].textContent).toContain('name');
    });

    it('should not make a call to get item name property field value is empty', async () => {
      testComponent.currentValue = '';

      await detectChanges();

      expect(itemDalServiceSpy.getItemDisplayName).not.toHaveBeenCalled();
    });

    it('should fetch the item name property if field has value', async () => {
      testComponent.currentValue = '{testId}';

      await detectChanges();

      expect(itemDalServiceSpy.getItemDisplayName).toHaveBeenCalled();
    });
  });

  describe('TagList', () => {
    it('should set tag list tree data', async () => {
      testComponent.field = { ...mockField(), templateField: { ...mockField().templateField, type: 'Taglist' } };
      configurationService._globalTagsRepository = 'globalTagsRepository';
      await detectChanges();

      dropListBtn().click();
      await fixture.whenStable();

      expect(sut.data.length).toBe(2);
    });

    it('should not make a call to get item with children if global tag and site tags are not defined', async () => {
      testComponent.field = { ...mockField(), templateField: { ...mockField().templateField, type: 'Taglist' } };

      configurationService._globalTagsRepository = '';
      siteServiceSpy.getContextSite.and.returnValue({ id: 'siteId', properties: { tagsFolderId: '' } } as Site);
      await detectChanges();

      dropListBtn().click();
      await fixture.whenStable();

      expect(dsPickerServiceSpy.fetchRawItemChildren).not.toHaveBeenCalled();
    });
  });
});
