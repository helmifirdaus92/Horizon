/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { ContextService } from 'app/shared/client-state/context.service';
import { MediaDalService } from 'app/shared/platform-media/media.dal.service';
import {
  MediaFolder,
  MediaItem,
  MediaItemInfo,
  MediaQueryResult,
  MediaUploadResult,
} from 'app/shared/platform-media/media.interface';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { firstValueFrom, NEVER, Observable, of } from 'rxjs';
import { MediaActionNotificationService } from './action-bar/media-action-notification.service';
import { MediaLibraryService } from './media-library.service';

describe('MediaLibraryService', () => {
  const contextValue: Partial<ContextService> = {
    itemId: 'item',
    language: 'lang',
    siteName: 'beingernest.com',
  };
  let mediaServiceSpy: jasmine.SpyObj<MediaDalService>;
  let mediaNotificationServiceSpy: jasmine.SpyObj<MediaActionNotificationService>;
  let sut: MediaLibraryService;

  const file = new File(['test'], 'testImage.jpg', { type: 'image/jpeg' });

  const uploadMediaResult: MediaUploadResult = {
    mediaItem: {
      id: 'test',
      displayName: 'test',
      url: 'test',
      embedUrl: 'test',
      height: 0,
      width: 0,
      parentId: 'test',
      path: 'test',
    },
    success: true,
  };

  beforeEach(() => {
    const mediaServiceStub = jasmine.createSpyObj<MediaDalService>('MediaService', [
      'getMedia',
      'getMediaFolder',
      'getMediaItem',
      'getFolderAncestors',
      'uploadMedia',
    ]);

    TestBed.configureTestingModule({
      providers: [
        MediaLibraryService,
        { provide: ContextService, useValue: contextValue },
        { provide: MediaDalService, useValue: mediaServiceStub },
        {
          provide: MediaActionNotificationService,
          useValue: jasmine.createSpyObj<MediaActionNotificationService>('MediaActionNotificationService', [
            'handleFolderOrMediaError',
            'handleMediaUploadNotification',
          ]),
        },
      ],
    });

    mediaServiceSpy = TestBedInjectSpy(MediaDalService);
    mediaNotificationServiceSpy = TestBedInjectSpy(MediaActionNotificationService);
    sut = TestBed.inject(MediaLibraryService);
  });

  describe('getFolderChildren', () => {
    describe('AND folder doesnt have children', () => {
      it('should return []', () => {
        const folder = {
          id: 'foo',
          displayName: '',
          hasChildren: false,
          permissions: {
            canCreate: true,
            canDelete: true,
            canRename: true,
          },
        };
        expect(sut.getFolderChildren(folder)).toEqual([]);
      });
    });

    describe('AND folders children is already loaded', () => {
      it('should return the children', () => {
        const children = [
          {
            id: '1',
            displayName: '',
            hasChildren: false,
            permissions: {
              canCreate: true,
              canDelete: true,
              canRename: true,
            },
          },
        ];
        const folder = {
          id: 'foo',
          displayName: '',
          hasChildren: true,
          children,
          permissions: {
            canCreate: true,
            canDelete: true,
            canRename: true,
          },
        };
        expect(sut.getFolderChildren(folder)).toBe(children);
      });
      it('should return the children when permissions not defined', () => {
        const children = [
          {
            id: '1',
            displayName: '',
            hasChildren: false,
          },
        ];
        const folder = {
          id: 'foo',
          displayName: '',
          hasChildren: true,
          children,
        };
        expect(sut.getFolderChildren(folder)).toBe(children);
      });
    });

    describe('AND folder hasChildren but is not loaded', () => {
      it('should fetch and return the folders children when permissions defined', async () => {
        // prepare
        const id = '64';
        const children = [
          {
            id: '1',
            displayName: '',
            hasChildren: false,
            permissions: {
              canCreate: true,
              canDelete: true,
              canRename: true,
            },
          },
        ];
        const folder = {
          id,
          displayName: '',
          hasChildren: true,
          permissions: {
            canCreate: true,
            canDelete: true,
            canRename: true,
          },
        };
        mediaServiceSpy.getMediaFolder.and.returnValue(of({ ...folder, children }));

        // act
        const result = await firstValueFrom(sut.getFolderChildren(folder) as Observable<MediaFolder[]>);

        // assert
        expect(result).toBe(children);
        expect(mediaServiceSpy.getMediaFolder).toHaveBeenCalledTimes(1);
        expect(mediaServiceSpy.getMediaFolder).toHaveBeenCalledWith(contextValue.language!, contextValue.siteName!, id);
      });
      it('should fetch and return the folders children when permissions not defined', async () => {
        // prepare
        const id = '64';
        const children = [
          {
            id: '1',
            displayName: '',
            hasChildren: false,
          },
        ];
        const folder = {
          id,
          displayName: '',
          hasChildren: true,
        };
        mediaServiceSpy.getMediaFolder.and.returnValue(of({ ...folder, children }));

        // act
        const result = await firstValueFrom(sut.getFolderChildren(folder) as Observable<MediaFolder[]>);

        // assert
        expect(result).toBe(children);
        expect(mediaServiceSpy.getMediaFolder).toHaveBeenCalledTimes(1);
        expect(mediaServiceSpy.getMediaFolder).toHaveBeenCalledWith(contextValue.language!, contextValue.siteName!, id);
      });

      describe('AND folder turns out not to have any children', () => {
        it('should fetch and return []', async () => {
          // prepare
          const id = '64';
          const folder = {
            id,
            displayName: '',
            hasChildren: true,
            permissions: {
              canCreate: true,
              canDelete: true,
              canRename: true,
            },
          };
          mediaServiceSpy.getMediaFolder.and.returnValue(of({ ...folder, hasChildren: false }));

          // act
          const result = await firstValueFrom(sut.getFolderChildren(folder) as Observable<MediaFolder[]>);

          // assert
          expect(result).toEqual([]);
          expect(mediaServiceSpy.getMediaFolder).toHaveBeenCalledWith(
            contextValue.language!,
            contextValue.siteName!,
            id,
          );
        });
      });
    });
  });

  describe('getMediaFolder', () => {
    it('should fetch the media folder from the media service', () => {
      // prepare
      const path = 'a';
      const testFolder: MediaFolder = {
        id: 'a',
        displayName: 'foo',
        hasChildren: false,
        permissions: {
          canCreate: true,
          canDelete: true,
          canRename: true,
        },
      };
      mediaServiceSpy.getMediaFolder.and.returnValue(of(testFolder));

      // act
      const spy = jasmine.createSpy();
      sut.getMediaFolder(path).subscribe(spy);

      // assert
      expect(mediaServiceSpy.getMediaFolder).toHaveBeenCalledTimes(1);
      expect(mediaServiceSpy.getMediaFolder).toHaveBeenCalledWith(contextValue.language!, contextValue.siteName!, path);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.calls.argsFor(0)[0]).toEqual(testFolder);
    });

    describe('AND the resulting folder id is different than the requested one', () => {
      it('should emit the result but overriding the id to be requested one', () => {
        // prepare
        const path = 'a';
        const testFolder: MediaFolder = {
          id: 'other id',
          displayName: 'foo',
          hasChildren: false,
          permissions: {
            canCreate: true,
            canDelete: true,
            canRename: true,
          },
        };
        mediaServiceSpy.getMediaFolder.and.returnValue(of(testFolder));

        // act
        const spy = jasmine.createSpy();
        sut.getMediaFolder(path).subscribe(spy);

        // assert
        const expectedResult = { ...testFolder, id: path };
        expect(spy.calls.argsFor(0)[0]).toEqual(expectedResult);
      });
    });
  });

  describe('getFlatTree', () => {
    it('should fetch the flat tree from the media service for the given path and source', () => {
      // prepare
      const path = '123';
      const sources = ['foo'];
      const flatTree = [
        {
          id: '1',
          displayName: 'Marc',
          hasChildren: false,
          parentId: '',
          permissions: {
            canCreate: true,
            canDelete: true,
            canRename: true,
          },
        },
      ];
      mediaServiceSpy.getFolderAncestors.and.returnValue(of(flatTree));

      // act
      const spy = jasmine.createSpy();
      sut.getFlatTree(path, sources).subscribe(spy);

      // assert
      expect(mediaServiceSpy.getFolderAncestors).toHaveBeenCalledTimes(1);
      expect(mediaServiceSpy.getFolderAncestors).toHaveBeenCalledWith(
        path,
        contextValue.language!,
        contextValue.siteName!,
        sources,
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(flatTree);
    });
    it('should fetch the flat tree from the media service without permissions for the given path and source', () => {
      // prepare
      const path = '123';
      const sources = ['foo'];
      const flatTree = [
        {
          id: '1',
          displayName: 'Marc',
          hasChildren: false,
          parentId: '',
        },
      ];
      mediaServiceSpy.getFolderAncestors.and.returnValue(of(flatTree));

      // act
      const spy = jasmine.createSpy();
      sut.getFlatTree(path, sources).subscribe(spy);

      // assert
      expect(mediaServiceSpy.getFolderAncestors).toHaveBeenCalledTimes(1);
      expect(mediaServiceSpy.getFolderAncestors).toHaveBeenCalledWith(
        path,
        contextValue.language!,
        contextValue.siteName!,
        sources,
      );
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(flatTree);
    });
  });

  describe('getMedia', () => {
    it('should fetch media items from the media service', () => {
      // prepare
      const sources = ['foo'];
      const query = 'abc';
      const root = '11-22';
      const queryResult: MediaQueryResult = { hasMoreItems: false, items: [] };
      mediaServiceSpy.getMedia.and.returnValue(of(queryResult));

      // act
      const spy = jasmine.createSpy();
      sut.getMedia(root, sources, query).subscribe(spy);

      // assert
      expect(mediaServiceSpy.getMedia).toHaveBeenCalledTimes(1);
      const args = mediaServiceSpy.getMedia.calls.mostRecent().args[0];
      expect(args.language).toBe(contextValue.language!);
      expect(args.site).toBe(contextValue.siteName!);
      expect(args.sources).toBe(sources);
      expect(args.query).toBe(query);
      expect(args.root).toBe(root);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(queryResult);
    });
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
      expect(args.language).toBe(contextValue.language!);
      expect(args.site).toBe(contextValue.siteName!);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(imgItem);
    });
  });

  describe('addSelectedToFront', () => {
    describe('AND selectedId is empty', () => {
      it('should return the items without changes', () => {
        const items: MediaItemInfo[] = [
          { id: 'a', displayName: 'blah', url: '' },
          { id: 'b', displayName: 'blah', url: '' },
          { id: 'c', displayName: 'blah', url: '' },
        ];
        const spy = jasmine.createSpy();

        sut.withSelectedItemInFront('', [...items]).subscribe(spy);

        expect(spy.calls.argsFor(0)[0]).toEqual(items);
      });
    });

    describe('AND selected id is present in the given items', () => {
      it('should return the items with the selected one moved to the front', () => {
        const items: MediaItemInfo[] = [
          { id: 'a', displayName: 'blah', url: '' },
          { id: 'b', displayName: 'blah', url: '' },
          { id: 'c', displayName: 'blah', url: '' },
        ];
        const spy = jasmine.createSpy();

        sut.withSelectedItemInFront('c', [...items]).subscribe(spy);

        expect(spy.calls.argsFor(0)[0]).toEqual([items[2], items[0], items[1]]);
      });
    });

    describe('AND selected id is NOT present in the given items', () => {
      it('should get the selected item and return the items with the selected one added to front', () => {
        const selectedId = 'pi';
        const items: MediaItemInfo[] = [
          { id: 'a', displayName: 'blah', url: '' },
          { id: 'b', displayName: 'blah', url: '' },
          { id: 'c', displayName: 'blah', url: '' },
        ];
        const piItem: MediaItem = {
          id: selectedId,
          displayName: 'blah',
          url: '',
          embedUrl: '',
          height: 0,
          width: 0,
          parentId: '',
          path: '',
        };
        mediaServiceSpy.getMediaItem.and.returnValue(of(piItem));
        const spy = jasmine.createSpy();

        sut.withSelectedItemInFront(selectedId, [...items]).subscribe(spy);

        expect(mediaServiceSpy.getMediaItem).toHaveBeenCalledTimes(1);
        const args = mediaServiceSpy.getMediaItem.calls.argsFor(0)[0];
        expect(args.path).toBe(selectedId);
        expect(args.language).toBe(contextValue.language!);
        expect(args.site).toBe(contextValue.siteName!);
        expect(spy.calls.argsFor(0)[0]).toEqual([piItem, ...items]);
      });

      it('should apply empty sources when fetching item', () => {
        const selectedId = 'pi';
        const items: MediaItemInfo[] = [{ id: 'a', displayName: 'blah', url: '' }];
        mediaServiceSpy.getMediaItem.and.returnValue(NEVER);

        sut.withSelectedItemInFront(selectedId, items);

        expect(mediaServiceSpy.getMediaItem).toHaveBeenCalledTimes(1);
        const [options] = mediaServiceSpy.getMediaItem.calls.mostRecent().args as Parameters<
          MediaDalService['getMediaItem']
        >;
        expect(options.sources).toEqual([]);
      });
    });
  });

  describe('uploadMediaItem', () => {
    beforeEach(() => {
      const fileReaderMock = {
        result: 'data:image/jpg;,/5j/4AAQSkZJRgWERWAYABgAAD/',
        readyState: 2,
        onload: null as unknown as any,
        addEventListener(_: any, callback: () => void) {
          this.onload = callback;
        },
        readAsDataURL(_: File) {
          this.onload();
        },
      };
      spyOn(window, 'FileReader').and.returnValue(fileReaderMock as FileReader);
    });

    it('should call uploadMedia with correct parameters', async () => {
      mediaServiceSpy.uploadMedia.and.returnValue(of(uploadMediaResult));

      await sut.uploadMediaItem(file, 'currentFolderId');

      expect(mediaServiceSpy.uploadMedia).toHaveBeenCalledWith(
        { fileName: 'testImage', extension: 'jpg', blob: jasmine.any(String) },
        'currentFolderId',
        contextValue.language as string,
        contextValue.siteName as string,
      );
    });

    it('should call uploadMedia with correct parameters when file name contains multiple dots', async () => {
      mediaServiceSpy.uploadMedia.and.returnValue(of(uploadMediaResult));

      const fileWithDots = new File(['test'], 'test.1.image.jpg', { type: 'image/jpeg' });

      await sut.uploadMediaItem(fileWithDots, 'currentFolderId');

      expect(mediaServiceSpy.uploadMedia).toHaveBeenCalledWith(
        { fileName: 'test.1.image', extension: 'jpg', blob: jasmine.any(String) },
        'currentFolderId',
        contextValue.language as string,
        contextValue.siteName as string,
      );
    });
  });
});
