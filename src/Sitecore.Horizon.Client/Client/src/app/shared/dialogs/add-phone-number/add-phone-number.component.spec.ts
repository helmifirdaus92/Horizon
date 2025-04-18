/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DialogCloseHandle, DialogModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { AddPhoneNumberComponent } from './add-phone-number.component';

describe(AddPhoneNumberComponent.name, () => {
  let sut: AddPhoneNumberComponent;
  let fixture: ComponentFixture<AddPhoneNumberComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AddPhoneNumberComponent,
        CommonModule,
        DialogModule,
        ButtonModule,
        TranslateModule,
        TranslateServiceStubModule,
        InputLabelModule,
        FormsModule,
      ],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
      ],
    }).compileComponents();

    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    fixture = TestBed.createComponent(AddPhoneNumberComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should emit result', () => {
    const result = jasmine.createSpy();
    sut.dialogResultEvent.subscribe(result);

    sut.value = '+45 643123';
    sut.onConfirmClick();

    expect(result).toHaveBeenCalledOnceWith({ status: 'OK', value: '+45 643123' });
  });

  it('should emit Cancel', () => {
    const result = jasmine.createSpy();
    sut.dialogResultEvent.subscribe(result);

    sut.value = '+45 643123';
    sut.onDeclineClick();

    expect(result).toHaveBeenCalledOnceWith({ status: 'Canceled' });
  });

  it('should show error block if the phone number is invalid', () => {
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;
    inputElement.value = 'phone number';
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const errorBlock = fixture.debugElement.query(By.css('.error-block'));

    expect(errorBlock).toBeTruthy();
  });
});
