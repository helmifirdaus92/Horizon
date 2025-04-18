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

import { adminPermissions } from '../page-templates-test-data';
import { CreateItemDialogComponent } from './create-item-dialog.component';

describe(CreateItemDialogComponent.name, () => {
  let sut: CreateItemDialogComponent;
  let fixture: ComponentFixture<CreateItemDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let pageTemplatesServiceSpy: jasmine.SpyObj<PageTemplatesService>;

  const closeBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  };

  const cancelBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions button:not(.primary)')).nativeElement;
  };

  const createBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions [ngspdbutton="primary"]')).nativeElement;
  };

  const inputEl = (): HTMLInputElement => {
    return fixture.debugElement.query(By.css('#design-name')).nativeElement;
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateItemDialogComponent],
      imports: [
        CommonModule,
        FormsModule,
        TranslateModule,
        TranslateServiceStubModule,
        DialogCloseHandleStubModule,
        DialogModule,
        DirectivesModule,
        InputLabelModule,
      ],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: PageTemplatesService,
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', ['createItem']),
        },
      ],
    }).compileComponents();

    pageTemplatesServiceSpy = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesServiceSpy.createItem.and.returnValue(of(createItemResult));

    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    fixture = TestBed.createComponent(CreateItemDialogComponent);
    sut = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('close dialog', () => {
    it(`should close dialog and complete onCreate emitter subscribtions`, () => {
      const onCreateSpy = createSpyObserver();
      sut.onCreate.subscribe(onCreateSpy);

      sut.close();

      expect(onCreateSpy.complete).toHaveBeenCalled();
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
      it('should disable create button and NOT show error WHEN input is not touched', () => {
        sut.designItemName = '';
        fixture.detectChanges();

        expect(createBtn().disabled).toBeTruthy();
        expect(validationErrors()).toBe(null);
      });

      describe('Invalid characters', () => {
        it('should show error and disable create button', () => {
          inputEl().value = 'value!value';
          inputEl().dispatchEvent(new Event('input'));

          fixture.detectChanges();

          expect(createBtn().disabled).toBeTruthy();
          expect(validationErrors()).toBe('VALIDATION.VALIDATE_NAME.NOT_ALLOWED_CHARACTER');
        });
      });

      describe('Name is already in use', () => {
        it('should show error and disable create button', () => {
          sut.existingNames = ['test'];
          fixture.detectChanges();

          inputEl().value = 'test';
          inputEl().dispatchEvent(new Event('input'));

          fixture.detectChanges();

          expect(createBtn().disabled).toBeTruthy();
          expect(validationErrors()).toBe('VALIDATION.VALIDATE_NAME.ALREADY_USED');
        });
      });
    });
  });

  describe('Create design item', () => {
    it('WHEN succeed should emit the created item and complete onCreate emitter subscribtions', fakeAsync(() => {
      const onCreateSpy = createSpyObserver();
      sut.onCreate.subscribe(onCreateSpy);

      inputEl().value = 'test';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      createBtn().click();
      tick();

      expect(onCreateSpy.next).toHaveBeenCalledWith(createItemResult.item);
      expect(onCreateSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
      flush();
    }));

    it('WHEN failed should disable the create button and show the error message', fakeAsync(() => {
      pageTemplatesServiceSpy.createItem.and.returnValue(of({ successful: false, errorMessage: 'error', item: null }));
      const onCreateSpy = createSpyObserver();
      sut.onCreate.subscribe(onCreateSpy);

      inputEl().value = 'test';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      createBtn().click();
      tick();
      fixture.detectChanges();

      expect(createBtn().disabled).toBeTruthy();
      expect(validationErrors()).toBe('error');
      flush();
    }));

    it('should auto focus on input element on the component load', async () => {
      await fixture.whenStable();
      fixture.detectChanges();

      const focusElement = document.activeElement;
      expect(focusElement).toBe(inputEl());
    });
  });
});
