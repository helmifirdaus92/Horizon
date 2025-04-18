/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DialogCloseHandle, DialogModule, TabsModule } from '@sitecore/ng-spd-lib';
import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { MediaDialogComponent } from './media-dialog.component';

@Component({
  selector: 'app-content-hub-dam-provider',
  template: '',
})
export class TestCHDPComponent {
  @Output() mediaSelect = new EventEmitter<any>();
  @Input() selectionSourceType = 'image';
}

@Component({
  selector: 'app-media-library',
  template: '',
})
export class TestMLComponent {
  @Output() mediaSelect = new EventEmitter<any>();
  @Input() currentValue: any;
  @Input() sources: any;
  @Input() mediaTypes: any;
}

@Component({
  selector: 'app-media-details',
  template: '',
})
export class TestMDComponent {
  @Input() media: any;
  @Input() sources: any;
}

const imgItem: MediaValue = {
  rawValue: '<image mediaid="123" />',
  embeddedHtml: '<image src="123" />',
  height: 1,
  width: 1,
  src: 'example.com',
  mediaId: '123',
};

describe(MediaDialogComponent.name, () => {
  let sut: MediaDialogComponent;
  let fixture: ComponentFixture<MediaDialogComponent>;
  let de: DebugElement;

  let dialogCloseSpy: jasmine.SpyObj<DialogCloseHandle>;
  let onSelectSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        DialogModule,
        DialogCloseHandleStubModule,
        ButtonModule,
        TabsModule,
      ],
      declarations: [MediaDialogComponent, TestCHDPComponent, TestMLComponent, TestMDComponent],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>({
            close: (() => null) as any,
          }),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaDialogComponent);
    sut = fixture.componentInstance;
    de = fixture.debugElement;

    dialogCloseSpy = TestBedInjectSpy(DialogCloseHandle);
    onSelectSpy = jasmine.createSpy('on select');
    sut.onSelect.subscribe(onSelectSpy);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should provide initial values', () => {
    sut.sources = ['one', 'two'];
    sut.selection = imgItem;

    fixture.detectChanges();

    const mediaLibCmp = de.query(By.directive(TestMLComponent)).componentInstance;
    expect(mediaLibCmp.sources).toEqual(['one', 'two']);
    expect(mediaLibCmp.currentValue).toBe(imgItem);

    const mediaDetailsCmp = de.query(By.directive(TestMDComponent)).componentInstance;
    expect(mediaDetailsCmp.sources).toEqual(['one', 'two']);
    expect(mediaDetailsCmp.media).toBe(imgItem);
  });

  describe('Select media', () => {
    it('should bind media selection from SC Media Library provider', () => {
      const mediaLibCmp = de.query(By.directive(TestMLComponent)).componentInstance;

      mediaLibCmp.mediaSelect.emit(imgItem);
      fixture.detectChanges();

      expect(sut.selection).toBe(imgItem);
    });

    it('should bind media selection from Content Hub provider', () => {
      de.query(By.css('ng-spd-tab-group button:nth-child(2)')).nativeElement.click();
      fixture.detectChanges();

      const chProviderCmp = de.query(By.directive(TestCHDPComponent)).componentInstance;
      chProviderCmp.mediaSelect.emit(imgItem);
      fixture.detectChanges();

      expect(sut.selection).toBe(imgItem);
    });
  });

  describe('WHEN an image is selected', () => {
    it('should call closeHandle.close()', () => {
      const submitBtn = de.query(By.css('ng-spd-dialog-actions button:last-child')).nativeElement;

      sut.selectionChanged(imgItem);
      fixture.detectChanges();

      submitBtn.click();
      fixture.detectChanges();

      expect(onSelectSpy).toHaveBeenCalledWith(imgItem);
      expect(dialogCloseSpy.close).toHaveBeenCalled();
    });
  });

  describe('Close dialog', () => {
    it('should close dialog when X button clicked', () => {
      const closeBtn = de.query(By.css('ng-spd-dialog-close-button button')).nativeElement;

      closeBtn.click();
      fixture.detectChanges();

      expect(dialogCloseSpy.close).toHaveBeenCalled();
    });

    it('should close dialog when Close button clicked', () => {
      const closeBtn = de.query(By.css('ng-spd-dialog-actions button:first-child')).nativeElement;

      closeBtn.click();
      fixture.detectChanges();

      expect(dialogCloseSpy.close).toHaveBeenCalled();
    });

    it('should call close() and prevent event default, when event code is `Escape`', () => {
      const preventSpy = jasmine.createSpy();
      const event = { preventDefault: preventSpy, code: 'Escape' } as any;

      sut.onKeydownHandler(event);

      expect(preventSpy).toHaveBeenCalled();
      expect(dialogCloseSpy.close).toHaveBeenCalled();
    });
  });
});
