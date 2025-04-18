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
import { RenameVersionComponent } from './rename-version.component';

describe(RenameVersionComponent.name, () => {
  let sut: RenameVersionComponent;
  let fixture: ComponentFixture<RenameVersionComponent>;
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

  const enableRenameInput = () => {
    {
      sut.valueEdited = true;
      const input = de.query(By.css('input')).nativeElement;
      input.value = 'renamed';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }
  };

  const crossBtn = () => de.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  const cancelBtn = () => de.query(By.css('ng-spd-dialog-actions button:nth-child(1)')).nativeElement;
  const renameBtn = () => de.query(By.css('ng-spd-dialog-actions button:nth-child(2)')).nativeElement;

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
          useValue: jasmine.createSpyObj<VersionsUtilService>('VersionsUtilService', ['renameVersion']),
        },
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
      ],
      declarations: [RenameVersionComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RenameVersionComponent);
    sut = fixture.componentInstance;
    de = fixture.debugElement;

    closeHandleSpy = TestBedInjectSpy(DialogCloseHandle);
    versionsUtilService = TestBedInjectSpy(VersionsUtilService);
    contextService = TestBedInjectSpy(ContextServiceTesting);

    contextService.updateContext(SAMPLE_CONTEXT);
    sut.currentVersion = sampleVersion;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('input-field', () => {
    it('should auto focus on input element on the component load', async () => {
      await fixture.whenStable();
      fixture.detectChanges();

      const input = de.query(By.css('input')).nativeElement;
      const focusElement = document.activeElement;
      expect(focusElement).toBe(input);
    });

    it('should contain version name as default text if it is defined ', async () => {
      sut.ngOnInit();
      fixture.detectChanges();

      const name = sut.currentVersion?.name;
      const inputEl = de.query(By.css('input')).nativeElement;
      await fixture.whenStable();

      expect(inputEl.value).toEqual(name);
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

  describe('rename', () => {
    it('should make call to renamVersion from versionWorkflowService', () => {
      enableRenameInput();
      renameBtn().click();

      expect(versionsUtilService.renameVersion).toHaveBeenCalled();
      expect(versionsUtilService.renameVersion).toHaveBeenCalledOnceWith(sampleVersion, 'renamed');
    });

    it('should close dialog after rename action', async () => {
      enableRenameInput();
      renameBtn().click();
      await fixture.whenStable();

      expect(closeHandleSpy.close).toHaveBeenCalled();
    });

    it('should enable save button when rename field was edited', () => {
      const input = de.query(By.css('input')).nativeElement;
      const saveButton = de.query(By.css('button:nth-child(2)')).nativeElement;

      expect(saveButton.disabled).toBe(true);

      input.value = '2021-11-16T13:16';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expect(saveButton.disabled).toBe(false);
    });
  });
});
