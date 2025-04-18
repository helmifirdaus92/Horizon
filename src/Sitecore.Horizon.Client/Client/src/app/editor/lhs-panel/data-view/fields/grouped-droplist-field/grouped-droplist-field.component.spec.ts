/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DroplistModule } from '@sitecore/ng-spd-lib';
import { LhsPanelModule } from 'app/editor/lhs-panel/lhs-panel.module';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { DatasourcePickerService } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import { ItemField, ItemFieldDataSource } from 'app/shared/graphql/item.dal.service';
import { TreeNode } from 'app/shared/item-tree/item-tree.component';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { GroupedDroplistFieldComponent } from './grouped-droplist-field.component';

describe(GroupedDroplistFieldComponent.name, () => {
  let sut: GroupedDroplistFieldComponent;
  let fixture: ComponentFixture<GroupedDroplistFieldComponent>;
  let context: ContextServiceTesting;
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

  const droplistBtn = () => fixture.debugElement.query(By.css('ng-spd-droplist button')).nativeElement;
  const detectChanges = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

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
      declarations: [GroupedDroplistFieldComponent],
      providers: [
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
    fixture = TestBed.createComponent(GroupedDroplistFieldComponent);
    sut = fixture.componentInstance;

    context = TestBed.inject(ContextServiceTesting);
    context.provideTestValue(initialContext);

    dsPickerServiceSpy = TestBedInjectSpy(DatasourcePickerService);
    dsPickerServiceSpy.fetchRawItemChildren.and.returnValue(
      of([{ id: 'test-item-id', displayName: 'test-item-from-service-name' }] as TreeNode[]),
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should get droplist grouped items if field source is defined and droplist is toggled', async () => {
    sut.field = mockField();
    fixture.detectChanges();

    dsPickerServiceSpy.fetchRawItemChildren.and.returnValue(
      of([
        {
          displayName: 'child1',
          id: 'child1Id',
        },
        {
          displayName: 'child2',
          id: 'child2Id',
        },
      ] as TreeNode[]),
    );

    droplistBtn().click();
    await detectChanges();

    const categoryElement = fixture.debugElement.queryAll(By.css('.grouped-droplist-items .category'));
    const childElement = fixture.debugElement.queryAll(By.css('.grouped-droplist-items .children'));

    expect(categoryElement.length).toBe(1);
    expect(childElement.length).toBe(2);
  });

  it('should show no datasource message if field source is not defined', async () => {
    sut.field = mockField([]);
    fixture.detectChanges();

    droplistBtn().click();
    await detectChanges();

    const noDataSourceElement = fixture.debugElement.query(By.css('.no-data-source'));

    expect(dsPickerServiceSpy.fetchRawItemChildren).not.toHaveBeenCalled();
    expect(noDataSourceElement).toBeTruthy();
  });

  it('should emit selected item name as the rawValue', async () => {
    spyOn(sut.selectedValueChange, 'emit');
    sut.field = mockField();
    fixture.detectChanges();

    dsPickerServiceSpy.fetchRawItemChildren.and.returnValue(
      of([
        {
          displayName: 'child1',
          id: '1234',
        },
      ] as TreeNode[]),
    );

    droplistBtn().click();
    await detectChanges();

    const childElement = fixture.debugElement.queryAll(By.css('.grouped-droplist-items .children'));
    childElement[0].nativeElement.click();
    await detectChanges();

    expect(sut.selectedValueChange.emit).toHaveBeenCalledWith({ rawValue: 'child1' });
  });

  it('should not emit selected value if the selected item is the same as the current value', async () => {
    spyOn(sut.selectedValueChange, 'emit');
    sut.field = mockField();
    sut.currentValue = 'child1';
    fixture.detectChanges();

    dsPickerServiceSpy.fetchRawItemChildren.and.returnValue(
      of([
        {
          displayName: 'child1',
          id: 'b039ebe1-5813-4243-81ae-ea55b2352d80',
        },
      ] as TreeNode[]),
    );

    droplistBtn().click();
    await detectChanges();

    const childElement = fixture.debugElement.queryAll(By.css('.grouped-droplist-items .children'));
    childElement[0].nativeElement.click();
    await detectChanges();

    expect(sut.selectedValueChange.emit).not.toHaveBeenCalled();
  });
});
