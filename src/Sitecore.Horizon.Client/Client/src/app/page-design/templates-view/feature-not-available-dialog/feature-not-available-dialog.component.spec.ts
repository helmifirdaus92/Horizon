/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseHandle, DialogModule } from '@sitecore/ng-spd-lib';
import { DirectivesModule } from 'app/shared/directives/directives/directives.module';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { FeatureNotAvailableDialogComponent } from './feature-not-available-dialog.component';

describe(FeatureNotAvailableDialogComponent.name, () => {
  let sut: FeatureNotAvailableDialogComponent;
  let fixture: ComponentFixture<FeatureNotAvailableDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let router: jasmine.SpyObj<Router>;

  const closeBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  };

  const dismissBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions button:not(.primary)')).nativeElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeatureNotAvailableDialogComponent],
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        DialogCloseHandleStubModule,
        DialogModule,
        DirectivesModule,
      ],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj<Router>({
            navigate: Promise.resolve(true),
          }),
        },
      ],
    }).compileComponents();
    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    fixture = TestBed.createComponent(FeatureNotAvailableDialogComponent);
    sut = fixture.componentInstance;
    router = TestBedInjectSpy(Router);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('close dialog', () => {
    it(`should close dialog and navigate to "editor"`, () => {
      sut.closeAndNavigateToEditor();

      expect(closeHandle.close).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['editor']);
    });

    it('should close the dialog and navigate to "editor" on "X" button click', () => {
      closeBtn().click();
      fixture.detectChanges();

      expect(closeHandle.close).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['editor']);
    });

    it('should close the dialog and navigate to "editor" when `Dismiss` button is clicked', () => {
      dismissBtn().click();
      fixture.detectChanges();

      expect(closeHandle.close).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['editor']);
    });

    it('should close the dialog when press "Escape"', () => {
      const spy = spyOn(sut, 'closeAndNavigateToEditor');
      const preventSpy = jasmine.createSpy();
      const event = { preventDefault: preventSpy, code: 'Escape' } as any;

      sut.onKeydownHandler(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });
});
