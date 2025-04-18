/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DebugElement, NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogOverlayService, PopoverModule } from '@sitecore/ng-spd-lib';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { MediaDialogService } from 'app/shared/dialogs/media-dialog/media-dialog.service';
import { MediaLibraryService } from 'app/shared/dialogs/media-dialog/platform-media-provider/media-library.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { FieldChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { CmUrlTestingModule } from 'app/shared/pipes/platform-url/cm-url.module.testing';
import { MediaDalService } from 'app/shared/platform-media/media.dal.service';
import { MediaItem } from 'app/shared/platform-media/media.interface';
import { Interface } from 'app/shared/utils/lang.utils';
import { observableWithValue, TestBedInjectSpy, TESTING_URL } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { asyncScheduler, EMPTY, NEVER, observeOn, of, ReplaySubject, Subject, throwError } from 'rxjs';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { ImageFieldMessagingService, MediaValue } from './image-field-messaging.service';
import { buildImageValue, ImageFieldComponent } from './image-field.component';

@Pipe({ name: 'fileSize' })
class MediaFileSizePipeTesting implements PipeTransform {
  transform(value = 0, _decimals = 0): string {
    return value.toString();
  }
}

@Pipe({ name: 'resizeMedia' })
class ResizeMediaPipeTesting implements PipeTransform {
  transform(url: string, _maxHeight = 260, _maxWidth = 260): string {
    return url;
  }
}

class ImageFieldMessagingServiceTesting implements Interface<ImageFieldMessagingService> {
  currentValue$ = new ReplaySubject<MediaValue | null>(1);

  init = jasmine.createSpy('init');
  destroy = jasmine.createSpy('destroy');
  set = jasmine.createSpy('save');
  clear = jasmine.createSpy('clear');
}

const ContextValue: Partial<ContextService> = {
  itemId: 'foo',
  language: 'lang1',
  siteName: 'mysite',
};

function makeImageFieldValue(init: Partial<MediaValue>): MediaValue {
  return {
    rawValue: '<image mediaid="mediaId" />',
    mediaId: 'mediaId',
    src: TESTING_URL,
    width: 0,
    height: 0,
    alt: 'alt',
    // Override defaults with init values
    ...init,
  };
}

function makeMediaItem(init: Partial<MediaItem>): MediaItem {
  return {
    id: 'mediaId',
    url: TESTING_URL,
    embedUrl: TESTING_URL,
    width: 0,
    height: 0,
    alt: 'alt',
    displayName: 'name',
    parentId: 'parent',
    path: '/abc',
    // Override defaults with init values
    ...init,
  };
}

const testSources = ['soourcee!', 'source2'];

describe('ImageFieldComponent', () => {
  let sut: ImageFieldComponent;
  let fixture: ComponentFixture<ImageFieldComponent>;
  let de: DebugElement;
  let mediaService: jasmine.SpyObj<MediaDalService>;
  let mediaDialogService: jasmine.SpyObj<MediaDialogService>;
  let itemService: jasmine.SpyObj<BaseItemDalService>;
  let timedNotificationsSpy: jasmine.SpyObj<TimedNotificationsService>;
  let messagingService: ImageFieldMessagingServiceTesting;
  let mediaLibraryServiceSpy: jasmine.SpyObj<MediaLibraryService>;

  function getRenderedImage(): HTMLImageElement {
    return de.query(By.css('ng-spd-thumbnail img')).nativeElement;
  }

  function getRenderedPath(): HTMLInputElement {
    return de.query(By.css('input')).nativeElement;
  }

  function getFullUrl(relativePath: string) {
    return `${TESTING_URL}${relativePath}`;
  }

  function shouldRenderFieldWithValue(url: string, alt: string, path: string) {
    it('should render image thumbnail with src and alt-text', () => {
      const thumbnail = getRenderedImage();

      expect(thumbnail.src).toBe(getFullUrl(url));
      expect(thumbnail.alt).toBe(alt);
    });

    it('should render image path in the field', () => {
      const input = getRenderedPath();

      expect(input.value).toBe(path);
    });
  }

  beforeEach(waitForAsync(() => {
    spyOnProperty(HTMLInputElement.prototype, 'size', 'set').and.callFake((value: any) => {
      if (typeof value !== 'number') {
        return;
      } else {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'size')!.set!.call(this, value);
      }
    });

    mediaLibraryServiceSpy = jasmine.createSpyObj<MediaLibraryService>('MediaLibraryService', [
      'getMediaItem',
      'uploadMediaItem',
    ]);
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, FormsModule, CmUrlTestingModule, PopoverModule],
      declarations: [ImageFieldComponent, MediaFileSizePipeTesting, ResizeMediaPipeTesting],
      providers: [
        {
          provide: MediaDialogService,
          useValue: jasmine.createSpyObj<MediaDialogService>('MediaDialogService', ['show']),
        },
        {
          provide: MediaDalService,
          useValue: jasmine.createSpyObj<MediaDalService>('MediaService', ['getMediaItem']),
        },
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>('EditorRhsService', { getFieldDataSources: EMPTY }),
        },
        { provide: ContextService, useValue: ContextValue },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', ['push']),
        },
        {
          provide: DialogOverlayService,
          useValue: {},
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ImageFieldComponent, {
        set: {
          providers: [
            {
              provide: ImageFieldMessagingService,
              useClass: ImageFieldMessagingServiceTesting,
            },
            { provide: MediaLibraryService, useValue: mediaLibraryServiceSpy },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ImageFieldComponent);
    de = fixture.debugElement;
    sut = fixture.componentInstance;

    itemService = TestBedInjectSpy(BaseItemDalService);
    itemService.getFieldDataSources.and.returnValue(of(testSources));

    mediaService = TestBedInjectSpy(MediaDalService);
    mediaDialogService = TestBedInjectSpy(MediaDialogService);
    timedNotificationsSpy = TestBedInjectSpy(TimedNotificationsService);
    messagingService = de.injector.get(ImageFieldMessagingService) as any;

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

    const rhsMessaging = jasmine.createSpyObj<RhsEditorMessaging>('messaging', {
      getChannel: { bar: 'foo' } as any,
    });
    const fieldChrome: FieldChromeInfo = {
      chromeId: 'fld_1',
      chromeType: 'field',
      displayName: 'displayName',
      fieldId: 'fld-id',
      fieldType: 'image',
      contextItem: {
        id: 'item-id',
        language: 'item-lang',
        version: -1,
      },
      isPersonalized: false,
    };
    sut.rhsMessaging = rhsMessaging;
    sut.chrome = fieldChrome;
  }));

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('Value from RHS', () => {
    describe('AND value is null', () => {
      beforeEach(() => {
        fixture.detectChanges();
        messagingService.currentValue$.next(null);
        fixture.detectChanges();
      });

      it('should call selectFromMediaDialog(), when button is clicked', () => {
        const openDialogBtn = fixture.debugElement.query(By.css('.upload-text')).nativeElement;
        openDialogBtn.click();

        expect(mediaDialogService.show).toHaveBeenCalledWith({
          sources: testSources,
          currentValue: null,
        });
      });

      describe('AND another value emits', () => {
        const url = 'media-123';
        const alt = 'alt text';
        const path = 'a/b/c';
        const id = 'foo';

        beforeEach(fakeAsync(() => {
          tick();
          mediaService.getMediaItem.and.returnValue(of(makeMediaItem({ id, url, alt, path })));
          fixture.detectChanges();
          messagingService.currentValue$.next(makeImageFieldValue({ mediaId: id, src: url, alt }));
          fixture.detectChanges();
          tick();
          flush();
        }));

        shouldRenderFieldWithValue(url, alt, path);
      });
    });

    describe('does not have mediaId', () => {
      describe('AND alt text is provided', () => {
        const url = 'url';
        const alt = 'alt';

        beforeEach(fakeAsync(() => {
          fixture.detectChanges();
          messagingService.currentValue$.next(makeImageFieldValue({ mediaId: undefined, src: url, alt }));
          tick();
          fixture.detectChanges();
          flush();
        }));

        // fallback for path should be url
        shouldRenderFieldWithValue(url, alt, url);
      });

      describe('AND alt text is not provided', () => {
        const url = 'url';

        beforeEach(fakeAsync(() => {
          fixture.detectChanges();
          messagingService.currentValue$.next(makeImageFieldValue({ mediaId: undefined, src: url, alt: undefined }));
          tick();
          fixture.detectChanges();
          flush();
        }));

        // fallback for path should be url
        // fallback or alt is ''
        shouldRenderFieldWithValue(url, '', url);
      });

      describe('AND does not have src value', () => {
        beforeEach(fakeAsync(() => {
          fixture.detectChanges();
          messagingService.currentValue$.next(
            makeImageFieldValue({ rawValue: `<image />`, mediaId: undefined, src: undefined }),
          );
          tick();
          fixture.detectChanges();
          flush();
        }));

        it('should render image path in the field', () => {
          const input = getRenderedPath();

          expect(input.value).toBe('');
        });
      });
    });

    describe('has mediaId', () => {
      const url = 'media-123';
      const alt = 'alt text';
      const path = 'a/b/c';
      const id = 'foo';

      const currentValue: MediaValue = {
        rawValue: 'raw',
        src: url,
        alt,
        mediaId: id,
      };

      beforeEach(fakeAsync(() => {
        mediaService.getMediaItem.and.returnValue(of(makeMediaItem({ id, url, alt, path })));
        fixture.detectChanges();
        messagingService.currentValue$.next(currentValue);
        fixture.detectChanges();
        tick();
        flush();
      }));

      it('should fetch media details to resolve path', () => {
        expect(mediaService.getMediaItem).toHaveBeenCalledTimes(1);
        const args = mediaService.getMediaItem.calls.mostRecent().args;
        const options = args[0];
        const useCache = args[1];
        expect(options.path).toBe(id);
        expect(options.language).toBe(ContextValue.language!);
        expect(options.site).toBe(ContextValue.siteName!);
        expect(options.sources).toEqual([]);
        expect(useCache).toBe(true);
      });

      shouldRenderFieldWithValue(url, alt, path);

      it('should call MediaDialogComponent.show(), when button is clicked', () => {
        const changeImageBtn = fixture.debugElement.query(By.css('button[aria-label="Change Image"]')).nativeElement;
        changeImageBtn.click();

        expect(mediaDialogService.show).toHaveBeenCalledWith({
          sources: testSources,
          currentValue,
        });
      });

      describe('AND another value emits', () => {
        const newUrl = 'media-123';
        const newAlt = 'alt text';
        const newPath = 'a/b/c';
        const newId = 'foo';

        beforeEach(fakeAsync(() => {
          tick();
          mediaService.getMediaItem.and.returnValue(
            of(makeMediaItem({ id: newId, url: newUrl, alt: newAlt, path: newPath })),
          );
          fixture.detectChanges();
          messagingService.currentValue$.next(makeImageFieldValue({ mediaId: newId, src: newUrl, alt: newAlt }));
          fixture.detectChanges();
          tick();
          flush();
        }));

        shouldRenderFieldWithValue(newUrl, newAlt, newPath);
      });
    });

    describe('Value from LHS has mediaId AND getMediaItem fails', () => {
      const url = 'media-123';
      const alt = 'alt text';
      const wrongId = 'wrong';

      beforeEach(fakeAsync(() => {
        mediaService.getMediaItem.and.returnValue(throwError(() => 'myerror').pipe(observeOn(asyncScheduler)));

        fixture.detectChanges();

        messagingService.currentValue$.next({ mediaId: wrongId, src: url, alt, rawValue: 'rawValue' });
        tick();
        fixture.detectChanges();
        flush();
      }));

      // When resolve path fails it defaults to mediaId
      shouldRenderFieldWithValue(url, alt, wrongId);

      describe('AND a new value is entered which succeeds', () => {
        const id = 'foo';
        const path = 'a/b/c';
        const newurl = 'url.success';
        const newalt = 'new alt';

        beforeEach(fakeAsync(() => {
          mediaService.getMediaItem.and.returnValue(of(makeMediaItem({ id, path, url: newurl, alt: newalt })));

          messagingService.currentValue$.next({ mediaId: id, src: 'src', rawValue: 'raw' });
          fixture.detectChanges();
          tick();
          flush();
        }));

        it('should re-fetch media details', () => {
          expect(mediaService.getMediaItem).toHaveBeenCalledTimes(2);
          const args = mediaService.getMediaItem.calls.mostRecent().args;
          const options = args[0];
          const useCache = args[1];
          expect(options.path).toBe(id);
          expect(options.language).toBe(ContextValue.language!);
          expect(options.site).toBe(ContextValue.siteName!);
          expect(options.sources).toEqual([]);
          expect(useCache).toBe(true);
        });

        shouldRenderFieldWithValue(newurl, newalt, path);
      });
    });
  });

  describe('selectFromMediaDialog()', () => {
    it('should call show() on MediaDialogService', async () => {
      mediaDialogService.show.and.returnValue(NEVER);

      messagingService.currentValue$.next(null);
      fixture.detectChanges();
      sut.selectFromMediaDialog();

      expect(mediaDialogService.show).toHaveBeenCalled();
    });

    describe('AND an image is selected', () => {
      const initialRawValue = 'initialId';
      const testMediaItem: MediaItem = {
        displayName: 'filter coffe',
        url: 'cfe.dk',
        embedUrl: 'cfe.dk',
        height: 10,
        width: 12,
        id: '42',
        parentId: 'f1',
        path: '/a/b',
      };
      let onSelect: Subject<MediaValue>;

      beforeEach(() => {
        mediaService.getMediaItem.and.returnValue(of(testMediaItem));

        onSelect = new Subject();
        mediaDialogService.show.and.returnValue(onSelect);

        fixture.detectChanges();
        messagingService.currentValue$.next(makeImageFieldValue({ rawValue: initialRawValue }));
        fixture.detectChanges();

        sut.selectFromMediaDialog();
        fixture.detectChanges();
      });

      it('should save the new value', () => {
        // arrange
        const mediaItem: MediaItem = {
          ...testMediaItem,
          id: 'new-id-42',
          url: 'changed.cat',
          alt: 'new alt',
          path: 'new/path',
        };

        const itemDetails = buildImageValue(mediaItem);

        // act
        onSelect.next(itemDetails);

        // assert
        expect(messagingService.set).toHaveBeenCalledWith(itemDetails);
      });

      describe('and value has not changed', () => {
        it('should ignore this value', () => {
          // arrange
          mediaService.getMediaItem.calls.reset();

          // act
          onSelect.next({ src: 'foo', rawValue: initialRawValue });

          // assert
          expect(messagingService.set).not.toHaveBeenCalled();
          expect(mediaService.getMediaItem).not.toHaveBeenCalled();
        });
      });
    });

    describe('WHEN an image without mediaId is selected', () => {
      describe('AND the selected image from the dialog has the same rawValue', () => {
        it('should ignore this value', () => {
          // arrange
          const url = 'same.url';
          const onSelect = new Subject<MediaValue>();
          const rawValue = 'raw123';

          mediaDialogService.show.and.returnValue(onSelect);

          fixture.detectChanges();
          messagingService.currentValue$.next({ mediaId: undefined, src: url, rawValue });
          fixture.detectChanges();

          sut.selectFromMediaDialog();

          mediaService.getMediaItem.calls.reset();

          // act
          onSelect.next({ mediaId: undefined, src: '', rawValue });

          // assert
          expect(messagingService.set).not.toHaveBeenCalled();
          expect(mediaService.getMediaItem).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('onPathChange', () => {
    const imgUrl = 'media-123';
    const alt = 'alt text';
    const newPath = 'new/path';
    const id = 'foo';
    const width = 10;
    const height = 10;

    const resolvedMedia: MediaItem = {
      id,
      url: imgUrl,
      embedUrl: imgUrl,
      alt,
      path: newPath,
      width,
      height,
      displayName: '',
      parentId: '',
    };

    beforeEach(() => {
      mediaService.getMediaItem.and.returnValue(of(resolvedMedia));
      fixture.detectChanges();
    });

    it('should be called when image path input changes due to blur', () => {
      const spy = spyOn(sut, 'onPathChange');

      const input = getRenderedPath();
      input.dispatchEvent(new Event('focus'));
      fixture.detectChanges();
      input.value = 'new/path';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith('new/path');
    });

    it('should be called when image path input changes due to "enter" key', () => {
      const spy = spyOn(sut, 'onPathChange');

      const input = getRenderedPath();
      input.dispatchEvent(new Event('focus'));
      fixture.detectChanges();
      input.value = 'new/path';
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith('new/path');
    });

    it('should fetch media details without cache to validate the new path', () => {
      sut.onPathChange(newPath);
      fixture.detectChanges();

      const [options, useCache] = mediaService.getMediaItem.calls.first().args;
      expect(options.path).toBe(newPath);
      expect(options.language).toBe(ContextValue.language!);
      expect(options.site).toBe(ContextValue.siteName!);
      expect(options.sources).toEqual(observableWithValue(testSources));
      expect(useCache).toBe(false);
    });

    it('should save the new value', () => {
      sut.onPathChange(newPath);
      fixture.detectChanges();

      expect(messagingService.set).toHaveBeenCalledWith(buildImageValue(resolvedMedia));
    });

    describe('AND value is empty', () => {
      beforeEach(() => {
        messagingService.currentValue$.next(makeImageFieldValue({ mediaId: id })); // set a value so that there is a change;
        fixture.detectChanges();
        sut.onPathChange('');
        fixture.detectChanges();
      });

      it('should call change field in editor service with empty value', () => {
        expect(messagingService.clear).toHaveBeenCalledTimes(1);
      });
    });

    describe('AND validation fails', () => {
      it('should NOT save', () => {
        mediaService.getMediaItem.and.returnValue(throwError(() => ({})));

        sut.onPathChange(newPath);
        fixture.detectChanges();

        expect(messagingService.set).not.toHaveBeenCalled();
      });

      it('should set invalid path to true', () => {
        // prepare
        const code = 'NotFound';
        mediaService.getMediaItem.and.returnValue(throwError(() => code));
        const initialValue = sut.invalidPath;

        // act
        sut.onPathChange('aaa');
        fixture.detectChanges();

        // assert
        expect(sut.invalidPath).toBe(true);
        expect(sut.invalidPath).not.toBe(initialValue);
      });

      describe('AND messaging emits a new value', () => {
        it('should reset invalid path', () => {
          // prepare
          const code = 'NotFound';
          mediaService.getMediaItem.and.returnValue(throwError(() => code));

          // act
          sut.onPathChange('aaa');
          fixture.detectChanges();
          const invalidPath = sut.invalidPath;

          // emit a new value after changing path has failed
          mediaService.getMediaItem.and.returnValue(of(resolvedMedia));
          messagingService.currentValue$.next({ mediaId: resolvedMedia.id, src: resolvedMedia.url, rawValue: 'raw' });
          fixture.detectChanges();

          expect(invalidPath).toBe(true);
          expect(sut.invalidPath).toBe(false);
        });
      });

      describe('AND error code is NotFound', () => {
        it('should show a timed notification with the corresponding message', fakeAsync(() => {
          const code = 'NotFound';
          mediaService.getMediaItem.and.returnValue(throwError(() => code));

          sut.onPathChange('aaa');
          tick();

          expect(timedNotificationsSpy.push).toHaveBeenCalledWith(
            'ChangeImageError-' + code,
            'EDITOR.IMAGE.NOT_FOUND',
            'error',
          );
          flush();
        }));
      });

      describe('AND error code is NotAMedia', () => {
        it('should show a timed notification with the corresponding message', fakeAsync(() => {
          const code = 'NotAMedia';
          mediaService.getMediaItem.and.returnValue(throwError(() => code));

          sut.onPathChange('aaa');
          tick();

          expect(timedNotificationsSpy.push).toHaveBeenCalledWith(
            'ChangeImageError-' + code,
            'EDITOR.IMAGE.NOT_A_MEDIA',
            'error',
          );
          flush();
        }));
      });

      describe('AND error code is unknown', () => {
        it('should show a timed notification with the corresponding message', fakeAsync(() => {
          const code = 'other error code';
          mediaService.getMediaItem.and.returnValue(throwError(() => code));

          sut.onPathChange('aaa');
          tick();

          expect(timedNotificationsSpy.push).toHaveBeenCalledWith(
            'ChangeImageError-' + code,
            'ERRORS.OPERATION_GENERIC',
            'error',
          );
          flush();
        }));
      });
    });
  });
});
