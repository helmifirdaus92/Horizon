/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseHandle, DialogModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { Context } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { VersionsUtilService } from '../versions-util.service';
import { CreateVersionComponent } from './create-version.component';

export const SAMPLE_CONTEXT: Context = {
  itemId: 'item-id',
  language: 'pt-BR',
  siteName: 'sitecore1',
  itemVersion: 1,
};

describe(CreateVersionComponent.name, () => {
  let sut: CreateVersionComponent;
  let fixture: ComponentFixture<CreateVersionComponent>;
  let versionsUtilService: jasmine.SpyObj<VersionsUtilService>;
  let closeHandleSpy: jasmine.SpyObj<DialogCloseHandle>;
  let contextService: ContextServiceTesting;
  let de: DebugElement;

  const crossBtn = () => de.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  const cancelBtn = () => de.query(By.css('ng-spd-dialog-actions button:nth-child(1)')).nativeElement;
  const createBtn = () => de.query(By.css('ng-spd-dialog-actions button:nth-child(2)')).nativeElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ContextServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        FormsModule,
        DialogModule,
        DialogCloseHandleStubModule,
        InputLabelModule,
      ],
      providers: [
        {
          provide: VersionsUtilService,
          useValue: jasmine.createSpyObj<VersionsUtilService>('VersionsUtilService', ['createVersion']),
        },
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
      ],
      declarations: [CreateVersionComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateVersionComponent);
    sut = fixture.componentInstance;
    de = fixture.debugElement;

    versionsUtilService = TestBedInjectSpy(VersionsUtilService);
    closeHandleSpy = TestBedInjectSpy(DialogCloseHandle);
    contextService = TestBedInjectSpy(ContextServiceTesting);

    contextService.updateContext(SAMPLE_CONTEXT);
    sut.name = 'test-version';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should auto focus on input element on the component load', async () => {
    await fixture.whenStable();
    fixture.detectChanges();

    const input = de.query(By.css('input')).nativeElement;
    const focusElement = document.activeElement;
    expect(focusElement).toBe(input);
  });

  describe('Dialog', () => {
    it('should close the dialog on Escape button press', () => {
      const spy = spyOn(sut, 'close');
      const preventSpy = jasmine.createSpy();
      const event = { preventDefault: preventSpy, code: 'Escape' } as any;

      sut.onKeydownHandler(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should close the dialog on "X" button click', () => {
      crossBtn().click();

      expect(closeHandleSpy.close).toHaveBeenCalled();
    });

    it('should close the dialog when `Cancel` button is clicked', () => {
      cancelBtn().click();

      expect(closeHandleSpy.close).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should make call to createVersion from versionsUtilService', () => {
      createBtn().click();

      expect(versionsUtilService.createVersion).toHaveBeenCalled();
      expect(versionsUtilService.createVersion).toHaveBeenCalledWith(sut.name, undefined, undefined);
    });

    it('should close dialog after create action', async () => {
      createBtn().click();
      await fixture.whenStable();

      expect(closeHandleSpy.close).toHaveBeenCalled();
    });
  });
});
