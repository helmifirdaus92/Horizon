/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { InputLabelModule } from '@sitecore/ng-spd-lib';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { BasePage } from '../../../../../testing/page';
import { DatetimeFieldComponent } from './datetime-field.component';
import { DateFormatPipe } from './date-format.pipe';

describe(DatetimeFieldComponent.name, () => {
  let sut: DatetimeFieldComponent;
  let fixture: ComponentFixture<DatetimeFieldComponent>;
  let page: Page;

  class Page extends BasePage<DatetimeFieldComponent> {
    get dateInput(): HTMLInputElement {
      return this.query('input');
    }

    get dateHint() {
      return this.query<HTMLSpanElement>('div.datetime-field__info-container > span');
    }
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DatetimeFieldComponent, DateFormatPipe],
      imports: [CommonModule, FormsModule, TranslateModule, TranslateServiceStubModule, InputLabelModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatetimeFieldComponent);

    page = new Page(fixture);
    sut = fixture.componentInstance;
    sut.fieldInputState = { rawValue: '', fieldType: 'Datetime' };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should emit value change on input blur', () => {
    spyOn(sut.valueChange, 'emit');

    page.dateInput.value = '2022-01-01T00:00:00';
    page.dateInput.dispatchEvent(new Event('input'));
    page.dateInput.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    expect(sut.valueChange.emit).toHaveBeenCalledWith({ rawValue: '20220101T000000Z' });
  });

  it('should show date hint if there is a value', () => {
    expect(page.dateHint).toBeNull();

    page.dateInput.value = '2022-01-01T00:00:00';
    page.dateInput.dispatchEvent(new Event('input'));
    page.dateInput.dispatchEvent(new Event('blur'));

    fixture.detectChanges();

    expect(page.dateHint?.textContent).toEqual('January 1st 2022, 12:00 am');
  });
});
