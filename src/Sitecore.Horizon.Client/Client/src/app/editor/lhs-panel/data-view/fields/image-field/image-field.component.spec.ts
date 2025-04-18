/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { LhsPanelModule } from 'app/editor/lhs-panel/lhs-panel.module';
import { ImageFieldHandlerService } from 'app/editor/right-hand-side/image-field/image-field-handler.service';
import { MediaDialogService } from 'app/shared/dialogs/media-dialog/media-dialog.service';
import { MediaLibraryService } from 'app/shared/dialogs/media-dialog/platform-media-provider/media-library.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { MediaDalService } from 'app/shared/platform-media/media.dal.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { ImageFieldComponent } from './image-field.component';

describe(ImageFieldComponent.name, () => {
  let sut: ImageFieldComponent;
  let fixture: ComponentFixture<ImageFieldComponent>;
  let imageFieldHandlerService: jasmine.SpyObj<ImageFieldHandlerService>;
  let mediaDialogServiceSpy: jasmine.SpyObj<MediaDialogService>;
  let mediaLibraryServiceSpy: jasmine.SpyObj<MediaLibraryService>;

  const imagePresentationValue = {
    path: 'path',
    thumbnail: {
      src: 'src',
      alt: 'test image',
    },
  };

  const currentMediaRawValue =
    '\u003Cimage mediaid=\u002204dad0fd-db66-4070-881f-17264ca257e1\u0022 alt=\u0022test\u0022 /\u003E';

  beforeEach(waitForAsync(() => {
    mediaLibraryServiceSpy = jasmine.createSpyObj<MediaLibraryService>('MediaLibraryService', [
      'getMediaItem',
      'uploadMediaItem',
    ]);
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, LhsPanelModule],
      declarations: [ImageFieldComponent],
      providers: [
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>('BaseItemDalService', ['getFieldDataSources']),
        },
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
    })
      .overrideComponent(ImageFieldComponent, {
        set: {
          // Because MediaLibraryService is provided in a component level, it cannot be replaced in a test module level.
          // https://angular.io/guide/testing#override-component-providers
          providers: [{ provide: MediaLibraryService, useValue: mediaLibraryServiceSpy }],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageFieldComponent);
    sut = fixture.componentInstance;

    imageFieldHandlerService = TestBedInjectSpy(ImageFieldHandlerService);
    mediaDialogServiceSpy = TestBedInjectSpy(MediaDialogService);

    imageFieldHandlerService.resolveImageData.and.returnValue(of(imagePresentationValue));
    mediaLibraryServiceSpy.getMediaItem.and.returnValue(
      of({
        path: 'resolved/path.jpg',
        alt: 'Resolved Alt Text',
        parentId: 'parentId001',
        embedUrl: 'http://example.com/embed',
        id: 'mediaId001',
        displayName: 'Resolved Image',
        url: 'http://example.com/resolved/path.jpg',
      }),
    );
    sut.rawValue = currentMediaRawValue;
    sut.field = {
      item: {
        id: 'id001',
        version: 1,
        revision: 'rev001',
        language: 'en',
        access: {
          canRead: true,
          canWrite: true,
        },
      },
      value: { rawValue: 'value1' },
      containsStandardValue: false,
      access: {
        canRead: true,
        canWrite: true,
      },
      templateField: {
        templateFieldId: 'templateFieldId1',
        name: 'Content',
        type: 'Multiroot Treelist',
        sectionName: 'Content',
        dataSource: [
          {
            displayName: 'testDs',
            itemId: 'testDsId',
            hasChildren: false,
            hasPresentation: false,
          },
        ],
        dataSourcePageInfo: { hasNextPage: false, startCursor: '', endCursor: '' },
        versioning: 'SHARED',
      },
      validation: [
        {
          message: 'Invalid value',
          valid: false,
          validator: 'ValidatorName',
        },
      ],
    };

    sut.thumbnailData = { src: 'src', alt: 'test image' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should parse current field value to imageFieldValue', async () => {
    sut.rawValue = currentMediaRawValue;
    await fixture.whenStable();

    expect(sut.imageFieldValue).toEqual({
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

  it('should resolve image data from field current value', async () => {
    sut.rawValue = currentMediaRawValue;

    await fixture.whenStable();

    const parseImageFieldValue = {
      rawValue: currentMediaRawValue,
      alt: 'test',
      width: undefined,
      height: undefined,
      mediaId: '04dad0fd-db66-4070-881f-17264ca257e1',
      src: undefined,
    };

    expect(imageFieldHandlerService.resolveImageData).toHaveBeenCalledWith(parseImageFieldValue);
  });

  it('should show image thumbnail if resolved image data has source', async () => {
    imageFieldHandlerService.resolveImageData.and.returnValue(of(imagePresentationValue));
    await fixture.whenStable();

    const thumbnailContainer = fixture.debugElement.query(By.css('ng-spd-thumbnail')).nativeElement;

    expect(thumbnailContainer).toBeTruthy();
  });

  it('should show image alt text if imageFieldValue rawValue has alt attributes', async () => {
    imageFieldHandlerService.resolveImageData.and.returnValue(of(imagePresentationValue));
    await fixture.whenStable();

    const altText = fixture.debugElement.query(By.css('.alt-input .input')).nativeElement;
    expect(altText.value).toEqual('test image');
  });

  describe('selectFromMediaDialog', () => {
    it('should open media dialog  with resolve source and current value', async () => {
      sut.thumbnailData = undefined;
      fixture.detectChanges();

      const openDialogBtn = fixture.debugElement.query(By.css('.upload-text')).nativeElement;
      openDialogBtn.click();

      expect(mediaDialogServiceSpy.show).toHaveBeenCalledWith({
        sources: ['testDsId'],
        currentValue: {
          rawValue: currentMediaRawValue,
          mediaId: '04dad0fd-db66-4070-881f-17264ca257e1',
          alt: 'test',
          width: undefined,
          height: undefined,
          src: undefined,
        },
      });
    });
  });
});
