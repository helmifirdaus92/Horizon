/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseHandle, DialogModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { PageTemplatesService } from 'app/page-design/page-templates.service';
import { ItemOperationOutput } from 'app/page-design/page-templates.types';
import { DirectivesModule } from 'app/shared/directives/directives/directives.module';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';

import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { adminPermissions } from '../page-templates-test-data';
import { DuplicateItemDialogComponent } from './duplicate-item-dialog.component';

describe(DuplicateItemDialogComponent.name, () => {
  let sut: DuplicateItemDialogComponent;
  let fixture: ComponentFixture<DuplicateItemDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let pageTemplatesServiceSpy: jasmine.SpyObj<PageTemplatesService>;

  const closeBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  };

  const cancelBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions button:not(.primary)')).nativeElement;
  };

  const duplicateBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions [ngspdbutton="primary"]')).nativeElement;
  };

  const inputEl = (): HTMLInputElement => {
    return fixture.debugElement.query(By.css('#design-name')).nativeElement;
  };

  const validationErrors = () =>
    fixture.debugElement.query(By.css('.error-block'))?.nativeElement?.innerText?.trim() || null;

  const copyItemResult: ItemOperationOutput = {
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DuplicateItemDialogComponent],
      imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        TranslateServiceStubModule,
        DialogCloseHandleStubModule,
        DialogModule,
        DirectivesModule,
        InputLabelModule,
        ContextServiceTestingModule,
      ],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', [
            'copyItem',
            'configurePageDesign',
          ]),
        },
      ],
    }).compileComponents();

    pageTemplatesServiceSpy = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesServiceSpy.copyItem.and.returnValue(of(copyItemResult));
    pageTemplatesServiceSpy.configurePageDesign.and.returnValue(
      of({
        success: true,
        errorMessage: null,
      }),
    );

    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    fixture = TestBed.createComponent(DuplicateItemDialogComponent);
    sut = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('close dialog', () => {
    it(`should close dialog and complete onDuplicate emitter subscribtions`, () => {
      const onDuplicateSpy = createSpyObserver();
      sut.onDuplicate.subscribe(onDuplicateSpy);

      sut.close();

      expect(onDuplicateSpy.complete).toHaveBeenCalled();
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

  describe('Name validation', () => {
    describe('WHEN value is invalid', () => {
      it('should disable duplicate button and NOT show error WHEN input is not touched', () => {
        sut.itemName = '';
        fixture.detectChanges();

        expect(duplicateBtn().disabled).toBeTruthy();
        expect(validationErrors()).toBe(null);
      });

      describe('Invalid characters', () => {
        it('should show error and disable duplicate button', () => {
          inputEl().value = 'value!value';
          inputEl().dispatchEvent(new Event('input'));

          fixture.detectChanges();

          expect(duplicateBtn().disabled).toBeTruthy();
          expect(validationErrors()).toBe('VALIDATION.VALIDATE_NAME.NOT_ALLOWED_CHARACTER');
        });
      });

      describe('Name is already in use', () => {
        it('should show error and disable duplicate button', () => {
          sut.existingNames = ['test'];
          fixture.detectChanges();

          inputEl().value = 'test';
          inputEl().dispatchEvent(new Event('input'));

          fixture.detectChanges();

          expect(duplicateBtn().disabled).toBeTruthy();
          expect(validationErrors()).toBe('VALIDATION.VALIDATE_NAME.ALREADY_USED');
        });
      });
    });
  });

  describe('Duplicate design item', () => {
    it('WHEN succeed should emit the duplicated item and complete onDuplicate emitter subscribtions', fakeAsync(() => {
      const onDuplicateSpy = createSpyObserver();
      sut.onDuplicate.subscribe(onDuplicateSpy);

      inputEl().value = 'test';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      duplicateBtn().click();
      tick();

      expect(onDuplicateSpy.next).toHaveBeenCalledWith(copyItemResult.item);
      expect(onDuplicateSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
      flush();
    }));

    it('WHEN failed should disable the duplicate button and show the error message', fakeAsync(() => {
      pageTemplatesServiceSpy.copyItem.and.returnValue(of({ successful: false, errorMessage: 'error', item: null }));
      const onDuplicateSpy = createSpyObserver();
      sut.onDuplicate.subscribe(onDuplicateSpy);

      inputEl().value = 'test';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      duplicateBtn().click();
      tick();
      fixture.detectChanges();

      expect(duplicateBtn().disabled).toBeTruthy();
      expect(validationErrors()).toBe('error');
      flush();
    }));

    it('should auto focus on input element on the component load', async () => {
      await fixture.whenStable();
      fixture.detectChanges();

      const focusElement = document.activeElement;
      expect(focusElement).toBe(inputEl());
    });

    it('should assign selected page design to the new template', fakeAsync(() => {
      sut.pageDesignId = 'pageDesignId';

      inputEl().value = 'test';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      duplicateBtn().click();
      tick();
      fixture.detectChanges();

      // Act
      sut.duplicate();
      tick();

      // Assert
      expect(pageTemplatesServiceSpy.configurePageDesign).toHaveBeenCalledWith({
        siteName: '',
        mapping: [
          {
            templateId: 'itemId',
            pageDesignId: 'pageDesignId',
          },
        ],
      });
      flush();
    }));
  });

  describe('handleName', () => {
    it('should generate the correct name for the first copy', fakeAsync(() => {
      const itemName = 'Item';
      sut.itemName = itemName;

      sut.ngOnInit();
      tick();

      expect(sut.itemName).toBe('EDITOR.COPY_OF Item');
      flush();
    }));
  });
});
