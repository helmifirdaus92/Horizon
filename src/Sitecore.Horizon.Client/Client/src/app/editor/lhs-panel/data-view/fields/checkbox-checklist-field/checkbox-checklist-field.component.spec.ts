/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { LhsPanelModule } from 'app/editor/lhs-panel/lhs-panel.module';
import { ItemField } from 'app/shared/graphql/item.dal.service';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { CheckboxChecklistFieldComponent } from './checkbox-checklist-field.component';

describe(CheckboxChecklistFieldComponent.name, () => {
  let sut: CheckboxChecklistFieldComponent;
  let fixture: ComponentFixture<CheckboxChecklistFieldComponent>;

  const mockItemField: ItemField = {
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
      name: 'Checkbox',
      type: 'Checkbox',
      sectionName: 'Content',
      dataSource: [],
      versioning: 'SHARED',
      dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
    },
    validation: [],
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, LhsPanelModule],
      declarations: [CheckboxChecklistFieldComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckboxChecklistFieldComponent);
    sut = fixture.componentInstance;
    sut.field = mockItemField;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('Checkbox field', () => {
    it('should emit field value on checkbox change', () => {
      spyOn(sut.selectedItemChange, 'emit');

      const checkbox = fixture.debugElement.query(By.css('ng-spd-checkbox')).nativeElement;
      checkbox.click();

      expect(sut.selectedItemChange.emit).toHaveBeenCalled();
    });
  });

  describe('Checklist field', () => {
    it('should emit field value on checklist change', () => {
      sut.field = { ...mockItemField, templateField: { ...mockItemField.templateField, type: 'Checklist' } };
      spyOn(sut.selectedItemChange, 'emit');

      const checkbox = fixture.debugElement.query(By.css('ng-spd-checkbox')).nativeElement;
      checkbox.click();

      expect(sut.selectedItemChange.emit).toHaveBeenCalled();
    });

    it('should show list of field data source items', () => {
      sut.field = {
        ...mockItemField,
        templateField: {
          ...mockItemField.templateField,
          type: 'Checklist',
          dataSource: [
            {
              displayName: 'ds1',
              itemId: '1',
              hasChildren: false,
              hasPresentation: false,
            },
            {
              displayName: 'ds2',
              itemId: '2',
              hasChildren: false,
              hasPresentation: false,
            },
          ],
        },
      };
      fixture.detectChanges();

      const dropListElement = fixture.debugElement.query(By.css('ng-spd-droplist button')).nativeElement;
      dropListElement.click();

      const checklistItems = fixture.debugElement.queryAll(By.css('ng-spd-checkbox'));

      expect(checklistItems.length).toBe(2);
    });
  });
});
