/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DialogCloseHandle, DialogModule } from '@sitecore/ng-spd-lib';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { WarningDialogComponent } from './warning-dialog.component';

describe('WarningDialogComponent', () => {
  let component: WarningDialogComponent;
  let fixture: ComponentFixture<WarningDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;

  const closeBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  };

  const cancelBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions button:not(.primary)')).nativeElement;
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [DialogModule, DialogCloseHandleStubModule],
        declarations: [WarningDialogComponent],
        providers: [
          {
            provide: DialogCloseHandle,
            useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
          },
        ],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    fixture = TestBed.createComponent(WarningDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Dialog', () => {
    it('should close the dialog on Escape button press', () => {
      const preventSpy = jasmine.createSpy();
      const event = { preventDefault: preventSpy, code: 'Escape' } as any;

      component.onKeydownHandler(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog on "X" button click', () => {
      closeBtn().click();

      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog when `Cancel` button is clicked', () => {
      cancelBtn().click();

      expect(closeHandle.close).toHaveBeenCalled();
    });
  });
});
