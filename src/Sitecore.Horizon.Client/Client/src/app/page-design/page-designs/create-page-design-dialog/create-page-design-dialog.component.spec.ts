/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import {
  CheckboxModule,
  DialogCloseHandle,
  DialogModule,
  DroplistModule,
  InlineNotificationModule,
  InputLabelModule,
  LoadingIndicatorModule,
  PopoverModule,
  TabsModule,
} from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { Item, ItemOperationOutput, TenantPageTemplate } from 'app/page-design/page-templates.types';
import { InsertOptionsConfigurationComponent } from 'app/page-design/shared/insert-options-configuration/insert-options-configuration.component';
import { InsertOptionsConfigurationService } from 'app/page-design/shared/insert-options-configuration/insert-options-configuration.service';
import { adminPermissions } from 'app/page-design/shared/page-templates-test-data';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { DirectivesModule } from 'app/shared/directives/directives/directives.module';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { CreatePageDesignDialogComponent } from './create-page-design-dialog.component';

describe('CreatePageDesignDialogComponent', () => {
  let sut: CreatePageDesignDialogComponent;
  let fixture: ComponentFixture<CreatePageDesignDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let contextService: ContextServiceTesting;
  let pageTemplatesServiceSpy: jasmine.SpyObj<PageTemplatesService>;
  let insertOptionsConfigurationServiceSpy: jasmine.SpyObj<InsertOptionsConfigurationService>;

  const TemplatesList: TenantPageTemplate[] = [
    {
      pageDesign: null,
      template: {
        templateId: 'template-id1',
        name: 'template1',
        standardValuesItem: {
          itemId: 'sv-id1',
          insertOptions: [{ templateId: 'template-id1' }, { templateId: 'template-id2' }],
        },
      },
    },
    {
      pageDesign: null,
      template: { templateId: 'template-id2', name: 'template2', standardValuesItem: { itemId: 'sv-id2' } },
    },
    {
      pageDesign: null,
      template: { templateId: 'template-id3', name: 'template3', standardValuesItem: { itemId: 'sv-id3' } },
    },
    {
      pageDesign: null,
      template: {
        templateId: 'template-id4',
        name: 'template4',
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

  const actionBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions [ngspdbutton="primary"]')).nativeElement;
  };

  const designNameInputEl = (): HTMLInputElement => {
    return fixture.debugElement.query(By.css('#design-name')).nativeElement;
  };

  const templateNameInputEl = (): HTMLInputElement => {
    return fixture.debugElement.query(By.css('#template-name')).nativeElement;
  };

  const warningBlockEl = (): HTMLElement => {
    return fixture.debugElement.query(By.css('.warning-block')).nativeElement;
  };

  const validationErrors = () =>
    fixture.debugElement.query(By.css('.error-block'))?.nativeElement?.innerText?.trim() || null;

  const createItemResult: ItemOperationOutput = {
    successful: true,
    errorMessage: null,
    item: {
      path: '/path/to/item',
      displayName: 'item',
      itemId: 'itemId',
      name: 'item',
      version: 1,
      hasChildren: false,
      thumbnailUrl: 'thumbnail-url',
      hasPresentation: true,
      isFolder: false,
      insertOptions: [],
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      access: adminPermissions,
      children: undefined,
    },
  };

  const copyItemResult: ItemOperationOutput = {
    successful: true,
    errorMessage: null,
    item: {
      path: '/path/to/tempalte',
      displayName: 'tempalte',
      itemId: 'newTempalteId',
      name: 'tempalte',
      version: 1,
      hasChildren: false,
      thumbnailUrl: 'thumbnail-url',
      hasPresentation: true,
      isFolder: false,
      insertOptions: [],
      createdDate: '20230428T111641Z',
      updatedDate: '20230429T111641Z',
      access: adminPermissions,
      children: undefined,
    },
  };

  const toTemplateItem = (item: any, template: any) => {
    return {
      pageDesign: null,
      template: {
        templateId: item.itemId,
        name: item.name,
        access: item.access,
        standardValuesItem: item.standardValueItemId
          ? {
              itemId: item.standardValueItemId,
              insertOptions: template.standardValuesItem?.insertOptions,
            }
          : undefined,
      },
    };
  };

  const detectChanges = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        FormsModule,
        ContextServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        DialogCloseHandleStubModule,
        DialogModule,
        DirectivesModule,
        InputLabelModule,
        PopoverModule,
        LoadingIndicatorModule,
        DroplistModule,
        InlineNotificationModule,
        CheckboxModule,
        TabsModule,
      ],
      declarations: [CreatePageDesignDialogComponent, InsertOptionsConfigurationComponent],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', ['pushNotification']),
        },
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', [
            'createItem',
            'configurePageDesign',
            'copyItem',
          ]),
        },
      ],
    })
      .overrideComponent(CreatePageDesignDialogComponent, {
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

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideDefaultTestContext();

    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);
    pageTemplatesServiceSpy = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));

    fixture = TestBed.createComponent(CreatePageDesignDialogComponent);
    sut = fixture.componentInstance;

    insertOptionsConfigurationServiceSpy = fixture.debugElement.injector.get<InsertOptionsConfigurationService>(
      InsertOptionsConfigurationService,
    ) as any;
    insertOptionsConfigurationServiceSpy.getTenantPageTemplatesWithStandardValues.and.resolveTo([...TemplatesList]);
    sut.pageDesignParentId = 'pageDesignParentId';
    sut.pageDesignTemplateId = 'pageDesignTemplateId';
    sut.language = 'en';

    await detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('close dialog', () => {
    it(`should close dialog and complete onCreate emitter subscribtions`, () => {
      const onCreateSpy = createSpyObserver();
      sut.onCreate.subscribe(onCreateSpy);

      // act
      sut.close();

      // assert
      expect(onCreateSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog on "X" button click', () => {
      // act
      closeBtn().click();
      fixture.detectChanges();

      // assert
      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog when `Cancel` button is clicked', () => {
      // act
      cancelBtn().click();
      fixture.detectChanges();

      // assert
      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog when press "Escape"', () => {
      const spy = spyOn(sut, 'close');
      const preventSpy = jasmine.createSpy();
      const event = { preventDefault: preventSpy, code: 'Escape' } as any;

      // act
      sut.onKeydownHandler(event);

      // assert
      expect(preventSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Design name', () => {
    describe('WHEN value is invalid', () => {
      it('should disable create button and NOT show error WHEN input is not touched', () => {
        // act
        sut.designName = '';
        fixture.detectChanges();

        // assert
        expect(actionBtn().disabled).toBeTruthy();
        expect(validationErrors()).toBe(null);
      });

      describe('Invalid characters', () => {
        it('should show error and disable create button', async () => {
          // act
          designNameInputEl().value = 'value!value';
          designNameInputEl().dispatchEvent(new Event('input'));
          await detectChanges();

          // assert
          expect(actionBtn().disabled).toBeTruthy();
          expect(validationErrors()).toBe('VALIDATION.VALIDATE_NAME.NOT_ALLOWED_CHARACTER');
        });
      });

      describe('Name is already in use', () => {
        it('should show error and disable create button', async () => {
          sut.existingDesignNames = ['test'];
          fixture.detectChanges();

          // act
          designNameInputEl().value = 'test';
          designNameInputEl().dispatchEvent(new Event('input'));
          await detectChanges();

          // assert
          expect(actionBtn().disabled).toBeTruthy();
          expect(validationErrors()).toBe('VALIDATION.VALIDATE_NAME.ALREADY_USED');
        });
      });
    });
  });

  describe('Create design item and assign template later', () => {
    it('WHEN succeed should emit the created item and complete onCreate emitter subscribtions', fakeAsync(() => {
      pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));
      const onCreateSpy = createSpyObserver();
      sut.onCreate.subscribe(onCreateSpy);

      designNameInputEl().value = 'test';
      designNameInputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // act
      actionBtn().click();
      tick();

      // assert
      expect(pageTemplatesServiceSpy.createItem).toHaveBeenCalledWith(
        'test',
        sut.pageDesignParentId,
        sut.pageDesignTemplateId,
        sut.language,
      );
      expect(onCreateSpy.next).toHaveBeenCalledWith(createItemResult.item);
      expect(onCreateSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
      flush();
    }));

    it('WHEN failed should disable the create button and show the error message', fakeAsync(() => {
      pageTemplatesServiceSpy.createItem.and.returnValue(of({ successful: false, errorMessage: 'error', item: null }));
      const onCreateSpy = createSpyObserver();
      sut.onCreate.subscribe(onCreateSpy);

      designNameInputEl().value = 'test';
      designNameInputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      // act
      actionBtn().click();
      tick();
      fixture.detectChanges();

      // assert
      expect(actionBtn().disabled).toBeTruthy();
      expect(validationErrors()).toBe('error');
      flush();
    }));
  });

  describe('Assign template now', () => {
    describe('Assign existing template', () => {
      it('should disable next step button when page design name is empty or invalid', async () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'assign-existing';
        sut.selectedExistingTemplate = TemplatesList[0];

        // act
        sut.designName = '';
        await detectChanges();

        // assert
        expect(actionBtn().disabled).toBeTruthy();
        expect(validationErrors()).toBe(null);
      });

      it('should disable next step button when template is not selected', () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'assign-existing';
        sut.designName = 'test';

        // act
        sut.selectedExistingTemplate = undefined;
        fixture.detectChanges();

        // assert
        expect(actionBtn().disabled).toBeTruthy();
        expect(validationErrors()).toBe(null);
      });

      it('should enable next step button when page design name is valid and template is selected', async () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'assign-existing';
        sut.designName = 'test';
        sut.selectedExistingTemplate = TemplatesList[0];

        await detectChanges();

        // assert
        expect(actionBtn().disabled).toBeFalsy();
        expect(validationErrors()).toBe(null);
      });

      it('should show warning block when the selected template has assigned page design already', async () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'assign-existing';
        sut.designName = 'test';
        TemplatesList[0].pageDesign = { name: 'design1', itemId: 'design-id' } as Item;

        // act
        sut.selectedExistingTemplate = TemplatesList[0];

        await detectChanges();

        // assert
        expect(warningBlockEl()).toBeTruthy();
      });

      it('should move to insert options configuration step when `Next step` button is clicked', async () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'assign-existing';
        sut.designName = 'test';
        sut.selectedExistingTemplate = TemplatesList[0];

        await detectChanges();

        // act
        actionBtn().click();

        // assert
        expect(sut.step).toBe('configure-insert-options');
      });

      describe('WHEN save', () => {
        it('should create page design, assign it to template and updates insert options if there is any change', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));
          pageTemplatesServiceSpy.configurePageDesign.and.returnValue(of({ success: true, errorMessage: null }));
          insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions.and.resolveTo({
            success: true,
            errorMessage: undefined,
          });

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'assign-existing';
          sut.designName = 'test';
          sut.selectedExistingTemplate = TemplatesList[0];
          sut.updatedChildInsertOptions = ['template-id2', 'template-id4'];
          sut.updatedParentInsertOptions = ['template-id1', 'template-id2'];

          // act
          sut.saveChanges();
          tick();

          // assert
          expect(pageTemplatesServiceSpy.createItem).toHaveBeenCalledWith(
            'test',
            sut.pageDesignParentId,
            sut.pageDesignTemplateId,
            sut.language,
          );
          expect(pageTemplatesServiceSpy.configurePageDesign).toHaveBeenCalledWith({
            siteName: contextService.siteName,
            mapping: [
              {
                templateId: 'template-id1', // TemplatesList[0].template.templateId
                pageDesignId: 'itemId', // createItemResult.item?.itemId,
              },
            ],
          });
          expect(insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions).toHaveBeenCalledWith(
            TemplatesList[0],
            TemplatesList,
            ['template-id2', 'template-id4'],
            ['template-id1', 'template-id2'],
          );
          flush();
        }));

        it('should not call update insert options if there is no change to current setting', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));
          pageTemplatesServiceSpy.configurePageDesign.and.returnValue(of({ success: true, errorMessage: null }));

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'assign-existing';
          sut.designName = 'test';
          sut.selectedExistingTemplate = TemplatesList[0];
          sut.updatedChildInsertOptions = undefined;
          sut.updatedParentInsertOptions = undefined;

          // act
          sut.saveChanges();
          tick();

          // assert
          expect(insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions).not.toHaveBeenCalled();
          flush();
        }));

        it('WHEN create page design succeed should emit the created item and complete onCreate emitter subscribtions', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));
          pageTemplatesServiceSpy.configurePageDesign.and.returnValue(of({ success: true, errorMessage: null }));
          const onCreateSpy = createSpyObserver();
          sut.onCreate.subscribe(onCreateSpy);

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'assign-existing';
          sut.designName = 'test';
          sut.selectedExistingTemplate = TemplatesList[0];

          // act
          sut.saveChanges();
          tick();

          // assert
          expect(onCreateSpy.next).toHaveBeenCalledWith(createItemResult.item);
          expect(onCreateSpy.complete).toHaveBeenCalled();
          expect(closeHandle.close).toHaveBeenCalled();
          flush();
        }));

        it('WHEN create page design succeed but assign to template failed it should emit the created design item, complete onCreate emitter subscribtions and show assign error notification', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));
          pageTemplatesServiceSpy.configurePageDesign.and.returnValue(of({ success: false, errorMessage: 'error' }));
          const onCreateSpy = createSpyObserver();
          sut.onCreate.subscribe(onCreateSpy);

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'assign-existing';
          sut.designName = 'test';
          sut.selectedExistingTemplate = TemplatesList[0];

          // act
          sut.saveChanges();
          tick();

          // assert
          expect(onCreateSpy.next).toHaveBeenCalledWith(createItemResult.item);
          expect(onCreateSpy.complete).toHaveBeenCalled();
          expect(closeHandle.close).toHaveBeenCalled();
          expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
          flush();
        }));

        it('WHEN create page design succeed but update insert options failed it should emit the created design item, complete onCreate emitter subscribtions and show insert options error notification', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));
          pageTemplatesServiceSpy.configurePageDesign.and.returnValue(of({ success: true, errorMessage: null }));
          insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions.and.resolveTo({
            success: false,
            errorMessage: 'error',
          });
          const onCreateSpy = createSpyObserver();
          sut.onCreate.subscribe(onCreateSpy);

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'assign-existing';
          sut.designName = 'test';
          sut.selectedExistingTemplate = TemplatesList[0];
          sut.updatedChildInsertOptions = ['template-id1', 'template-id2'];

          // act
          sut.saveChanges();
          tick();

          // assert
          expect(onCreateSpy.next).toHaveBeenCalledWith(createItemResult.item);
          expect(onCreateSpy.complete).toHaveBeenCalled();
          expect(closeHandle.close).toHaveBeenCalled();
          expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
          flush();
        }));

        it('WHEN create page design failed should disable the save button and show the error message and do not proceed with rest of operation', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(
            of({ successful: false, errorMessage: 'error', item: null }),
          );
          const onCreateSpy = createSpyObserver();
          sut.onCreate.subscribe(onCreateSpy);

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'assign-existing';
          sut.designName = 'test';
          sut.selectedExistingTemplate = TemplatesList[0];
          sut.updatedChildInsertOptions = ['template-id2', 'template-id4'];
          sut.updatedParentInsertOptions = ['template-id1', 'template-id2'];

          // act
          sut.saveChanges();
          tick();

          // assert
          expect(actionBtn().disabled).toBeTruthy();
          expect(sut.apiErrorMessage).toBe('error');
          expect(pageTemplatesServiceSpy.configurePageDesign).not.toHaveBeenCalled();
          expect(insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions).not.toHaveBeenCalled();
        }));
      });
    });

    describe('Copy existing template and assign', () => {
      it('should disable next step button when page design name is empty or invalid', () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'copy-existing';
        sut.designName = '';
        sut.selectedExistingTemplate = TemplatesList[0];
        sut.templateName = 'copy of template';

        fixture.detectChanges();

        // assert
        expect(actionBtn().disabled).toBeTruthy();
        expect(validationErrors()).toBe(null);
      });

      it('should disable next step button when template is not selected', () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'copy-existing';
        sut.designName = 'design name';
        sut.selectedExistingTemplate = undefined;
        sut.templateName = 'template name';

        fixture.detectChanges();

        // assert
        expect(actionBtn().disabled).toBeTruthy();
        expect(validationErrors()).toBe(null);
      });

      it('should disable next step button when template name is empty', () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'copy-existing';
        sut.designName = 'design name';
        sut.selectedExistingTemplate = TemplatesList[0];
        sut.templateName = '';

        fixture.detectChanges();

        // assert
        expect(actionBtn().disabled).toBeTruthy();
        expect(validationErrors()).toBe(null);
      });

      it('should disable next step button and show error when template name is invalid', async () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'copy-existing';
        sut.designName = 'design name';
        sut.selectedExistingTemplate = TemplatesList[0];

        await detectChanges();

        // act
        templateNameInputEl().value = 'value!value';
        templateNameInputEl().dispatchEvent(new Event('input'));
        await detectChanges();

        // assert
        expect(actionBtn().disabled).toBeTruthy();
        expect(validationErrors()).toBe('VALIDATION.VALIDATE_NAME.NOT_ALLOWED_CHARACTER');
      });

      it('should disable next step button and show error when template name already exist', async () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'copy-existing';
        sut.designName = 'design name';
        sut.selectedExistingTemplate = TemplatesList[0];

        await detectChanges();

        // act
        templateNameInputEl().value = 'template1'; // TemplatesList[0].template.name;
        templateNameInputEl().dispatchEvent(new Event('input'));

        await detectChanges();

        // assert
        expect(actionBtn().disabled).toBeTruthy();
        expect(validationErrors()).toBe('VALIDATION.VALIDATE_NAME.ALREADY_USED');
      });

      it('should enable next step button when page design and template name are valid and template to be cloned is selected', async () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'copy-existing';

        // act
        sut.designName = 'design name';
        sut.selectedExistingTemplate = TemplatesList[0];
        sut.templateName = 'template name';

        await detectChanges();

        // assert
        expect(actionBtn().disabled).toBeFalsy();
        expect(validationErrors()).toBe(null);
      });

      it('when selecting a template it should set the template name to the copy of the original template name', async () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'copy-existing';
        sut.designName = 'design name';
        sut.templateName = '';

        // act
        sut.selectTemplate(TemplatesList[0].template.templateId);
        await detectChanges();

        // assert
        expect(sut.templateName).toBe('EDITOR.COPY_OF template1');
      });

      it('should move to insert options configuration step when `Next step` button is clicked', async () => {
        sut.assignTemplate = true;
        sut.chooseTemplateOptions = 'copy-existing';
        sut.designName = 'design name';
        sut.selectedExistingTemplate = TemplatesList[0];
        sut.templateName = 'template name';

        await detectChanges();

        // act
        actionBtn().click();

        // assert
        expect(sut.step).toBe('configure-insert-options');
      });

      describe('WHEN save', () => {
        it('should create page design, create template and assign desing to it and updates insert options if there is any', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));
          pageTemplatesServiceSpy.copyItem.and.returnValue(of(copyItemResult));
          pageTemplatesServiceSpy.configurePageDesign.and.returnValue(of({ success: true, errorMessage: null }));
          insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions.and.resolveTo({
            success: true,
            errorMessage: undefined,
          });

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'copy-existing';
          sut.designName = 'design';
          sut.templateName = 'newtemplate';
          sut.selectedExistingTemplate = TemplatesList[0];
          sut.updatedChildInsertOptions = ['template-id2', 'template-id4'];
          sut.updatedParentInsertOptions = ['template-id1', 'template-id2'];

          const newTemplate = toTemplateItem(copyItemResult.item, TemplatesList[0]);
          // act
          sut.saveChanges();
          tick();

          // assert
          expect(pageTemplatesServiceSpy.createItem).toHaveBeenCalledWith(
            'design',
            sut.pageDesignParentId,
            sut.pageDesignTemplateId,
            sut.language,
          );
          expect(pageTemplatesServiceSpy.copyItem).toHaveBeenCalledWith(
            'newtemplate',
            'template-id1', // TemplatesList[0].template.templateId
            undefined,
            true,
          );
          expect(pageTemplatesServiceSpy.configurePageDesign).toHaveBeenCalledWith({
            siteName: contextService.siteName,
            mapping: [
              {
                templateId: 'newTempalteId', // copyItemResult.item?.itemId,
                pageDesignId: 'itemId', // createItemResult.item?.itemId,
              },
            ],
          });
          expect(insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions).toHaveBeenCalledWith(
            newTemplate,
            [newTemplate, ...TemplatesList],
            ['template-id2', 'template-id4'],
            ['template-id1', 'template-id2'],
          );
          flush();
        }));

        it('WHEN create page design and new template succeed should emit the created item and complete onCreate emitter subscribtions', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));
          pageTemplatesServiceSpy.copyItem.and.returnValue(of(copyItemResult));
          pageTemplatesServiceSpy.configurePageDesign.and.returnValue(of({ success: true, errorMessage: null }));
          const onCreateSpy = createSpyObserver();
          sut.onCreate.subscribe(onCreateSpy);

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'copy-existing';
          sut.designName = 'design';
          sut.templateName = 'newtemplate';
          sut.selectedExistingTemplate = TemplatesList[0];

          // act
          sut.saveChanges();
          tick();

          // assert
          expect(onCreateSpy.next).toHaveBeenCalledWith(createItemResult.item);
          expect(onCreateSpy.complete).toHaveBeenCalled();
          expect(closeHandle.close).toHaveBeenCalled();
          flush();
        }));

        it('WHEN create page design failed should disable the save button and show the error message and do not proceed with rest of operation', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(
            of({ successful: false, errorMessage: 'error create design', item: null }),
          );
          const onCreateSpy = createSpyObserver();
          sut.onCreate.subscribe(onCreateSpy);

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'copy-existing';
          sut.designName = 'design';
          sut.templateName = 'newtemplate';
          sut.selectedExistingTemplate = TemplatesList[0];
          sut.updatedChildInsertOptions = ['template-id2', 'template-id4'];
          sut.updatedParentInsertOptions = ['template-id1', 'template-id2'];

          // act
          sut.saveChanges();
          tick();

          // assert
          expect(actionBtn().disabled).toBeTruthy();
          expect(sut.apiErrorMessage).toBe('error create design');
          expect(pageTemplatesServiceSpy.copyItem).not.toHaveBeenCalled();
          expect(pageTemplatesServiceSpy.configurePageDesign).not.toHaveBeenCalled();
          expect(insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions).not.toHaveBeenCalled();
          flush();
        }));

        it('WHEN create page design succeed but create template failed should disable the save button and show the error message and do not proceed with rest of operation', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));
          pageTemplatesServiceSpy.copyItem.and.returnValue(
            of({ successful: false, errorMessage: 'error create template', item: null }),
          );
          const onCreateSpy = createSpyObserver();
          sut.onCreate.subscribe(onCreateSpy);

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'copy-existing';
          sut.designName = 'design';
          sut.templateName = 'newtemplate';
          sut.selectedExistingTemplate = TemplatesList[0];
          sut.updatedChildInsertOptions = ['template-id2', 'template-id4'];
          sut.updatedParentInsertOptions = ['template-id1', 'template-id2'];

          // act
          sut.saveChanges();
          tick();

          // assert
          expect(actionBtn().disabled).toBeTruthy();
          expect(sut.apiErrorMessage).toBe('error create template');
          expect(pageTemplatesServiceSpy.configurePageDesign).not.toHaveBeenCalled();
          expect(insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions).not.toHaveBeenCalled();
          flush();
        }));

        it('WHEN create page design and template succeed but assign edsign to template failed, it should emit the created design item, complete onCreate emitter subscribtions and show assign error notification', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));
          pageTemplatesServiceSpy.copyItem.and.returnValue(of(copyItemResult));
          pageTemplatesServiceSpy.configurePageDesign.and.returnValue(of({ success: false, errorMessage: 'error' }));
          const onCreateSpy = createSpyObserver();
          sut.onCreate.subscribe(onCreateSpy);

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'copy-existing';
          sut.designName = 'design';
          sut.templateName = 'newtemplate';
          sut.selectedExistingTemplate = TemplatesList[0];

          // act
          sut.saveChanges();
          tick();

          // assert
          expect(onCreateSpy.next).toHaveBeenCalledWith(createItemResult.item);
          expect(onCreateSpy.complete).toHaveBeenCalled();
          expect(closeHandle.close).toHaveBeenCalled();
          expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
          flush();
        }));

        it('WHEN create page design and tempalte succeed but updating insert options failed, it should emit the created design item, complete onCreate emitter subscribtions and show insert options error notification', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));
          pageTemplatesServiceSpy.copyItem.and.returnValue(of(copyItemResult));
          pageTemplatesServiceSpy.configurePageDesign.and.returnValue(of({ success: true, errorMessage: null }));
          insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions.and.resolveTo({
            success: false,
            errorMessage: 'error',
          });
          const onCreateSpy = createSpyObserver();
          sut.onCreate.subscribe(onCreateSpy);

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'copy-existing';
          sut.designName = 'design';
          sut.templateName = 'newtemplate';
          sut.selectedExistingTemplate = TemplatesList[0];
          sut.updatedChildInsertOptions = ['template-id2', 'template-id4'];
          sut.updatedParentInsertOptions = ['template-id1', 'template-id2'];

          // act
          sut.saveChanges();
          tick();

          // assert
          expect(onCreateSpy.next).toHaveBeenCalledWith(createItemResult.item);
          expect(onCreateSpy.complete).toHaveBeenCalled();
          expect(closeHandle.close).toHaveBeenCalled();
          expect(timedNotificationsServiceSpy.pushNotification).toHaveBeenCalledTimes(1);
          flush();
        }));

        it('should not call update insert options if there is no change to current setting', fakeAsync(() => {
          pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));
          pageTemplatesServiceSpy.copyItem.and.returnValue(of(copyItemResult));
          pageTemplatesServiceSpy.configurePageDesign.and.returnValue(of({ success: true, errorMessage: null }));

          sut.assignTemplate = true;
          sut.chooseTemplateOptions = 'copy-existing';
          sut.designName = 'design';
          sut.templateName = 'newtemplate';
          sut.selectedExistingTemplate = TemplatesList[0];
          sut.updatedChildInsertOptions = undefined;
          sut.updatedParentInsertOptions = undefined;

          // act
          sut.saveChanges();
          tick();

          // assert
          expect(insertOptionsConfigurationServiceSpy.updateTemplateInsertOptions).not.toHaveBeenCalled();
          flush();
        }));
      });
    });
  });
});
