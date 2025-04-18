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
import { RenameItemDialogComponent } from './rename-item-dialog.component';

describe(RenameItemDialogComponent.name, () => {
  let sut: RenameItemDialogComponent;
  let fixture: ComponentFixture<RenameItemDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let pageTemplatesServiceSpy: jasmine.SpyObj<PageTemplatesService>;

  const closeBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  };

  const cancelBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions button:not(.primary)')).nativeElement;
  };

  const renameBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-actions [ngspdbutton="primary"]')).nativeElement;
  };

  const inputEl = (): HTMLInputElement => {
    return fixture.debugElement.query(By.css('#design-item-name')).nativeElement;
  };

  const validationErrors = () =>
    fixture.debugElement.query(By.css('.error-block'))?.nativeElement?.innerText?.trim() || null;

  const renameItemResult: ItemOperationOutput = {
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
      declarations: [RenameItemDialogComponent],
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
          useValue: jasmine.createSpyObj<PageTemplatesService>('PageTemplatesService', ['renameItem']),
        },
      ],
    }).compileComponents();

    pageTemplatesServiceSpy = TestBedInjectSpy(PageTemplatesService);
    pageTemplatesServiceSpy.renameItem.and.returnValue(of(renameItemResult));

    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    fixture = TestBed.createComponent(RenameItemDialogComponent);
    sut = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('close dialog', () => {
    it(`should close dialog and complete onRename emitter subscribtions`, () => {
      const onRenameSpy = createSpyObserver();
      sut.onRename.subscribe(onRenameSpy);

      sut.close();

      expect(onRenameSpy.complete).toHaveBeenCalled();
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

  describe('Item name validation', () => {
    describe('WHEN value is invalid', () => {
      it('should disable create button and NOT show error WHEN input is not touched', () => {
        sut.itemName = '';
        fixture.detectChanges();

        expect(renameBtn().disabled).toBeTruthy();
        expect(validationErrors()).toBe(null);
      });

      it('should disable create button and NOT show error WHEN name not edited', () => {
        sut.itemName = 'item 1';
        sut.valueEdited = false;
        fixture.detectChanges();

        expect(renameBtn().disabled).toBeTruthy();
        expect(validationErrors()).toBe(null);
      });

      describe('Invalid characters', () => {
        it('should show error and disable rename button', () => {
          inputEl().value = 'value!value';
          inputEl().dispatchEvent(new Event('input'));

          fixture.detectChanges();

          expect(renameBtn().disabled).toBeTruthy();
          expect(validationErrors()).toBe('VALIDATION.VALIDATE_NAME.NOT_ALLOWED_CHARACTER');
        });
      });

      describe('Name is already in use', () => {
        it('should show error and disable rename button', () => {
          sut.existingNames = ['test'];
          fixture.detectChanges();

          inputEl().value = 'test';
          inputEl().dispatchEvent(new Event('input'));

          fixture.detectChanges();

          expect(renameBtn().disabled).toBeTruthy();
          expect(validationErrors()).toBe('VALIDATION.VALIDATE_NAME.ALREADY_USED');
        });
      });
    });
  });

  describe('Rename item', () => {
    it('WHEN succeed should emit the renamed item and complete onRename emitter subscribtions', fakeAsync(() => {
      const onRenameSpy = createSpyObserver();
      sut.onRename.subscribe(onRenameSpy);

      inputEl().value = 'test';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      renameBtn().click();
      tick();

      expect(onRenameSpy.next).toHaveBeenCalledWith(renameItemResult.item);
      expect(onRenameSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
      flush();
    }));

    it('WHEN failed should disable the rename button and show the error message', fakeAsync(() => {
      pageTemplatesServiceSpy.renameItem.and.returnValue(of({ successful: false, errorMessage: 'error', item: null }));
      const onRenameSpy = createSpyObserver();
      sut.onRename.subscribe(onRenameSpy);

      inputEl().value = 'test';
      inputEl().dispatchEvent(new Event('input'));
      fixture.detectChanges();

      renameBtn().click();
      tick();
      fixture.detectChanges();

      expect(renameBtn().disabled).toBeTruthy();
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
