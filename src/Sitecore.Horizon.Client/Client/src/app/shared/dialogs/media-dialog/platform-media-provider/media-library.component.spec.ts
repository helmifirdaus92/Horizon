/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';

import {
  maxSize,
  MediaFolder,
  MediaFolderFlat,
  MediaItem,
  MediaItemInfo,
  MediaUploadResultCode,
} from 'app/shared/platform-media/media.interface';
import { convertToNestedTree } from 'app/shared/utils/tree.utils';
import { AssetPipeMock } from 'app/testing/assets-pipe-mock.module';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of, throwError } from 'rxjs';
import { MediaActionNotificationService } from './action-bar/media-action-notification.service';
import { buildMediaValue, MediaLibraryComponent } from './media-library.component';
import { MediaLibraryService } from './media-library.service';

@Component({
  selector: 'app-media-tree',
  template: '',
})
class TreeStubComponent {
  private _data: any;
  @Input() set data(value: any) {
    this._data = value;
  }
  get data() {
    return this._data;
  }

  @Input() getChildren: any;

  private _select: any;
  @Input() set select(value: any) {
    this._select = value;
  }
  get select() {
    return this._select;
  }
}

@Component({
  selector: 'app-media-content',
  template: '<ng-content></ng-content>',
})
class ContentStubComponent {
  private _items: any;
  @Input() set items(value: any) {
    this._items = value;
  }
  get items() {
    return this._items;
  }

  private _hasMoreItems: any;
  @Input() set hasMoreItems(value: any) {
    this._hasMoreItems = value;
  }
  get hasMoreItems() {
    return this._hasMoreItems;
  }

  private _select: any;
  @Input() set select(value: any) {
    this._select = value;
  }
  get select() {
    return this._select;
  }
}

@Component({
  selector: 'app-notifications',
  template: '',
})
class NotificationsStubComponent {
  @Input() notificationScope?: any;
}

@Component({
  selector: 'app-media-action-bar',
  template: '',
})
class ActionBarStubComponent {
  @Input() totalMediaItems?: number;
  @Input() hasCreatePermission?: boolean;
  @Input() isLoading?: boolean;
}

// Test data
const sources = ['S1'];
const sourcesFolder: MediaFolder[] = [
  {
    id: 'S1',
    displayName: 'S1',
    hasChildren: false,
    permissions: {
      canCreate: true,
      canDelete: true,
      canRename: true,
    },
  },
];

const imgItemFolder = 'A1';
const selectedId = '123';
const imgItem: MediaItem = {
  id: selectedId,
  parentId: imgItemFolder,
  displayName: 'blah',
  height: 1,
  width: 1,
  url: 'example.com',
  embedUrl: 'example.com',
  path: '/a/b',
};
const mediaItems = ['foo', 'bar'] as any;
const treeRoot: MediaFolder = {
  id: sources[0],
  displayName: 'foo',
  hasChildren: false,
  permissions: {
    canCreate: true,
    canDelete: true,
    canRename: true,
  },
};
const flatTree: MediaFolderFlat[] = [
  {
    id: sources[0],
    displayName: 'foo',
    hasChildren: true,
    parentId: '',
    permissions: {
      canCreate: true,
      canDelete: true,
      canRename: true,
    },
  },
  {
    id: imgItemFolder,
    parentId: sources[0],
    displayName: 'foo',
    hasChildren: false,
    permissions: {
      canCreate: true,
      canDelete: true,
      canRename: true,
    },
  },
];

describe(MediaLibraryComponent.name, () => {
  let sut: MediaLibraryComponent;
  let fixture: ComponentFixture<MediaLibraryComponent>;
  let mediaLibraryServiceSpy: jasmine.SpyObj<MediaLibraryService>;
  let mediaNotificationServiceSpy: jasmine.SpyObj<MediaActionNotificationService>;
  let treeComponent: TreeStubComponent;
  let contentComponent: ContentStubComponent;
  let files: FileList;
  let mediaSelectSpy: jasmine.Spy;

  function fixtureDetectAsyncChanges() {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  function setInputValues(_currentValueId: string | null = null, _sources: readonly string[] = []) {
    sut.sources = _sources;
    sut.currentValue = _currentValueId ? { rawValue: `<image mediaid="${_currentValueId}" />` } : null;
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        MediaLibraryComponent,
        TreeStubComponent,
        ContentStubComponent,
        NotificationsStubComponent,
        ActionBarStubComponent,
        AssetPipeMock,
      ],
      imports: [TranslateServiceStubModule, TranslateModule],
    })
      .overrideComponent(MediaLibraryComponent, {
        set: {
          // Because MediaLibraryService is provided in a component level, it cannot be replaced in a test module level.
          // https://angular.io/guide/testing#override-component-providers
          providers: [
            {
              provide: MediaLibraryService,
              useValue: jasmine.createSpyObj<MediaLibraryService>('MediaLibraryService', [
                'getMedia',
                'getMediaFolder',
                'getFolderChildren',
                'getFlatTree',
                'getMediaItem',
                'getMediaItemType',
                'withSelectedItemInFront',
                'uploadMediaItem',
              ]),
            },
            {
              provide: MediaActionNotificationService,
              useValue: jasmine.createSpyObj<MediaActionNotificationService>('MediaActionNotificationService', [
                'handleFolderOrMediaError',
                'handleMediaUploadNotification',
                'stopShowingNotification',
              ]),
            },
          ],
        },
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaLibraryComponent);
    sut = fixture.componentInstance;

    treeComponent = fixture.debugElement.query(By.directive(TreeStubComponent)).componentInstance;
    contentComponent = fixture.debugElement.query(By.directive(ContentStubComponent)).componentInstance;
    mediaLibraryServiceSpy = fixture.debugElement.injector.get<MediaLibraryService>(MediaLibraryService) as any;
    mediaNotificationServiceSpy = fixture.debugElement.injector.get<MediaActionNotificationService>(
      MediaActionNotificationService,
    ) as any;

    mediaLibraryServiceSpy.getMediaItem.and.returnValue(of(imgItem));
    mediaLibraryServiceSpy.getMediaItemType.and.returnValue(of({ id: 'id001', isImage: true, isFile: false }));
    mediaLibraryServiceSpy.getMediaFolder.and.returnValue(of(treeRoot));
    mediaLibraryServiceSpy.getMedia.and.returnValue(of({ hasMoreItems: true, items: mediaItems }));
    mediaLibraryServiceSpy.withSelectedItemInFront.and.callFake((_selectedId: any, items: any) => of(items));
    mediaLibraryServiceSpy.getFlatTree.and.returnValue(of(flatTree));

    files = { 0: new File([], 'file1.jpg') } as unknown as FileList;

    mediaSelectSpy = jasmine.createSpy('media select');
    sut.mediaSelect.subscribe(mediaSelectSpy);
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('emit selection', () => {
    describe('WHEN an image is selected', () => {
      it('should emit the data of the new selected value', fakeAsync(() => {
        // arrange
        const ids = ['id1', 'id2'];
        const firstImg: any = { id: ids[0] };
        const secondImg: any = { id: ids[1] };
        mediaLibraryServiceSpy.getMediaItem.withArgs(ids[0], jasmine.anything()).and.returnValue(of(firstImg));
        mediaLibraryServiceSpy.getMediaItem.withArgs(ids[1], jasmine.anything()).and.returnValue(of(secondImg));

        fixtureDetectAsyncChanges();
        // act
        sut.select(ids[1]);
        fixtureDetectAsyncChanges();

        // assert
        expect(mediaSelectSpy).not.toHaveBeenCalledWith(buildMediaValue(firstImg, 'image'));
        expect(mediaSelectSpy).toHaveBeenCalledWith(buildMediaValue(secondImg, 'image'));
        expect(mediaSelectSpy).toHaveBeenCalledTimes(1);
        flush();
      }));

      describe('AND the selected value has an error ', () => {
        it('should emit `null` as if the selection was cleared', fakeAsync(() => {
          // arrange
          const failId = 'will fail';
          mediaLibraryServiceSpy.getMediaItem.and.callFake((path) =>
            path === failId ? throwError(() => 'error') : of(imgItem),
          );
          fixtureDetectAsyncChanges();

          // act
          sut.select(failId);
          fixtureDetectAsyncChanges();

          // assert
          expect(mediaSelectSpy).toHaveBeenCalledOnceWith(null);
          flush();
        }));
      });
    });

    describe('WHEN the folder changes', () => {
      it('should emit `null` (as changing a folder clears the selection)', fakeAsync(() => {
        // arrange
        const abcFolder: MediaFolder = {
          id: 'abc',
          displayName: 'abc',
          hasChildren: false,
          permissions: {
            canCreate: true,
            canDelete: true,
            canRename: true,
          },
        };
        setInputValues('newFolder001_01202023', sources);
        fixtureDetectAsyncChanges();

        // act
        sut.folderChange(abcFolder);
        fixtureDetectAsyncChanges();

        // assert
        expect(mediaSelectSpy).toHaveBeenCalledOnceWith(null);
        flush();
      }));

      it('should emit `null` (as changing a folder clears the selection) without permission defined', fakeAsync(() => {
        // arrange
        const abcFolder: MediaFolder = {
          id: 'abc',
          displayName: 'abc',
          hasChildren: false,
        };
        setInputValues('newFolder001_01202023', sources);
        fixtureDetectAsyncChanges();

        // act
        sut.folderChange(abcFolder);
        fixtureDetectAsyncChanges();

        // assert
        expect(mediaSelectSpy).toHaveBeenCalledOnceWith(null);
        flush();
      }));
    });

    describe('getChildren()', () => {
      it('should get and return the children from the given folder', () => {
        const result = ['bar', 'foo'] as any;
        mediaLibraryServiceSpy.getFolderChildren.and.returnValue(result);

        expect(sut.getChildren(treeRoot)).toEqual(result);
        expect(mediaLibraryServiceSpy.getFolderChildren).toHaveBeenCalledTimes(1);
        expect(mediaLibraryServiceSpy.getFolderChildren).toHaveBeenCalledWith(treeRoot);
      });
    });

    describe('AND there is no initial selection', () => {
      it('should get tree using first source and set the result to tree component [data]', fakeAsync(() => {
        // arrange

        setInputValues(null, sources);
        const sourceNode = flatTree[0];
        mediaLibraryServiceSpy.getFlatTree.and.returnValue(of([sourceNode]));

        // act
        fixtureDetectAsyncChanges();

        // assert
        expect(mediaLibraryServiceSpy.getFlatTree).toHaveBeenCalledTimes(1);
        expect(mediaLibraryServiceSpy.getFlatTree).toHaveBeenCalledWith(sources[0], sources);
        expect(treeComponent.data).toEqual([sourceNode]);
        flush();
      }));

      it('should get root if sources are empty', fakeAsync(() => {
        setInputValues(null, []);
        const node: MediaFolder = {
          id: 'testId',
          displayName: 'testDsName',
          hasChildren: false,
          permissions: {
            canCreate: true,
            canDelete: true,
            canRename: true,
          },
        };
        mediaLibraryServiceSpy.getMediaFolder.and.returnValue(of(node));

        fixtureDetectAsyncChanges();

        expect(mediaLibraryServiceSpy.getMediaFolder).toHaveBeenCalledTimes(1);
        expect(mediaLibraryServiceSpy.getMediaFolder).toHaveBeenCalledWith('');
        expect(treeComponent.data).toEqual([node]);
        flush();
      }));

      it('should to able to get root node when permissions are not defined', fakeAsync(() => {
        setInputValues(null, []);
        const node: MediaFolder = {
          id: 'testId',
          displayName: 'testDsName',
          hasChildren: false,
        };
        mediaLibraryServiceSpy.getMediaFolder.and.returnValue(of(node));

        fixtureDetectAsyncChanges();

        expect(mediaLibraryServiceSpy.getMediaFolder).toHaveBeenCalledTimes(1);
        expect(mediaLibraryServiceSpy.getMediaFolder).toHaveBeenCalledWith('');
        expect(treeComponent.data).toEqual([node]);
        flush();
      }));

      it('should set first source to tree component [select]', fakeAsync(() => {
        // arrange
        setInputValues(null, sources);

        // act
        fixtureDetectAsyncChanges();

        // assert
        expect(mediaLibraryServiceSpy.getMediaItem).not.toHaveBeenCalled();
        expect(treeComponent.select).toBe(sources[0]);
        flush();
      }));

      it(`should get media for the given source, add the selected to front,
       and set [items] and [hasMoreItems] to the content component`, fakeAsync(() => {
        // arrange
        setInputValues(null, sources);

        // act
        fixtureDetectAsyncChanges();
        fixtureDetectAsyncChanges();

        // assert
        expect(mediaLibraryServiceSpy.getMedia).toHaveBeenCalledTimes(1);
        expect(mediaLibraryServiceSpy.getMedia).toHaveBeenCalledWith(sources[0], sources, '', [
          'C97BA923-8009-4858-BDD5-D8BE5FCCECF7',
          'F1828A2C-7E5D-4BBD-98CA-320474871548',
        ]);
        expect(mediaLibraryServiceSpy.withSelectedItemInFront).toHaveBeenCalledWith('', mediaItems);
        expect(contentComponent.hasMoreItems).toBe(true);
        expect(contentComponent.items).toEqual(mediaItems);
        flush();
      }));

      it('should set selectedId to empty value', fakeAsync(() => {
        // prepare
        const spy = spyOnProperty(contentComponent, 'select', 'set');
        setInputValues(null, sources);

        // act
        fixtureDetectAsyncChanges();

        // assert
        expect(spy).toHaveBeenCalledWith('');
        flush();
      }));

      describe('AND getting tree data throws an error', () => {
        const code = 'SourceNotFound';

        beforeEach(() => {
          mediaLibraryServiceSpy.getFlatTree.and.returnValue(throwError(() => code));
        });

        it('should handle the error', fakeAsync(() => {
          setInputValues(null, sources);
          fixtureDetectAsyncChanges();
          expect(mediaNotificationServiceSpy.handleFolderOrMediaError).toHaveBeenCalledWith(code);
          flush();
        }));

        it('should catch the error and set [] to tree component', fakeAsync(() => {
          // prepare
          setInputValues(null, sources);
          const spy = spyOnProperty(treeComponent, 'data', 'set');

          // act
          fixtureDetectAsyncChanges();

          // assert
          expect(spy).toHaveBeenCalledWith([]);
          flush();
        }));
      });
    });

    describe('AND there is an initially selected value', () => {
      it(`should get the flat tree for the selected image folder and source, convert to nested data,
       and set the result to tree component [data]`, fakeAsync(() => {
        // prepare
        setInputValues(selectedId, sources);

        // act
        fixtureDetectAsyncChanges();

        // assert
        expect(mediaLibraryServiceSpy.getFlatTree).toHaveBeenCalledTimes(1);
        expect(mediaLibraryServiceSpy.getFlatTree).toHaveBeenCalledWith(imgItemFolder, sources);
        expect(treeComponent.data).toEqual(convertToNestedTree(flatTree));
        flush();
      }));

      it('should get the selected image and set the image folder to tree component [select]', fakeAsync(() => {
        // prepare
        setInputValues(selectedId, sources);

        // act
        fixtureDetectAsyncChanges();

        // assert
        expect(mediaLibraryServiceSpy.getMediaItem).toHaveBeenCalledWith(selectedId, sources);
        expect(treeComponent.select).toBe(imgItemFolder);
        flush();
      }));

      it(`should get media for the selected image folder, add the selected to front,
       and set [items] and [hasMoreItems] to the content component`, fakeAsync(() => {
        // prepare
        const itemsPlusSelected = ['selected', ...mediaItems];
        mediaLibraryServiceSpy.withSelectedItemInFront.and.returnValue(of(itemsPlusSelected));
        setInputValues(selectedId, sources);

        // act
        fixtureDetectAsyncChanges();
        fixtureDetectAsyncChanges();

        // assert
        expect(mediaLibraryServiceSpy.getMedia).toHaveBeenCalledTimes(1);
        expect(mediaLibraryServiceSpy.getMedia).toHaveBeenCalledWith(imgItemFolder, sources, '', [
          'C97BA923-8009-4858-BDD5-D8BE5FCCECF7',
          'F1828A2C-7E5D-4BBD-98CA-320474871548',
        ]);
        expect(mediaLibraryServiceSpy.withSelectedItemInFront).toHaveBeenCalledWith(selectedId, mediaItems);
        expect(contentComponent.hasMoreItems).toBe(true);
        expect(contentComponent.items).toEqual(itemsPlusSelected);
        flush();
      }));

      it('should set selectedId to the selected value', fakeAsync(() => {
        // prepare
        const spy = spyOnProperty(contentComponent, 'select', 'set');
        setInputValues(selectedId, sources);

        // act
        fixtureDetectAsyncChanges();

        // assert
        expect(spy).toHaveBeenCalledWith(selectedId);
        flush();
      }));

      it('should get the selected image', fakeAsync(() => {
        // prepare
        setInputValues(selectedId, sources);

        // act
        fixtureDetectAsyncChanges();

        // assert
        expect(mediaLibraryServiceSpy.getMediaItem).toHaveBeenCalledWith(selectedId, sources);
        flush();
      }));

      describe('WHEN initial value does not have a valid mediaId', () => {
        it('should set selectedId to `""` as if nothing is selected', fakeAsync(() => {
          const spy = spyOnProperty(contentComponent, 'select', 'set').and.callThrough();
          setInputValues('', sources);

          fixtureDetectAsyncChanges();

          expect(spy).toHaveBeenCalledWith('');
          expect(contentComponent.select).toBe('');
          flush();
        }));
      });
    });

    describe('WHEN getting media items throws an error', () => {
      const code = 'RootNotFound';

      it('should handle the error', fakeAsync(() => {
        mediaLibraryServiceSpy.getMedia.and.returnValue(throwError(() => code));

        setInputValues(null, sources);
        fixtureDetectAsyncChanges();

        expect(mediaNotificationServiceSpy.handleFolderOrMediaError).toHaveBeenCalledWith(code);
        flush();
      }));

      it('should catch the error and NOT emit items and hasMoreItems', fakeAsync(() => {
        // prepare
        const itemsSpy = spyOnProperty(contentComponent, 'items', 'set');
        const hasMoreSpy = spyOnProperty(contentComponent, 'hasMoreItems', 'set');
        mediaLibraryServiceSpy.getMedia.and.returnValue(throwError(() => code));

        // act
        setInputValues(null, sources);
        fixtureDetectAsyncChanges();

        // assert
        expect(itemsSpy).toHaveBeenCalledWith(null); // the async pipe sets null initially while awaiting for first value
        expect(itemsSpy).toHaveBeenCalledTimes(1);

        expect(hasMoreSpy).toHaveBeenCalledWith(false);
        expect(hasMoreSpy).toHaveBeenCalledTimes(1);
        flush();
      }));
    });

    describe('folderChange()', () => {
      const newFolderId = 'new id 123';

      it(`should fetch media items for the selected folder, try to add the selected to front,
       and update [items] and [hasMoreItems] to content component`, fakeAsync(() => {
        // prepare
        const newFolder: MediaFolder = {
          id: 'new id 123',
          displayName: 'new id 123',
          hasChildren: false,
          permissions: {
            canCreate: true,
            canDelete: true,
            canRename: true,
          },
        };
        const newItems = [{ id: 'new1' }, { id: 'new2' }] as MediaItemInfo[];
        const returnObject = { hasMoreItems: true, items: newItems };
        mediaLibraryServiceSpy.getMedia.and.returnValue(of(returnObject));

        setInputValues(null, sources);
        fixtureDetectAsyncChanges();

        // act
        sut.folderChange(newFolder);
        fixture.detectChanges();

        // assert
        expect(mediaLibraryServiceSpy.getMedia).toHaveBeenCalledWith(newFolderId, sources, '', [
          'C97BA923-8009-4858-BDD5-D8BE5FCCECF7',
          'F1828A2C-7E5D-4BBD-98CA-320474871548',
        ]);
        expect(mediaLibraryServiceSpy.withSelectedItemInFront).toHaveBeenCalledWith('', newItems);
        expect(contentComponent.hasMoreItems).toBe(returnObject.hasMoreItems);
        expect(contentComponent.items).toEqual(newItems);
        flush();
      }));

      it(`should fetch media items for the selected folder when permissions are not defined`, fakeAsync(() => {
        // prepare
        const newFolder: MediaFolder = {
          id: 'new id 123',
          displayName: 'new id 123',
          hasChildren: false,
        };
        const newItems = [{ id: 'new1' }, { id: 'new2' }] as MediaItemInfo[];
        const returnObject = { hasMoreItems: true, items: newItems };
        mediaLibraryServiceSpy.getMedia.and.returnValue(of(returnObject));

        setInputValues(null, sources);
        fixtureDetectAsyncChanges();

        // act
        sut.folderChange(newFolder);
        fixture.detectChanges();

        // assert
        expect(mediaLibraryServiceSpy.getMedia).toHaveBeenCalledWith(newFolderId, sources, '', [
          'C97BA923-8009-4858-BDD5-D8BE5FCCECF7',
          'F1828A2C-7E5D-4BBD-98CA-320474871548',
        ]);
        expect(mediaLibraryServiceSpy.withSelectedItemInFront).toHaveBeenCalledWith('', newItems);
        expect(contentComponent.hasMoreItems).toBe(returnObject.hasMoreItems);
        expect(contentComponent.items).toEqual(newItems);
        flush();
      }));

      it(`should set selectedId to ''`, fakeAsync(() => {
        // prepare
        const newFolder: MediaFolder = {
          id: 'abc',
          displayName: 'abc',
          hasChildren: false,
          permissions: {
            canCreate: true,
            canDelete: true,
            canRename: true,
          },
        };
        setInputValues(selectedId, sources);
        fixtureDetectAsyncChanges();

        // act
        const spy = spyOnProperty(contentComponent, 'select', 'set');
        sut.folderChange(newFolder);
        fixture.detectChanges();

        // assert
        expect(spy).toHaveBeenCalledWith('');
        flush();
      }));

      describe('AND the value has not changed from source', () => {
        it('should not fetch items in the selected folder', fakeAsync(() => {
          setInputValues(null, sources);
          fixtureDetectAsyncChanges();
          const count = mediaLibraryServiceSpy.getMedia.calls.count();

          // act
          sut.folderChange(sourcesFolder[0]);
          fixture.detectChanges();

          // assert
          expect(mediaLibraryServiceSpy.getMedia).toHaveBeenCalledTimes(count);
          flush();
        }));

        it(`should NOT change the selectedId`, fakeAsync(() => {
          // prepare
          mediaLibraryServiceSpy.getMediaItem.and.returnValue(
            of({
              ...imgItem,
              // the component will set the initial folder from the selected item parent
              parentId: sources[0],
            }),
          );

          setInputValues(selectedId, sources);
          fixtureDetectAsyncChanges();

          // act
          const spy = spyOnProperty(contentComponent, 'select', 'set');
          sut.folderChange(sourcesFolder[0]);
          fixture.detectChanges();

          // assert
          expect(spy).not.toHaveBeenCalled();
          flush();
        }));
      });
    });

    describe('selectedId changes', () => {
      it('should get the selected image', fakeAsync(() => {
        setInputValues(null, sources);
        fixtureDetectAsyncChanges();

        // act
        sut.select(selectedId);
        fixtureDetectAsyncChanges();

        // assert
        expect(mediaLibraryServiceSpy.getMediaItem).toHaveBeenCalledWith(selectedId, sources);
        flush();
      }));

      it('should set absolute path to the CM instance', fakeAsync(() => {
        setInputValues(null, sources);
        fixtureDetectAsyncChanges();

        // act
        sut.select(selectedId);
        fixtureDetectAsyncChanges();

        // assert
        expect(mediaSelectSpy).toHaveBeenCalledWith(
          jasmine.objectContaining({
            embeddedHtml: `<img src="example.com" alt="" style="width:1px;height:1px;"/>`,
            src: `example.com`,
          }),
        );
        flush();
      }));

      describe('AND getting the selected image fails with an error', () => {
        const failId = 'will fail';

        beforeEach(() => {
          mediaLibraryServiceSpy.getMediaItem.and.callFake((path) =>
            path === failId ? throwError(() => 'error') : of(imgItem),
          );
        });

        describe('AND there is another selection which succeeds', () => {
          it('should get the selected image', fakeAsync(() => {
            // arrange
            setInputValues(null, sources);
            fixtureDetectAsyncChanges();

            // act
            sut.select(failId);
            fixture.detectChanges();

            const successId = 'will succeed';
            sut.select(successId);
            fixtureDetectAsyncChanges();

            // assert
            expect(mediaLibraryServiceSpy.getMediaItem).toHaveBeenCalledWith(successId, sources);
            flush();
          }));
        });
      });
    });

    describe('search()', () => {
      it(`should fetch media items with the given query, try to add the selected to front,
      and update [items] and [hasMoreItems] to content component`, fakeAsync(() => {
        // prepare
        const query = 'abc';
        const newItems = [{ id: 'new1' }, { id: 'new2' }] as MediaItemInfo[];
        const returnObject = { hasMoreItems: true, items: newItems };
        mediaLibraryServiceSpy.getMedia.and.returnValue(of(returnObject));

        setInputValues(null, sources);
        fixtureDetectAsyncChanges();

        // act
        sut.search(query);
        fixture.detectChanges();

        // assert
        expect(mediaLibraryServiceSpy.getMedia).toHaveBeenCalledWith(sources[0], sources, query, [
          'C97BA923-8009-4858-BDD5-D8BE5FCCECF7',
          'F1828A2C-7E5D-4BBD-98CA-320474871548',
        ]);
        expect(mediaLibraryServiceSpy.withSelectedItemInFront).toHaveBeenCalledWith('', newItems);
        expect(contentComponent.hasMoreItems).toBe(returnObject.hasMoreItems);
        expect(contentComponent.items).toEqual(newItems);
        flush();
      }));

      describe('AND search query has not changed', () => {
        it('should not fetch items in the selected folder', fakeAsync(() => {
          const query = 'abc';
          setInputValues(null, sources);
          fixtureDetectAsyncChanges();

          sut.search(query);
          fixture.detectChanges();

          const count = mediaLibraryServiceSpy.getMedia.calls.count();

          // act
          sut.search(query);
          fixture.detectChanges();

          // assert
          expect(mediaLibraryServiceSpy.getMedia).toHaveBeenCalledTimes(count);
          flush();
        }));
      });
    });

    describe(`"Empty" placeholder`, () => {
      it(`should not show empty before data is fetched`, fakeAsync(() => {
        setInputValues(null, sources);
        fixtureDetectAsyncChanges();

        expect(fixture.debugElement.query(By.css('.empty'))).toBeFalsy();
        flush();
      }));

      describe('WHEN you have results', () => {
        it('should not show empty', fakeAsync(() => {
          setInputValues(null, sources);
          fixtureDetectAsyncChanges();

          expect(fixture.debugElement.query(By.css('.empty'))).toBeFalsy();
          flush();
        }));
      });

      describe('WHEN data is empty and there is no search', () => {
        it('should show empty folder', fakeAsync(() => {
          mediaLibraryServiceSpy.getMedia.and.returnValue(of({ hasMoreItems: false, items: [] }));

          setInputValues(null, sources);
          fixtureDetectAsyncChanges();
          fixtureDetectAsyncChanges();

          expect(fixture.debugElement.query(By.css('.empty')).context.text).toContain('MEDIA.EMPTY_FOLDER');
          flush();
        }));
      });

      describe('WHEN data is empty and there is a search', () => {
        it('should show no search results', fakeAsync(() => {
          mediaLibraryServiceSpy.getMedia.and.returnValue(of({ hasMoreItems: false, items: [] }));

          setInputValues(null, sources);
          fixtureDetectAsyncChanges();

          sut.search('query');
          fixture.detectChanges();

          expect(fixture.debugElement.query(By.css('.empty')).context.text).toContain('MEDIA.NO_SEARCH_RESULTS');
          flush();
        }));
      });
    });

    describe('uploadMediaFile', () => {
      it('should not call uploadMediaItem from MediaLibraryService if file is null', () => {
        sut.uploadMediaFile(null);
        fixture.detectChanges();

        expect(mediaLibraryServiceSpy.uploadMediaItem).not.toHaveBeenCalled();
      });

      describe('File validation', () => {
        it('should show notification if selected file type is not supported', () => {
          files = { 0: new File([], 'file1.pdf') } as unknown as FileList;

          sut.uploadMediaFile(files);
          fixture.detectChanges();

          const code: MediaUploadResultCode = 'InvalidExtension';

          expect(mediaNotificationServiceSpy.handleMediaUploadNotification).toHaveBeenCalledWith(code);
        });

        it('should show notification if selected file size exceeds the limit', () => {
          const FileSizeTooBig = maxSize;

          const mockFile = new File(['test-content'], 'test.jpg', { type: 'image/jpeg' });
          Object.defineProperty(mockFile, 'size', { value: FileSizeTooBig + 1 });

          files = { 0: mockFile } as unknown as FileList;

          sut.uploadMediaFile(files);
          fixture.whenStable();

          const code: MediaUploadResultCode = 'FileSizeTooBig';

          expect(mediaNotificationServiceSpy.handleMediaUploadNotification).toHaveBeenCalledWith(code);
        });
      });

      it('should call uploadMediaItem when all validation checks passes', () => {
        files = { 0: new File([], 'file2.jpg') } as unknown as FileList;

        sut.currentFolderId = 'folderId';
        sut.uploadMediaFile(files);
        fixture.detectChanges();

        expect(mediaLibraryServiceSpy.uploadMediaItem).toHaveBeenCalledWith(files[0], 'folderId');
      });

      it('should refetch media items on each new emission for reloadMediaContents$', fakeAsync(() => {
        setInputValues(null, sources);
        fixtureDetectAsyncChanges();

        sut.reloadMediaContents$.next(true);

        expect(mediaLibraryServiceSpy.getMedia).toHaveBeenCalledWith(sources[0], sources, '', [
          'C97BA923-8009-4858-BDD5-D8BE5FCCECF7',
          'F1828A2C-7E5D-4BBD-98CA-320474871548',
        ]);
        flush();
      }));
    });
  });
});
