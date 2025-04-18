/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import {
  CheckboxModule,
  DialogCloseHandle,
  DialogModule,
  InlineNotificationModule,
  LoadingIndicatorModule,
  TabsModule,
} from '@sitecore/ng-spd-lib';
import { TenantPageTemplate } from 'app/page-design/page-templates.types';
import { InsertOptionsConfigurationComponent } from 'app/page-design/shared/insert-options-configuration/insert-options-configuration.component';
import { InsertOptionsConfigurationService } from 'app/page-design/shared/insert-options-configuration/insert-options-configuration.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { InsertOptionsConfigurationsDialogComponent } from './insert-options-configurations-dialog.component';

describe(InsertOptionsConfigurationsDialogComponent.name, () => {
  let sut: InsertOptionsConfigurationsDialogComponent;
  let fixture: ComponentFixture<InsertOptionsConfigurationsDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let insertOptionsConfigurationServiceSpy: jasmine.SpyObj<InsertOptionsConfigurationService>;

  const templatesList: TenantPageTemplate[] = [
    {
      pageDesign: null,
      template: {
        templateId: 'template-id1',
        name: 'template-1',
        standardValuesItem: {
          itemId: 'sv-id1',
          insertOptions: [{ templateId: 'template-id1' }, { templateId: 'template-id2' }],
        },
      },
    },
    {
      pageDesign: null,
      template: { templateId: 'template-id2', name: 'template-2', standardValuesItem: { itemId: 'sv-id2' } },
    },
    {
      pageDesign: null,
      template: { templateId: 'template-id3', name: 'template-3', standardValuesItem: { itemId: 'sv-id3' } },
    },
    {
      pageDesign: null,
      template: {
        templateId: 'template-id4',
        name: 'template-4',
        standardValuesItem: {
          itemId: 'sv-id4',
          insertOptions: [{ templateId: 'template-id1' }, { templateId: 'template-id4' }],
        },
      },
    },
  ];

  const closeBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  };

  const cancelBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions button:not(.primary)')).nativeElement;
  };

  const saveBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions [ngspdbutton="primary"]')).nativeElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        DialogCloseHandleStubModule,
        DialogModule,
        LoadingIndicatorModule,
        InlineNotificationModule,
        CheckboxModule,
        TabsModule,
      ],
      declarations: [InsertOptionsConfigurationsDialogComponent, InsertOptionsConfigurationComponent],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', ['pushNotification']),
        },
      ],
    })
      .overrideComponent(InsertOptionsConfigurationsDialogComponent, {
        set: {
          providers: [
            {
              provide: InsertOptionsConfigurationService,
              useValue: jasmine.createSpyObj<InsertOptionsConfigurationService>('InsertOptionsConfigurationService', [
                'getTenantPageTemplatesWithStandardValues',
                'updateTemplateInsertOptions',
              ]),
            },
          ],
        },
      })
      .compileComponents();

    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);
    fixture = TestBed.createComponent(InsertOptionsConfigurationsDialogComponent);
    sut = fixture.componentInstance;
    sut.templatesList = templatesList;
    sut.templateId = 'template-id1';

    insertOptionsConfigurationServiceSpy = fixture.debugElement.injector.get<InsertOptionsConfigurationService>(
      InsertOptionsConfigurationService,
    ) as any;
    insertOptionsConfigurationServiceSpy.getTenantPageTemplatesWithStandardValues.and.resolveTo(templatesList);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('close dialog', () => {
    it(`should close dialog and complete onSave emitter subscribtions`, () => {
      const onSaveSpy = createSpyObserver();
      sut.onSave.subscribe(onSaveSpy);

      sut.close();

      expect(onSaveSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog on "X" button click', () => {
      closeBtn().click();
      fixture.detectChanges();

      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog when `Cancel` button is clicked', () => {
      cancelBtn().click();
      fixture.detectChanges();

      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog when press "Escape"', () => {
      const spy = spyOn(sut, 'close');
      const preventSpy = jasmine.createSpy();
      const event = { preventDefault: preventSpy, code: 'Escape' } as any;

      sut.onKeydownHandler(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Save insert options updates', () => {
    it('WHEN there is changes to insert options should call updateTemplateInsertOptions with updates', fakeAsync(() => {
      const onSaveSpy = createSpyObserver();
      sut.onSave.subscribe(onSaveSpy);

      insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions.and.resolveTo({
        success: true,
        errorMessage: undefined,
      });

      sut.updatedChildInsertOptions = ['template-id1', 'template-id3'];
      sut.updatedParentInsertOptions = ['template-id2'];

      fixture.detectChanges();

      saveBtn().click();
      tick();

      expect(insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions).toHaveBeenCalledWith(
        templatesList[0],
        templatesList,
        ['template-id1', 'template-id3'],
        ['template-id2'],
      );
      flush();
    }));

    it('WHEN there is no changes to insert options should not call updateTemplateInsertOptions', fakeAsync(() => {
      const onSaveSpy = createSpyObserver();
      sut.onSave.subscribe(onSaveSpy);

      insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions.and.resolveTo({
        success: true,
        errorMessage: undefined,
      });

      fixture.detectChanges();

      saveBtn().click();
      tick();

      expect(insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions).not.toHaveBeenCalled();
      flush();
    }));

    it('WHEN insert options update succeed should emit true and complete onSave emitter subscribtions', fakeAsync(() => {
      const onSaveSpy = createSpyObserver();
      sut.onSave.subscribe(onSaveSpy);

      insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions.and.resolveTo({
        success: true,
        errorMessage: undefined,
      });

      sut.updatedChildInsertOptions = ['template-id1', 'template-id3'];
      sut.updatedParentInsertOptions = ['template-id2'];

      fixture.detectChanges();

      saveBtn().click();
      tick();

      expect(onSaveSpy.next).toHaveBeenCalledWith({ success: true });
      expect(onSaveSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
      flush();
    }));

    it('WHEN failed should close the dialog and show the error message notification', fakeAsync(() => {
      const onSaveSpy = createSpyObserver();
      sut.onSave.subscribe(onSaveSpy);

      insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions.and.resolveTo({
        success: false,
        errorMessage: 'error message',
      });

      sut.updatedChildInsertOptions = ['template-id1', 'template-id3'];
      sut.updatedParentInsertOptions = ['template-id2'];

      fixture.detectChanges();

      saveBtn().click();
      tick();
      fixture.detectChanges();

      expect(onSaveSpy.next).toHaveBeenCalledWith({ success: false });
      expect(onSaveSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
      expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalled();
      flush();
    }));
  });
});
