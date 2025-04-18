/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { makeTestMessagingP2PChannelFromDef, TestMessagingP2PChannel } from '@sitecore/horizon-messaging/dist/testing';
import { DialogCloseHandle, DialogModule } from '@sitecore/ng-spd-lib';
import { DesigningChannelDef } from 'app/shared/messaging/horizon-canvas.contract.defs';
import {
  DesigningCanvasEvents,
  DesigningCanvasRpcServices,
  DesigningHorizonEvents,
  DesigningHorizonRpcServices,
} from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';

import { ComponentGalleryDialogComponent } from './component-gallery-dialog.component';

describe('ComponentGalleryDialogComponent', () => {
  let sut: ComponentGalleryDialogComponent;
  let fixture: ComponentFixture<ComponentGalleryDialogComponent>;
  let closeHandle: jasmine.SpyObj<DialogCloseHandle>;
  let messagingServiceSpy: jasmine.SpyObj<MessagingService>;

  let designingChanel: TestMessagingP2PChannel<
    DesigningCanvasEvents,
    DesigningHorizonEvents,
    DesigningCanvasRpcServices,
    DesigningHorizonRpcServices
  >;
  const closeBtn = (): HTMLButtonElement => {
    return fixture.debugElement.query(By.css('ng-spd-dialog-close-button button')).nativeElement;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComponentGalleryDialogComponent],
      imports: [CommonModule, TranslateModule, TranslateServiceStubModule, DialogCloseHandleStubModule, DialogModule],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: MessagingService,
          useValue: jasmine.createSpyObj<MessagingService>('MessagingService', ['getDesigningChannel']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });
  beforeEach(() => {
    designingChanel = makeTestMessagingP2PChannelFromDef(DesigningChannelDef, {});

    messagingServiceSpy = TestBedInjectSpy(MessagingService);
    messagingServiceSpy.getDesigningChannel.and.returnValue(designingChanel);

    closeHandle = TestBedInjectSpy(DialogCloseHandle);
    fixture = TestBed.createComponent(ComponentGalleryDialogComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('close dialog', () => {
    it('should close the dialog on "X" button click', () => {
      closeBtn().click();
      fixture.detectChanges();

      expect(closeHandle.close).toHaveBeenCalled();
    });

    it('should close the dialog when press "Escape"', () => {
      // arrange
      const spy = spyOn(sut, 'close');
      const preventSpy = jasmine.createSpy();
      const event = { preventDefault: preventSpy, code: 'Escape' } as any;

      // act
      sut.onKeydownHandler(event);

      // assert
      expect(preventSpy).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should close the component if the user clicks outside of it', () => {
      // Arrange
      const mockClickEvent = new MouseEvent('click', { bubbles: true });
      const mockElementRef = { nativeElement: { contains: () => false } };
      spyOn(mockClickEvent, 'preventDefault');
      spyOn(sut, 'close');
      spyOn(mockElementRef.nativeElement, 'contains').and.returnValue(false);

      // Act
      sut.onDocumentClick(mockClickEvent);

      // Assert
      expect(mockClickEvent.preventDefault).toHaveBeenCalled();
      expect(sut.close).toHaveBeenCalled();
    });
  });

  describe('On select rendering', () => {
    it('should emit selection and close the dialog', () => {
      const onSelectSpy = createSpyObserver();
      sut.onSelect.subscribe(onSelectSpy);

      sut.selectRendering('id');
      fixture.detectChanges();

      expect(onSelectSpy.next).toHaveBeenCalledWith('id');
      expect(onSelectSpy.complete).toHaveBeenCalled();
      expect(closeHandle.close).toHaveBeenCalled();
    });
  });
});
