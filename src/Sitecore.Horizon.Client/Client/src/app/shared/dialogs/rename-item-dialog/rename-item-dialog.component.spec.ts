/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogModule } from '@sitecore/ng-spd-lib';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { RenameItemDialogComponent } from './rename-item-dialog.component';

describe(RenameItemDialogComponent.name, () => {
  let sut: RenameItemDialogComponent;
  let fixture: ComponentFixture<RenameItemDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [DialogModule, DialogCloseHandleStubModule, TranslateServiceStubModule, TranslateModule, FormsModule],
        declarations: [RenameItemDialogComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameItemDialogComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should emit result', async () => {
    const result = jasmine.createSpy();
    sut.dialogResultEvent.subscribe(result);

    sut.itemName = 'New item name';
    sut.displayName = 'New display name';
    sut.onConfirmClick();

    expect(result).toHaveBeenCalledOnceWith({
      status: 'OK',
      itemName: 'New item name',
      displayName: 'New display name',
    });
  });

  it('should emit Cancel', async () => {
    const result = jasmine.createSpy();
    sut.dialogResultEvent.subscribe(result);

    sut.itemName = 'New item name';
    sut.displayName = 'New display name';
    sut.onDeclineClick();

    expect(result).toHaveBeenCalledOnceWith({ status: 'Canceled' });
  });

  it('should keep the dialog title static when user changes itemName', async () => {
    sut.itemName = 'Name';
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('ng-spd-dialog-header')).nativeElement.innerText).toContain(
      '{"title":"Name"}',
    );

    const inputEl = fixture.debugElement.query(By.css('input#itemName')).nativeElement;
    inputEl.value = 'NewName';
    inputEl.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(sut.itemNameCurrentValue).toBe('NewName');
    expect(fixture.debugElement.query(By.css('ng-spd-dialog-header')).nativeElement.innerText).toContain(
      '{"title":"Name"}',
    );
  });
});
