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
import { VersionPublishingSettingsComponent } from './version-publishing-settings.component';

describe(VersionPublishingSettingsComponent.name, () => {
  let sut: VersionPublishingSettingsComponent;
  let fixture: ComponentFixture<VersionPublishingSettingsComponent>;
  let closeHandleSpy: jasmine.SpyObj<DialogCloseHandle>;
  let versionsUtilService: jasmine.SpyObj<VersionsUtilService>;
  let contextService: ContextServiceTesting;
  let de: DebugElement;

  const sampleVersion: VersionDetails = {
    versionNumber: 1,
    name: 'test-version',
    lastModifiedBy: 'user1',
    lastModifiedAt: '',
    validFrom: '2020-01-09T12:05:14.815Z',
    validTo: '2020-09-09T12:07:05.816Z',
    workflowState: '',
    isLatestPublishableVersion: false,
    isAvailableToPublish: true,
  };

  const crossBtn = () => de.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  const cancelBtn = () => de.query(By.css('ng-spd-dialog-actions button:nth-child(1)')).nativeElement;
  const publishBtn = () => de.query(By.css('ng-spd-dialog-actions button:nth-child(2)')).nativeElement;
  const availableContainer = () => de.query(By.css('.available')).nativeElement;
  const notAvailableContainer = () => de.query(By.css('.not-available')).nativeElement;
  const availableHeaderEl = () => de.query(By.css('.header')).nativeElement;
  const availableDesEl = () => de.query(By.css('.description')).nativeElement;
  const notAvailableHeaderEl = () => de.query(By.css('.not-available .header')).nativeElement;
  const notAvailableDesEl = () => de.query(By.css('.not-available .description')).nativeElement;

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
          useValue: jasmine.createSpyObj<VersionsUtilService>('VersionsUtilService', ['setPublishSettings']),
        },
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
      ],
      declarations: [VersionPublishingSettingsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionPublishingSettingsComponent);
    sut = fixture.componentInstance;
    de = fixture.debugElement;

    closeHandleSpy = TestBedInjectSpy(DialogCloseHandle);
    versionsUtilService = TestBedInjectSpy(VersionsUtilService);
    contextService = TestBedInjectSpy(ContextServiceTesting);

    contextService.updateContext(SAMPLE_CONTEXT);
    sut.versionToPublish = sampleVersion;
    sut.valueEdited = true;
    sut.startDate = '2020-01-09T12:05:14.815Z';
    sut.endDate = '2020-09-09T12:07:05.816Z';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
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

  describe('When available', () => {
    it('should select the available container box when dialog is open', () => {
      sut.isAvailableToPublish = true;
      fixture.detectChanges();

      expect(availableContainer().classList).toContain('selected');
      expect(availableHeaderEl().innerText).toEqual('VERSIONS.PUBLISHING.AVAILABLE');
      expect(availableDesEl().innerText).toEqual('VERSIONS.PUBLISHING.AVAILABLE_DESCRIPTION');
    });

    it('should show start date selection option custom field input if version have start date configured', () => {
      sut.isAvailableToPublish = true;
      sut.startDate = '0001-01-01T00:00:00Z';
      fixture.detectChanges();

      const startDateOptionInput = de.query(By.css('input[name="startDate"]')).nativeElement;

      expect(startDateOptionInput).toBeDefined();
    });

    it('should hide start date selection option custom field input if version does not have start date', () => {
      sut.isAvailableToPublish = true;
      sut.startDate = '';

      sut.ngOnInit();
      fixture.detectChanges();

      const startDateOptionInput = de.query(By.css('input[name="startDate"]'));

      expect(startDateOptionInput).toBeFalsy();
    });

    it('should show end date selection option custom field input if version has end date', () => {
      sut.isAvailableToPublish = false;
      sut.endDate = '2020-09-09T12:07:05.816Z';

      sut.ngOnInit();
      fixture.detectChanges();

      const endDateOptionInput = de.query(By.css('input[name="endDate"]'));

      expect(endDateOptionInput).toBeDefined();
    });

    it('should hide end date selection option custom field input if version does not has end date', () => {
      sut.isAvailableToPublish = false;
      sut.endDate = '';

      sut.ngOnInit();
      fixture.detectChanges();

      const endDateOptionInput = de.query(By.css('input[name="endDate"]'));

      expect(endDateOptionInput).toBeFalsy();
    });
  });

  describe('When not-available', () => {
    it('should select the not-available container box when dialog is open', () => {
      sut.isAvailableToPublish = false;
      fixture.detectChanges();

      expect(notAvailableContainer().classList).toContain('selected');
      expect(notAvailableHeaderEl().innerText).toEqual('VERSIONS.PUBLISHING.NOT_AVAILABLE');
      expect(notAvailableDesEl().innerText).toEqual('VERSIONS.PUBLISHING.NOT_AVAILABLE_DESCRIPTION');
    });
  });

  describe('setPublishSettings', () => {
    it('should enable option to select publishing availability', () => {
      sut.ngOnInit();
      fixture.detectChanges();

      expect(availableContainer().attributes.getNamedItem('disabled')).toBeNull();
      expect(notAvailableContainer().attributes.getNamedItem('disabled')).toBeNull();
    });

    it('should make call to setPublishingSettings from versionWorkflowService', async () => {
      publishBtn().click();

      const validFrom = new Date('2020-01-09T12:05:14.815Z').toISOString();
      const validTo = new Date('2020-09-09T12:07:05.816Z').toISOString();

      expect(versionsUtilService.setPublishSettings).toHaveBeenCalled();
      expect(versionsUtilService.setPublishSettings).toHaveBeenCalledWith(sampleVersion, validFrom, validTo, true);
    });

    it('should close dialog after rename action', async () => {
      publishBtn().click();
      await fixture.whenStable();

      expect(closeHandleSpy.close).toHaveBeenCalled();
    });

    it('should disable publish button when input field was not edited', () => {
      sut.valueEdited = false;
      fixture.detectChanges();

      expect(publishBtn().disabled).toBe(true);
    });
  });
});
