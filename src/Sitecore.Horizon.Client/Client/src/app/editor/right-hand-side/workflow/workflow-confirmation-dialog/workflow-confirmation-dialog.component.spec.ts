/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseHandle, DialogModule } from '@sitecore/ng-spd-lib';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { WorkflowConfirmationDialogComponent } from './workflow-confirmation-dialog.component';

describe('WorkflowConfirmationDialogComponent', () => {
  let component: WorkflowConfirmationDialogComponent;
  let fixture: ComponentFixture<WorkflowConfirmationDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkflowConfirmationDialogComponent],
      imports: [FormsModule, DialogModule, TranslateModule, TranslateServiceStubModule],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
      ],
    }).compileComponents();

    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    fixture = TestBed.createComponent(WorkflowConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit canceld event and close dialog when close button is called', () => {
    const spy = jasmine.createSpy();
    component.onClose.subscribe(spy);
    const closeButton = fixture.debugElement.query(By.css('ng-spd-dialog-close-button button'));
    closeButton.triggerEventHandler('click', null);

    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ state: 'canceled' }));
    expect(closeHandle.close).toHaveBeenCalled();
  });

  it('should emit canceld event and close dialog when cancel button is called', () => {
    const spy = jasmine.createSpy();
    component.onClose.subscribe(spy);
    const closeButton = fixture.debugElement.query(By.css('ng-spd-dialog-actions button:not(.primary)'));
    closeButton.triggerEventHandler('click', null);

    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ state: 'canceled' }));
    expect(closeHandle.close).toHaveBeenCalled();
  });

  it('should emit canceld event and close dialog when ESC key is pressed', () => {
    const spy = jasmine.createSpy();
    component.onClose.subscribe(spy);
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
      }),
    );

    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ state: 'canceled' }));
    expect(closeHandle.close).toHaveBeenCalled();
  });

  it('should emit submitted event with comment and close dialog when Submit button is called', () => {
    const spy = jasmine.createSpy();
    component.onClose.subscribe(spy);

    const commentEl = fixture.debugElement.query(By.css('textarea')).nativeElement;
    commentEl.value = 'test comment';
    commentEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(By.css('ng-spd-dialog-actions [ngspdbutton="primary"]'));
    submitButton.triggerEventHandler('click', null);

    fixture.detectChanges();

    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({ state: 'submitted', comment: 'test comment' }));
    expect(closeHandle.close).toHaveBeenCalled();
  });
});
