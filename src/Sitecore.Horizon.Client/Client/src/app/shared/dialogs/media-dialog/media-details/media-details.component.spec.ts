/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { CmUrlTestingModule } from 'app/shared/pipes/platform-url/cm-url.module.testing';
import { MediaPipesModule } from 'app/shared/platform-media/media-pipes/media-pipes.module';
import { MediaItem } from 'app/shared/platform-media/media.interface';
import { AssetPipeMock } from 'app/testing/assets-pipe-mock.module';
import { TESTING_URL } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of, throwError } from 'rxjs';
import { MediaDetailsComponent } from './media-details.component';
import { MediaDetailsService } from './media-details.service';

function makeMediaItem(init: Partial<MediaItem>): MediaItem {
  return {
    id: 'mediaId',
    url: TESTING_URL,
    width: 0,
    height: 0,
    alt: 'alt',
    displayName: 'name',
    parentId: 'parent',
    path: '/abc',
    embedUrl: TESTING_URL,
    // Override defaults with init values
    ...init,
  };
}

function makeImageFieldValue(init: Partial<MediaValue>): MediaValue {
  return {
    rawValue: '<image />',
    src: TESTING_URL,
    width: 200,
    height: 300,
    alt: 'alt text',
    // Override defaults with init values
    ...init,
  };
}

const MISSING_VALUE_TEXT = '--';

describe('MediaDetailsComponent', () => {
  let component: MediaDetailsComponent;
  let fixture: ComponentFixture<MediaDetailsComponent>;
  let de: DebugElement;
  let mediaItemServiceSpy: jasmine.SpyObj<MediaDetailsService>;

  function queryFieldElements(prop: 'textContent' | 'title') {
    const fieldValues = de.queryAll(By.css('.field-value'));

    return {
      displayName: fieldValues[0].nativeElement[prop],
      extension: fieldValues[1].nativeElement[prop],
      size: fieldValues[2].nativeElement[prop],
      dimensions: fieldValues[3].nativeElement[prop],
      path: fieldValues[4].nativeElement[prop],
      alt: fieldValues[5].nativeElement[prop],
    };
  }

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, CmUrlTestingModule, MediaPipesModule],
      declarations: [MediaDetailsComponent, AssetPipeMock],
      providers: [
        {
          provide: MediaDetailsService,
          useValue: jasmine.createSpyObj<MediaDetailsService>('MediaDetailsService', ['getMediaItem']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaDetailsComponent);
    component = fixture.componentInstance;

    de = fixture.debugElement;
    fixture.detectChanges();

    mediaItemServiceSpy = de.injector.get<MediaDetailsService>(MediaDetailsService) as any;
    mediaItemServiceSpy.getMediaItem.and.returnValue(of(makeMediaItem({})));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('[item]', () => {
    describe('when `null`', () => {
      it('should show empty container', () => {
        expect(de.query(By.css('.empty'))).toBeTruthy();
      });
    });

    describe('when platform Image', () => {
      const mediaItem: MediaItem = makeMediaItem({
        id: 'foo',
        displayName: 'bar',
        url: '/favicon.ico',
        embedUrl: '/favicon.ico',
        alt: 'fez',
        dimensions: 'faz',
        extension: 'fuz',
        height: 123,
        path: 'buf',
        size: 456,
        width: 789,
        parentId: '',
      });

      const imageFieldValue: MediaValue = {
        rawValue: '<image mediaid="mediaId" />',
        src: '/favicon.ico',
        alt: 'fez',
      };

      it('should show thumbnail with alt', fakeAsync(() => {
        const url = mediaItem.url;
        mediaItemServiceSpy.getMediaItem.and.returnValue(of(mediaItem));
        component.media = imageFieldValue;

        tick();
        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('ng-spd-thumbnail img'));
        const attributes = el.nativeElement.attributes;
        expect(attributes.getNamedItem('src').value).toBe(`${TESTING_URL}${url}?mh=260&mw=260`);
        expect(attributes.getNamedItem('alt').value).toBe(mediaItem.alt);
        flush();
      }));

      it('should fill the .field-value elements with the correct text', fakeAsync(() => {
        mediaItemServiceSpy.getMediaItem.and.returnValue(of(mediaItem));
        component.media = imageFieldValue;

        tick();
        fixture.detectChanges();

        const fieldValues = queryFieldElements('textContent');
        expect(fieldValues.displayName).toBe(mediaItem.displayName);
        expect(fieldValues.extension).toBe(mediaItem.extension);
        expect(fieldValues.size).toBe(`${mediaItem.size} B`);
        expect(fieldValues.dimensions).toBe(mediaItem.dimensions + ' px');
        expect(fieldValues.path).toBe(mediaItem.path);
        expect(fieldValues.alt).toBe(mediaItem.alt);
        flush();
      }));

      it('should add the correct title for display name, path and alt', fakeAsync(() => {
        mediaItemServiceSpy.getMediaItem.and.returnValue(of(mediaItem));
        component.media = imageFieldValue;

        tick();
        fixture.detectChanges();

        const fieldValues = queryFieldElements('title');
        expect(fieldValues.displayName).toBe(mediaItem.displayName);
        expect(fieldValues.path).toBe(mediaItem.path);
        expect(fieldValues.alt).toBe(mediaItem.alt);
        flush();
      }));

      describe('when GetMediaItem request fails', () => {
        it('should show placeholder thumbnail with dimensions that matches `defaultDimension`', fakeAsync(() => {
          mediaItemServiceSpy.getMediaItem.and.returnValue(throwError(() => 'error'));
          component.media = imageFieldValue;

          tick();
          fixture.detectChanges();

          const el = fixture.debugElement.query(By.css('ng-spd-thumbnail img'));
          const attributes = el.nativeElement.attributes;

          expect(attributes.getNamedItem('src').value).toBe('assets/graphics/image-icon.svg');
          expect(attributes.getNamedItem('width').value).toBe(component.defaultDimension.toString());
          expect(attributes.getNamedItem('height').value).toBe(component.defaultDimension.toString());
          flush();
        }));

        it('should use `noData` as text for display name, extensions, path and alt', fakeAsync(() => {
          mediaItemServiceSpy.getMediaItem.and.returnValue(throwError(() => 'error'));
          component.media = imageFieldValue;

          tick();
          fixture.detectChanges();

          const fieldValues = queryFieldElements('textContent');
          expect(fieldValues.displayName).toBe(MISSING_VALUE_TEXT);
          expect(fieldValues.extension).toBe(MISSING_VALUE_TEXT);
          expect(fieldValues.path).toBe(MISSING_VALUE_TEXT);
          expect(fieldValues.alt).toBe(MISSING_VALUE_TEXT);
          flush();
        }));

        it('should set no title for display name, path and alt', fakeAsync(() => {
          mediaItemServiceSpy.getMediaItem.and.returnValue(throwError(() => 'error'));
          component.media = imageFieldValue;

          tick();
          fixture.detectChanges();

          const fieldValues = queryFieldElements('title');
          expect(fieldValues.displayName).toBe('');
          expect(fieldValues.path).toBe('');
          expect(fieldValues.alt).toBe('');
          flush();
        }));
      });
    });

    describe(`when 3rd party Image`, () => {
      const testItem: MediaValue = makeImageFieldValue({});

      it('should show correct thumbnail with alt', () => {
        component.media = testItem;

        fixture.detectChanges();

        const el = fixture.debugElement.query(By.css('ng-spd-thumbnail img'));
        const attributes = el.nativeElement.attributes;
        expect(attributes.getNamedItem('src').value).toBe(testItem.src);
        expect(attributes.getNamedItem('alt').value).toBe(testItem.alt);
      });

      it('should fill the .field-value elements with the correct text', () => {
        component.media = testItem;

        fixture.detectChanges();

        const fieldValues = queryFieldElements('textContent');
        expect(fieldValues.displayName).toBe(MISSING_VALUE_TEXT);
        expect(fieldValues.extension).toBe(MISSING_VALUE_TEXT);
        expect(fieldValues.size).toBe(MISSING_VALUE_TEXT);
        expect(fieldValues.dimensions).toBe(`${testItem.width} x ${testItem.height} px`);
        expect(fieldValues.path).toBe(MISSING_VALUE_TEXT);
        expect(fieldValues.alt).toBe(testItem.alt);
      });

      it('should add the correct title for display name, path and alt', () => {
        component.media = testItem;

        fixture.detectChanges();

        const fieldValues = queryFieldElements('title');
        expect(fieldValues.displayName).toBe('');
        expect(fieldValues.path).toBe('');
        expect(fieldValues.alt).toBe(testItem.alt);
      });
    });
  });
});
