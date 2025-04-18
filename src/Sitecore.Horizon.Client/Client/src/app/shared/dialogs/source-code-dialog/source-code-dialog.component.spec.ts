/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from '@sitecore/ng-spd-lib';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EditSourceCodeDialogComponent } from './source-code-dialog.component';

describe(EditSourceCodeDialogComponent.name, () => {
  let sut: EditSourceCodeDialogComponent;
  let fixture: ComponentFixture<EditSourceCodeDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [DialogModule, DialogCloseHandleStubModule, TranslateServiceStubModule, TranslateModule, FormsModule],
        declarations: [EditSourceCodeDialogComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSourceCodeDialogComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should emit result', async () => {
    const result = jasmine.createSpy();
    sut.dialogResultEvent.subscribe(result);

    sut.value = 'New value';
    sut.onConfirmClick();

    expect(result).toHaveBeenCalledOnceWith({ status: 'OK', value: 'New value' });
  });

  it('should emit Cancel', async () => {
    const result = jasmine.createSpy();
    sut.dialogResultEvent.subscribe(result);

    sut.value = 'New value';
    sut.onDeclineClick();

    expect(result).toHaveBeenCalledOnceWith({ status: 'Canceled' });
  });
});
