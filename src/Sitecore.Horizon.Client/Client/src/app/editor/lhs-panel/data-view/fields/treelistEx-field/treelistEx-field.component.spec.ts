/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from '@sitecore/ng-spd-lib';
import { LhsPanelModule } from 'app/editor/lhs-panel/lhs-panel.module';
import { BaseItemDalService, ItemField } from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { TreelistExDialogService } from './treelistEx-dialog.service';
import { TreelistExFieldComponent } from './treelistEx-field.component';

@Component({
  template: `<app-treelistex-field
    [field]="field"
    [datasourcesCount]="field.templateField.dataSource.length"
    [currentValue]="currentValue"
  >
  </app-treelistex-field>`,
})
class TestTreelistExFieldComponent {
  @Input() field: ItemField;
  @Input() currentValue: string;
  fetchAllPaginatedData = () => Promise.resolve();
}

describe(TreelistExFieldComponent.name, () => {
  let sut: TreelistExFieldComponent;
  let testComponent: TestTreelistExFieldComponent;
  let fixture: ComponentFixture<TestTreelistExFieldComponent>;
  let itemDalServiceSpy: jasmine.SpyObj<BaseItemDalService>;
  let treeListExDialogServiceSpy: jasmine.SpyObj<TreelistExDialogService>;

  const mockField = (): ItemField => {
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
      value: { rawValue: '{value1}' },
      containsStandardValue: false,
      access: {
        canRead: true,
        canWrite: true,
      },
      templateField: {
        templateFieldId: 'templateFieldId1',
        name: 'Content',
        type: 'TreelistEx',
        sectionName: 'Content',
        dataSource: [
          {
            displayName: 'test',
            itemId: '{testId}',
            hasChildren: true,
            hasPresentation: true,
          },
        ],
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        versioning: 'SHARED',
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

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule, TranslateServiceStubModule, LhsPanelModule, DialogModule],
      providers: [
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>({
            getItemDisplayName: of('name'),
            getItem: of({} as Item),
          }),
        },
        {
          provide: TreelistExDialogService,
          useValue: jasmine.createSpyObj<TreelistExDialogService>(['show']),
        },
      ],
      declarations: [TreelistExFieldComponent, TestTreelistExFieldComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestTreelistExFieldComponent);
    testComponent = fixture.componentInstance;

    sut = fixture.debugElement.query(By.directive(TreelistExFieldComponent)).componentInstance;

    itemDalServiceSpy = TestBedInjectSpy(BaseItemDalService);
    itemDalServiceSpy.getItemDisplayName.and.returnValue(of('name'));

    treeListExDialogServiceSpy = TestBedInjectSpy(TreelistExDialogService);

    testComponent.field = mockField();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should show current value count', async () => {
    testComponent.currentValue = '{value1}';
    await detectChanges();

    const currentValueCount = fixture.debugElement.query(By.css('.values')).nativeElement;

    expect(itemDalServiceSpy.getItemDisplayName).toHaveBeenCalledTimes(1);
    expect(currentValueCount.textContent).toContain('EDITOR.DATA_VIEW.SELECTED_ITEM_COUNT {"selectedItems":1}');
  });

  it('should open item selection dialog if field does not have value and select item button click ', async () => {
    testComponent.currentValue = '';
    await detectChanges();

    const openDialogButton = fixture.debugElement.query(By.css('.select-item-button')).nativeElement;
    openDialogButton.click();
    await fixture.whenStable();

    expect(treeListExDialogServiceSpy.show).toHaveBeenCalledTimes(1);
  });

  it('should open item selection dialog if field has value and edit item button click ', async () => {
    testComponent.currentValue = '{value1}';
    await detectChanges();

    const openDialogButton = fixture.debugElement.query(By.css('.edit-item-button')).nativeElement;
    openDialogButton.click();
    await fixture.whenStable();

    expect(treeListExDialogServiceSpy.show).toHaveBeenCalledTimes(1);
  });
});
