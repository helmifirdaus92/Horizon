/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed, waitForAsync } from '@angular/core/testing';
import { DialogModule, DialogOverlayService } from '@sitecore/ng-spd-lib';
import { EditSourceCodeDialogComponent } from 'app/shared/dialogs/source-code-dialog/source-code-dialog.component';
import { EditSourceCodeDialogModule } from 'app/shared/dialogs/source-code-dialog/source-code-dialog.module';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EditSourceCodeService } from './edit-source-code.service';

describe(EditSourceCodeService.name, () => {
  let sut: EditSourceCodeService;
  let dialogOverlayServiceSpy: jasmine.SpyObj<DialogOverlayService>;

  const currentValue = '<p>Some code</p>';

  beforeEach(
    waitForAsync(() => {
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
    }),
  );

  beforeEach(() => {
    dialogOverlayServiceSpy = TestBedInjectSpy(DialogOverlayService);
    dialogOverlayServiceSpy.open.and.returnValue({
      component: TestBed.createComponent(EditSourceCodeDialogComponent).componentInstance,
    } as any);
    sut = TestBed.inject(EditSourceCodeService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('show()', () => {
    it('should call open() of given service', () => {
      sut.promptEditSourceCode(currentValue);

      const value = (
        dialogOverlayServiceSpy.open.calls.mostRecent().returnValue.component as EditSourceCodeDialogComponent
      ).value;

      expect(dialogOverlayServiceSpy.open).toHaveBeenCalled();
      expect(value).toBe(currentValue);
    });
  });
});
