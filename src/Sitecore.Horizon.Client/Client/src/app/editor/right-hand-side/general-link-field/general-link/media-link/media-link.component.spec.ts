/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule, ContainedAccordionModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { MediaValue } from 'app/editor/right-hand-side/image-field/image-field-messaging.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { MediaDialogService } from 'app/shared/dialogs/media-dialog/media-dialog.service';
import { MediaDalService } from 'app/shared/platform-media/media.dal.service';
import { MediaItem } from 'app/shared/platform-media/media.interface';
import { SiteLanguageServiceTestingModule } from 'app/shared/site-language/site-language.service.testing';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EMPTY, of } from 'rxjs';
import { MediaGeneralLink } from '../../general-link.type';
import { MediaLinkComponent } from './media-link.component';

describe(MediaLinkComponent.name, () => {
  const findInput = (name: 'linkText' | 'path' | 'linkTitle' | 'target') => {
    const cssSelector = name === 'target' ? 'ng-spd-checkbox' : `*[name='${name}']`;
    return fixture.debugElement.query(By.css(cssSelector)).nativeElement;
  };
  const dispatchFocusOut = (relatedTarget?: Parameters<typeof findInput>[0] | undefined) => {
    const rootEl = fixture.debugElement.query(By.css('.media-link')).nativeElement;
    rootEl.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: relatedTarget ? findInput(relatedTarget).nativeElement : undefined,
      }),
    );
  };

  const selectedMedia: MediaValue = {
    rawValue: 'rawvalue',
    src: 'src',
    mediaId: 'mediaid',
    alt: 'alt',
    width: 100,
    height: 100,
    embeddedHtml: 'html',
  };

  let sut: MediaLinkComponent;
  let fixture: ComponentFixture<MediaLinkComponent>;

  let mediaDialogService: jasmine.SpyObj<MediaDialogService>;
  let context: ContextServiceTesting;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MediaLinkComponent],
      imports: [
        SiteLanguageServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        InputLabelModule,
        FormsModule,
        CheckboxModule,
        ContainedAccordionModule,
        ContextServiceTestingModule,
      ],
      providers: [
        {
          provide: MediaDialogService,
          useValue: jasmine.createSpyObj<MediaDialogService>(['show']),
        },
        {
          provide: MediaDalService,
          useValue: jasmine.createSpyObj<MediaDalService>({
            getMediaItem: of({
              id: 'id',
              displayName: 'displayName',
              path: '/media/some/path',
              url: '/some/path',
            } as MediaItem),
          }),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    mediaDialogService = TestBedInjectSpy(MediaDialogService);
    mediaDialogService.show.and.returnValue(of(selectedMedia));

    context = TestBed.inject(ContextServiceTesting);
    context.provideDefaultTestContext();

    fixture = TestBed.createComponent(MediaLinkComponent);
    sut = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('WHEN edit link data', () => {
    it('should save null value if link values are empty', () => {
      // arrange
      const linkValue = {
        linktype: 'media',
        text: 'linkTextValue',
        title: undefined,
        className: undefined,
        item: {
          id: '',
          displayName: '',
          url: '',
        },
        target: undefined,
      };
      sut.value = linkValue as MediaGeneralLink;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const linkTextInput = findInput('linkText');

      // act
      linkTextInput.value = '';
      linkTextInput.dispatchEvent(new Event('input'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith(null);
    });

    it('should reflect proper link values', fakeAsync(() => {
      // arrange
      const linkValue = {
        linktype: 'media',
        text: 'linkTextValue',
        title: 'linkTitleValue',
        className: 'linkClassNameValue',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: '_blank',
      };

      // act
      sut.value = linkValue as MediaGeneralLink;
      fixture.detectChanges();
      tick();

      // assert
      expect(findInput('linkText').value).toBe('linkTextValue');
      expect(findInput('linkTitle').value).toBe('linkTitleValue');
      expect(findInput('target').className).toBe('checked');
      flush();
    }));

    it('should show selected item path', fakeAsync(() => {
      // arrange
      const initialValue = {
        linktype: 'media',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'url',
        },
      };

      // act
      sut.value = initialValue as MediaGeneralLink;
      // Setting value triggers a request to get item path
      fixture.detectChanges();
      tick();
      // Apply changes from the request
      fixture.detectChanges();
      tick();

      // assert
      expect(findInput('path').value).toBe('/media/some/path');
      flush();
    }));

    it('should update media item details', fakeAsync(() => {
      // arrange
      const initialValue = {
        linktype: 'media',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'url',
        },
      };

      // act
      sut.value = initialValue as MediaGeneralLink;
      // Setting value triggers a request to get item path
      fixture.detectChanges();
      tick();
      // Apply changes from the request
      fixture.detectChanges();
      tick();

      // assert
      expect(sut.draftLink.item.displayName).toBe('displayName');
      expect(sut.draftLink.item.url).toBe('/some/path');
      expect(sut.draftLink.item.id).toBe('id'); // The id should be same as the request media item id
      flush();
    }));

    it('should emit new link text value', () => {
      // arrange
      sut.value = null;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const input = findInput('linkText');

      // act
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ text: 'new value' }));
    });

    it('should emit new link title value', () => {
      // arrange
      sut.value = null;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const input = findInput('linkTitle');

      // act
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'new value' }));
    });

    it('should emit new target value', () => {
      // arrange
      sut.value = null;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const openInNewWindowCheckbox = findInput('target');

      // act
      openInNewWindowCheckbox.dispatchEvent(new Event('click'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ target: '_blank' }));
    });

    it('should clear link text value if it has whitespace characters only', () => {
      // arrange
      const initialValue: MediaGeneralLink = {
        text: 'initialText',
        title: 'initialTitle',
        class: 'className',
        linktype: 'media',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: undefined,
      };
      sut.value = initialValue;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const input = findInput('linkText');

      // act
      input.value = '     ';
      input.dispatchEvent(new Event('input'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ text: undefined }));
    });

    it('should combine initial value and changes', () => {
      // arrange
      const initialValue: MediaGeneralLink = {
        text: '',
        title: 'title',
        class: 'class',
        linktype: 'media',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: undefined,
      };
      sut.value = initialValue;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);

      // act
      const linkTextInput = findInput('linkText');
      linkTextInput.value = 'link text value';
      linkTextInput.dispatchEvent(new Event('input'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith({
        text: 'link text value',
        title: 'title',
        class: 'class',
        linktype: 'media',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: undefined,
      });
    });

    it('should not emit value if no changes introduced while user focuses among multiple inputs', () => {
      // arrange
      const linkValue = {
        linktype: 'media',
        text: 'linkTextValue',
        title: 'linkTitleValue',
        className: 'linkClassNameValue',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: '_blank',
      };
      sut.value = linkValue as MediaGeneralLink;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);

      // act
      dispatchFocusOut('linkText');
      dispatchFocusOut('linkTitle');

      // assert
      expect(spy.next).not.toHaveBeenCalled();
    });

    it('should emit value only once when changes introduced and user focuses among multiple inputs', () => {
      // arrange
      const linkValue = {
        linktype: 'media',
        text: 'linkTextValue',
        title: 'linkTitleValue',
        className: 'linkClassNameValue',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: '_blank',
      };
      sut.value = linkValue as MediaGeneralLink;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);

      // act
      const input = findInput('linkText');
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      dispatchFocusOut('linkTitle');

      // assert
      expect(spy.next).toHaveBeenCalledTimes(1);
    });
  });

  describe('item in the dialog', () => {
    it('should open item picker dialog', () => {
      // arrange
      const initialValue: MediaGeneralLink = {
        text: '',
        title: 'title',
        class: 'className',
        linktype: 'media',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: undefined,
      };
      sut.value = initialValue;
      const openDialogBtn = fixture.debugElement.query(By.css('button')).nativeElement;

      // act
      openDialogBtn.click();

      // assert
      expect(mediaDialogService.show).toHaveBeenCalledWith({
        currentValue: {
          rawValue: `<image mediaid="${initialValue.item.id}" />`,
          embeddedHtml: '',
          alt: initialValue.title,
          mediaId: initialValue.item.id,
          src: initialValue.item.url,
        },
        sources: [],
        mediaTypes: ['image', 'file'],
      });
    });

    describe('WHEN dialog closes', () => {
      it('should emit current value', fakeAsync(() => {
        // arrange
        const initialValue = {
          item: {
            id: 'id',
            displayName: 'name',
            url: 'url',
          },
        };
        const openDialogBtn = fixture.debugElement.query(By.css('button')).nativeElement;
        const saveValueSpy = jasmine.createSpy();

        // act
        sut.valueChange.subscribe(saveValueSpy);
        sut.value = initialValue as MediaGeneralLink;
        openDialogBtn.click();
        tick();

        // assert
        expect(saveValueSpy).toHaveBeenCalledWith({
          text: 'displayName',
          title: undefined,
          class: undefined,
          linktype: 'media',
          item: {
            id: selectedMedia.mediaId,
            displayName: 'displayName',
            url: '/some/path',
          },
          target: undefined,
        });
        flush();
      }));

      it('should emit Content Hub DAM value if selected', fakeAsync(() => {
        // arrange
        mediaDialogService.show.and.returnValue(
          of({
            ...selectedMedia,
            ...{
              rawValue: 'stylelabs-attr=value',
              damExtraProperties: [
                {
                  name: 'extra-attr',
                  value: 'some extra value',
                },
              ],
              isDam: true,
            },
          }),
        );

        const initialValue = {
          item: {
            id: 'id',
            displayName: 'name',
            url: 'url',
          },
        };
        const openDialogBtn = fixture.debugElement.query(By.css('button')).nativeElement;
        const saveValueSpy = jasmine.createSpy();

        // act
        sut.valueChange.subscribe(saveValueSpy);
        sut.value = initialValue as MediaGeneralLink;
        openDialogBtn.click();
        tick();

        // assert
        expect(saveValueSpy).toHaveBeenCalledWith({
          linktype: 'external',
          url: 'src',
          'extra-attr': 'some extra value',
          text: 'html',
        });
        flush();
      }));

      describe('AND re-open dialog again', () => {
        it('should use result stored after the first time', fakeAsync(() => {
          // arrange
          const initialValue = {
            item: {
              id: 'id',
              displayName: 'name',
              url: 'url',
            },
          };
          const openDialogBtn = fixture.debugElement.query(By.css('button')).nativeElement;

          // act
          sut.value = initialValue as MediaGeneralLink;
          openDialogBtn.click();
          tick();
          openDialogBtn.click();
          tick();

          // assert
          expect(mediaDialogService.show).toHaveBeenCalledWith({
            currentValue: {
              rawValue: `<image mediaid="${selectedMedia.mediaId}" />`,
              embeddedHtml: '',
              alt: '',
              mediaId: selectedMedia.mediaId,
              src: '/some/path',
            },
            sources: [],
            mediaTypes: ['image', 'file'],
          });
          flush();
        }));
      });

      describe('AND new item is not selected', () => {
        it('should not emit current value', fakeAsync(() => {
          // arrange
          const openDialogBtn = fixture.debugElement.query(By.css('button')).nativeElement;
          const saveValueSpy = jasmine.createSpy();

          // act
          mediaDialogService.show.and.returnValue(EMPTY);
          sut.valueChange.subscribe(saveValueSpy);
          openDialogBtn.click();
          tick();

          // assert
          expect(saveValueSpy).not.toHaveBeenCalled();
          flush();
        }));
      });
    });
  });

  describe('WHEN destroys', () => {
    it('should emit current value', fakeAsync(() => {
      // arrange
      const spy = createSpyObserver();
      const valueToSave: MediaGeneralLink = {
        text: undefined,
        title: 'title',
        class: 'className',
        linktype: 'media',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: undefined,
      };
      sut.valueChange.subscribe(spy);
      sut.value = valueToSave;
      const input = findInput('linkText');

      // act
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      sut.ngOnDestroy();
      tick();

      // assert
      expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ text: 'new value' }));
      flush();
    }));
  });
});
