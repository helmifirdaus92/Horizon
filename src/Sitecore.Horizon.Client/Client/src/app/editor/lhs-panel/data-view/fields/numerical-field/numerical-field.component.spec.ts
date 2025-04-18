/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NgModel } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { LhsPanelModule } from 'app/editor/lhs-panel/lhs-panel.module';
import { ItemField, ItemFieldType } from 'app/shared/graphql/item.dal.service';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { NumericalFieldComponent } from './numerical-field.component';

describe(NumericalFieldComponent.name, () => {
  let sut: NumericalFieldComponent;
  let fixture: ComponentFixture<NumericalFieldComponent>;

  const mockField = (type: ItemFieldType = 'Number'): ItemField => {
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
      value: { rawValue: '123' },
      containsStandardValue: false,
      access: {
        canRead: true,
        canWrite: true,
      },
      templateField: {
        templateFieldId: 'templateFieldId1',
        name: 'Content',
        type,
        sectionName: 'Content',
        dataSource: [],
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        versioning: 'SHARED',
      },
      validation: [],
    };
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule, TranslateServiceStubModule, LhsPanelModule],
      declarations: [NumericalFieldComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumericalFieldComponent);
    sut = fixture.componentInstance;

    sut.field = mockField();
    sut.currentValue = '123';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should prevent scientific notation', () => {
    const event = new KeyboardEvent('keydown', { key: 'e' });
    spyOn(event, 'preventDefault');

    sut.preventScientificNotation(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should emit valueChange event on input change', () => {
    sut.inputValue = '1234';
    const spy = spyOn(sut.valueChange, 'emit');

    sut.onInputChange({ dirty: true, errors: null } as NgModel, true);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });

  it('should not emit valueChange event on input change if input is not dirty', () => {
    const spy = spyOn(sut.valueChange, 'emit');

    sut.onInputChange({ dirty: false, errors: null } as NgModel, true);
    fixture.detectChanges();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit valueChange event on input change if input value is the same as field value', () => {
    const spy = spyOn(sut.valueChange, 'emit');
    sut.inputValue = '123';

    sut.onInputChange({ dirty: true, errors: null } as NgModel, true);

    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit fieldBlur event on input change if debounce is false', () => {
    sut.inputValue = '1234';
    const spy = spyOn(sut.fieldBlur, 'emit');

    sut.onInputChange({ dirty: true, errors: null } as NgModel, false);
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
  });

  describe('Integer field', () => {
    it('should show error messge if value is not a valid integer', () => {
      sut.field = mockField('Integer');
      fixture.detectChanges();

      const integerInput = fixture.debugElement.query(By.css('input')).nativeElement;
      integerInput.value = '123.45';
      integerInput.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const errorEl = fixture.debugElement.query(By.css('.error-message')).nativeElement;

      expect(errorEl).toBeTruthy();
      expect(errorEl.textContent).toContain('EDITOR.DATA_VIEW.NOT_VALID_VALUE');
    });
  });
});
