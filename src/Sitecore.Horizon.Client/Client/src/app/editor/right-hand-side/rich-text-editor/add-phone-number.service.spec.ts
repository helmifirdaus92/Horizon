/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed, waitForAsync } from '@angular/core/testing';
import { DialogModule, DialogOverlayService } from '@sitecore/ng-spd-lib';
import { AddPhoneNumberComponent } from 'app/shared/dialogs/add-phone-number/add-phone-number.component';
import { EditSourceCodeDialogModule } from 'app/shared/dialogs/source-code-dialog/source-code-dialog.module';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { AddPhoneNumberService } from './add-phone-number.service';
import { EditSourceCodeService } from './edit-source-code.service';

describe(AddPhoneNumberService.name, () => {
  let sut: AddPhoneNumberService;
  let dialogOverlayServiceSpy: jasmine.SpyObj<DialogOverlayService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DialogModule, DialogCloseHandleStubModule, TranslateServiceStubModule, EditSourceCodeDialogModule],
      providers: [
        EditSourceCodeService,
        {
          provide: DialogOverlayService,
          useValue: jasmine.createSpyObj<DialogOverlayService>('DialogOverlayService', ['open']),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    dialogOverlayServiceSpy = TestBedInjectSpy(DialogOverlayService);
    dialogOverlayServiceSpy.open.and.returnValue({
      component: TestBed.createComponent(AddPhoneNumberComponent).componentInstance,
    } as any);
    sut = TestBed.inject(AddPhoneNumberService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('show()', () => {
    it('should call open() of given service', () => {
      sut.promptAddPhoneNumber();

      expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
    });
  });
});
