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
import { VersionDetails } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { SAMPLE_CONTEXT } from '../create-version/create-version.component.spec';
import { VersionsUtilService } from '../versions-util.service';
import { DuplicateVersionComponent } from './duplicate-version.component';

describe(DuplicateVersionComponent.name, () => {
  let sut: DuplicateVersionComponent;
  let fixture: ComponentFixture<DuplicateVersionComponent>;
  let closeHandleSpy: jasmine.SpyObj<DialogCloseHandle>;
  let versionsUtilService: jasmine.SpyObj<VersionsUtilService>;
  let contextService: ContextServiceTesting;
  let de: DebugElement;

  const sampleVersion: VersionDetails = {
    versionNumber: 1,
    name: 'test-version',
    lastModifiedBy: 'user1',
    lastModifiedAt: '',
    validFrom: '',
    validTo: '',
    workflowState: '',
    isLatestPublishableVersion: false,
    isAvailableToPublish: true,
  };

  const crossBtn = () => de.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  const cancelBtn = () => de.query(By.css('ng-spd-dialog-actions button:nth-child(1)')).nativeElement;
  const duplicateBtn = () => de.query(By.css('ng-spd-dialog-actions button:nth-child(2)')).nativeElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        FormsModule,
        ContextServiceTestingModule,
        DialogModule,
        DialogCloseHandleStubModule,
        InputLabelModule,
      ],
      providers: [
        {
          provide: VersionsUtilService,
          useValue: jasmine.createSpyObj<VersionsUtilService>('VersionsUtilService', ['duplicateVersion']),
        },
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
      ],
      declarations: [DuplicateVersionComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateVersionComponent);
    sut = fixture.componentInstance;
    de = fixture.debugElement;

    closeHandleSpy = TestBedInjectSpy(DialogCloseHandle);
    versionsUtilService = TestBedInjectSpy(VersionsUtilService);
    contextService = TestBedInjectSpy(ContextServiceTesting);

    contextService.updateContext(SAMPLE_CONTEXT);
    sut.duplicateName = 'Copy of Version-1';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('input field', () => {
    it('should auto focus on the component load', async () => {
      await fixture.whenStable();
      fixture.detectChanges();

      const input = de.query(By.css('input')).nativeElement;
      const focusElement = document.activeElement;
      expect(focusElement).toBe(input);
    });

    it('should contain version name and `Copy of` as prefix if name is defined ', async () => {
      sut.versionToDuplicate = sampleVersion;
      const name = sut.versionToDuplicate?.name;

      sut.ngOnInit();
      fixture.detectChanges();

      const inputEl = de.query(By.css('input')).nativeElement;
      await fixture.whenStable();

      expect(inputEl.value).toEqual('Copy of' + ' ' + name);
    });

    it('should contain static text `Version` & version number if name is not defined', async () => {
      const versionWithNoName: VersionDetails = {
        versionNumber: 2,
        name: '',
        lastModifiedBy: 'user1',
        lastModifiedAt: '',
        validFrom: '',
        validTo: '',
        workflowState: '',
        isLatestPublishableVersion: false,
        isAvailableToPublish: true,
      };
      sut.versionToDuplicate = versionWithNoName;
      const versionNumber = sut.versionToDuplicate.versionNumber;

      sut.ngOnInit();
      fixture.detectChanges();

      const inputEl = de.query(By.css('input')).nativeElement;
      const value = `Version ${versionNumber}`;
      await fixture.whenStable();

      expect(inputEl.value).toEqual(`Copy of ${value}`);
    });
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

  describe('duplicate', () => {
    it('should make call to duplicateVersion from versionsUtilService', () => {
      sut.versionToDuplicate = sampleVersion;
      sut.duplicateName = 'duplicate-name';
      fixture.detectChanges();

      duplicateBtn().click();

      expect(versionsUtilService.duplicateVersion).toHaveBeenCalled();
      expect(versionsUtilService.duplicateVersion).toHaveBeenCalledWith('duplicate-name', 1);
    });

    it('should close dialog after duplicate action', async () => {
      sut.versionToDuplicate = sampleVersion;

      duplicateBtn().click();
      await fixture.whenStable();

      expect(closeHandleSpy.close).toHaveBeenCalled();
    });

    it('should disable duplicate button if input is empty ', () => {
      sut.duplicateName = '';
      fixture.detectChanges();

      expect(duplicateBtn().disabled).toBe(true);
    });
  });
});
