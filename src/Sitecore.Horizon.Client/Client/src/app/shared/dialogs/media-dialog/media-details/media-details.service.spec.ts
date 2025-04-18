/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { ContextService } from 'app/shared/client-state/context.service';
import { MediaDalService } from 'app/shared/platform-media/media.dal.service';
import { MediaItem } from 'app/shared/platform-media/media.interface';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of } from 'rxjs';
import { MediaDetailsService } from './media-details.service';

describe('MediaDetailsService', () => {
  const ContextValue: Partial<ContextService> = {
    itemId: 'item',
    language: 'lang',
    siteName: 'beingernest.com',
  };
  let mediaServiceSpy: jasmine.SpyObj<MediaDalService>;
  let sut: MediaDetailsService;

  beforeEach(() => {
    const mediaServiceStub = jasmine.createSpyObj<MediaDalService>('MediaService', [
      'getMedia',
      'getMediaFolder',
      'getMediaItem',
      'getFolderAncestors',
    ]);

    TestBed.configureTestingModule({
      providers: [
        MediaDetailsService,
        { provide: ContextService, useValue: ContextValue },
        { provide: MediaDalService, useValue: mediaServiceStub },
      ],
    });

    mediaServiceSpy = TestBedInjectSpy(MediaDalService);
    sut = TestBed.inject(MediaDetailsService);
  });

  describe('getMediaItem', () => {
    it('should fetch media items from the media service for the given source', () => {
      // prepare
      const path = 'id123';
      const sources = ['fooSource'];
      const imgItem = { id: 'testItem' } as MediaItem;
      mediaServiceSpy.getMediaItem.and.returnValue(of(imgItem));

      // act
      const spy = jasmine.createSpy();
      sut.getMediaItem(path, sources).subscribe(spy);

      // assert
      expect(mediaServiceSpy.getMediaItem).toHaveBeenCalledTimes(1);
      const args = mediaServiceSpy.getMediaItem.calls.mostRecent().args[0];
      expect(args.path).toBe(path);
      expect(args.language).toBe(ContextValue.language!);
      expect(args.site).toBe(ContextValue.siteName!);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(imgItem);
    });
  });
});
