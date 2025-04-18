/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { LhsPanelModule } from 'app/editor/lhs-panel/lhs-panel.module';
import { ImageFieldHandlerService } from 'app/editor/right-hand-side/image-field/image-field-handler.service';
import { MediaDialogService } from 'app/shared/dialogs/media-dialog/media-dialog.service';
import { MediaDalService } from 'app/shared/platform-media/media.dal.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { FileFieldComponent } from './file-field.component';

describe(FileFieldComponent.name, () => {
  let sut: FileFieldComponent;
  let fixture: ComponentFixture<FileFieldComponent>;
  let imageFieldHandlerService: jasmine.SpyObj<ImageFieldHandlerService>;
  let mediaDialogServiceSpy: jasmine.SpyObj<MediaDialogService>;

  const filePresentationValue = {
    path: 'path',
    file: {
      displayName: 'testFile',
      alt: 'pdf',
      size: 324,
    },
  };

  const currentMediaRawValue =
    '\u003Cimage mediaid=\u002204dad0fd-db66-4070-881f-17264ca257e1\u0022 alt=\u0022test\u0022 /\u003E';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, LhsPanelModule],
      declarations: [FileFieldComponent],
      providers: [
        {
          provide: MediaDalService,
          useValue: jasmine.createSpyObj<MediaDalService>('MediaService', ['getMediaItem']),
        },
        {
          provide: ImageFieldHandlerService,
          useValue: jasmine.createSpyObj<ImageFieldHandlerService>('ImageFieldHandlerService', [
            'resolveImageData',
            'handleChangeImageError',
          ]),
        },
        {
          provide: MediaDialogService,
          useValue: jasmine.createSpyObj<MediaDialogService>('MediaDialogService', ['show']),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileFieldComponent);
    sut = fixture.componentInstance;

    imageFieldHandlerService = TestBedInjectSpy(ImageFieldHandlerService);
    mediaDialogServiceSpy = TestBedInjectSpy(MediaDialogService);

    imageFieldHandlerService.resolveImageData.and.returnValue(of(filePresentationValue));
    sut.rawValue = currentMediaRawValue;
    sut.dataSources = [
      {
        displayName: 'testDs',
        itemId: 'testDsId',
        hasChildren: false,
        hasPresentation: false,
      },
    ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should parse current field value to imageFieldValue', async () => {
    sut.rawValue = currentMediaRawValue;
    await fixture.whenStable();

    expect(sut.fileFieldValue).toEqual({
      rawValue: '<image mediaid="04dad0fd-db66-4070-881f-17264ca257e1" alt="test" />',
      mediaId: '04dad0fd-db66-4070-881f-17264ca257e1',
      alt: 'test',
      width: undefined,
      height: undefined,
      src: undefined,
    });
  });

  it('should initialize media source from field datasource', async () => {
    expect(sut.sources).toEqual(['testDsId']);
  });

  it('should resolve file data from field current value', async () => {
    sut.rawValue = currentMediaRawValue;
    const parseFileFieldValue = {
      rawValue: currentMediaRawValue,
      alt: 'test',
      width: undefined,
      height: undefined,
      mediaId: '04dad0fd-db66-4070-881f-17264ca257e1',
      src: undefined,
    };

    expect(imageFieldHandlerService.resolveImageData).toHaveBeenCalledWith(parseFileFieldValue);
  });

  describe('selectFromMediaDialog', () => {
    it('should open media dialog with resolve source and current value', async () => {
      sut.rawValue = '';
      fixture.detectChanges();

      const openDialogBtn = fixture.debugElement.query(By.css('.upload-text')).nativeElement;
      openDialogBtn.click();

      expect(mediaDialogServiceSpy.show).toHaveBeenCalledWith({
        sources: ['testDsId'],
        currentValue: {
          rawValue: '',
        },
        mediaTypes: ['image', 'file'],
      });
    });

    it('should emit selectedItemChange with new value', fakeAsync(async () => {
      mediaDialogServiceSpy.show.and.returnValue(of({ rawValue: 'newMediaId' }));
      sut.rawValue = '';

      spyOn(sut.selectedItemChange, 'emit');
      fixture.detectChanges();

      const openDialogBtn = fixture.debugElement.query(By.css('.upload-text')).nativeElement;
      openDialogBtn.click();
      await fixture.whenStable();

      expect(sut.selectedItemChange.emit).toHaveBeenCalledWith({ rawValue: 'newMediaId' });
    }));
  });
});
