/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DroplistModule } from '@sitecore/ng-spd-lib';
import { LhsPanelModule } from 'app/editor/lhs-panel/lhs-panel.module';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { DatasourcePickerService } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import {
  BaseItemDalService,
  ItemDalService,
  ItemField,
  ItemFieldDataSource,
} from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { TreeNode } from 'app/shared/item-tree/item-tree.component';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { DroptreeFieldComponent } from './droptree-field.component';

@Component({
  template: `<app-droptree-field [field]="field" [currentValue]="currentValue"> </app-droptree-field>`,
})
class TestDroptreeFieldComponent {
  @Input() field: ItemField;
  @Input() currentValue: string;
}

describe(DroptreeFieldComponent.name, () => {
  let sut: DroptreeFieldComponent;
  let testComponent: TestDroptreeFieldComponent;
  let fixture: ComponentFixture<TestDroptreeFieldComponent>;
  let context: ContextServiceTesting;
  let itemDalServiceSpy: jasmine.SpyObj<ItemDalService>;
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
      path: '/test',
    },
  ];

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

  const detectChanges = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
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
      declarations: [DroptreeFieldComponent, TestDroptreeFieldComponent],
      providers: [
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>({
            getItem: of({} as Item),
            getItemPath: of('/home'),
          }),
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
    fixture = TestBed.createComponent(TestDroptreeFieldComponent);
    testComponent = fixture.componentInstance;

    sut = fixture.debugElement.query(By.directive(DroptreeFieldComponent)).componentInstance;

    context = TestBed.inject(ContextServiceTesting);
    context.provideTestValue(initialContext);

    itemDalServiceSpy = TestBedInjectSpy(BaseItemDalService);
    itemDalServiceSpy.getItemPath.and.returnValue(of('/home'));

    dsPickerServiceSpy = TestBedInjectSpy(DatasourcePickerService);
    dsPickerServiceSpy.fetchRawItemChildren.and.returnValue(
      of([{ id: 'test-item-id', displayName: 'test-item-from-service-name' }] as TreeNode[]),
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should set tree data when droplist is toggled', async () => {
    const fieldDataSource: ItemFieldDataSource[] = [
      {
        itemId: 'id1',
        displayName: 'testItem1',
        hasChildren: true,
        hasPresentation: true,
        path: '/testItem1',
      },
      {
        itemId: 'id2',
        displayName: 'testItem2',
        hasChildren: true,
        hasPresentation: true,
        path: '/testItem2',
      },
    ];
    sut.field = mockField(fieldDataSource);
    dropListBtn().click();
    await detectChanges();

    expect(sut.data.length).toBe(2);
    expect(sut.data).toEqual([
      {
        id: 'id1',
        displayName: 'testItem1',
        isFolder: false,
        isSelectable: true,
        hasChildren: true,
        path: '/testItem1',
      },
      {
        id: 'id2',
        displayName: 'testItem2',
        isFolder: false,
        isSelectable: true,
        hasChildren: true,
        path: '/testItem2',
      },
    ]);
  });

  it('should show the selected value', async () => {
    testComponent.currentValue = '{testId}';
    itemDalServiceSpy.getItemPath.and.returnValue(of('/test'));
    await detectChanges();

    const selectedItemEl = fixture.debugElement.query(By.css('.selected-item')).nativeElement;

    expect(selectedItemEl.textContent).toContain('test');
  });

  it('should fetch the item path if field has value', async () => {
    testComponent.currentValue = '{testId}';
    await detectChanges();

    expect(itemDalServiceSpy.getItemPath).toHaveBeenCalled();
  });

  it('should not make a call to get item path if field value is empty', async () => {
    testComponent.currentValue = '';
    await detectChanges();

    expect(itemDalServiceSpy.getItemPath).not.toHaveBeenCalled();
  });

  it('should emit selectedValueChange on selection change', async () => {
    const emitSpy = spyOn(sut.selectedValueChange, 'emit');
    sut.onSelectionChange('testId', '/test123');

    expect(emitSpy).toHaveBeenCalledWith({ rawValue: '{TESTID}' });
  });
});
