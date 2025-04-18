/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed, inject } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { MediaDalService } from 'app/shared/platform-media/media.dal.service';
import { MediaItem } from 'app/shared/platform-media/media.interface';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { ImageFieldHandlerService } from './image-field-handler.service';

describe('Service: ImageFieldHandler', () => {
  let mediaServiceSpy: jasmine.SpyObj<MediaDalService>;
  let sut: ImageFieldHandlerService;
  let itemService: jasmine.SpyObj<BaseItemDalService>;
  let context: ContextServiceTesting;

  const mediaItem: MediaItem = {
    id: 'testImageId',
    parentId: '123',
    displayName: 'blah',
    height: 1,
    width: 1,
    url: 'example.com',
    embedUrl: 'example.com',
    path: '/a/b',
    alt: 'alt',
  };

  beforeEach(() => {
    const mediaServiceStub = jasmine.createSpyObj<MediaDalService>('MediaService', ['getMediaItem', 'uploadMedia']);

    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, ContextServiceTestingModule],
      providers: [
        ImageFieldHandlerService,
        { provide: MediaDalService, useValue: mediaServiceStub },
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>({
            getItem: of({} as Item),
          }),
        },
      ],
    });
    mediaServiceSpy = TestBedInjectSpy(MediaDalService);
    itemService = TestBedInjectSpy(BaseItemDalService);

    context = TestBed.inject(ContextServiceTesting);
    context.provideDefaultTestContext();

    sut = TestBed.inject(ImageFieldHandlerService);
  });

  it('should ...', inject([ImageFieldHandlerService], (service: ImageFieldHandlerService) => {
    expect(service).toBeTruthy();
  }));

  it('should call getMediaItem from MediaDalService', () => {
    mediaServiceSpy.getMediaItem.and.returnValue(of(mediaItem as MediaItem));

    sut.getMediaItem('123', [], false).subscribe((result) => {
      expect(result).toEqual(mediaItem);
    });

    expect(mediaServiceSpy.getMediaItem).toHaveBeenCalledWith(
      {
        path: '123',
        sources: [],
        language: 'pt-BR',
        site: 'sitecore1',
      },
      false,
    );
  });

  it('should resolve imageFieldValue to imagePresentationValue', () => {
    const imageFieldValue = {
      rawValue: 'rawValue',
      mediaId: '123',
      src: 'example.com',
      alt: 'alt',
    };

    mediaServiceSpy.getMediaItem.and.returnValue(of(mediaItem as MediaItem));

    sut.resolveImageData(imageFieldValue).subscribe((result) => {
      expect(result).toEqual({
        path: '/a/b',
        thumbnail: {
          src: 'example.com',
          alt: 'alt',
        },
        file: {
          displayName: 'blah',
          extension: undefined,
          size: undefined,
        },
      });
    });
  });
});
