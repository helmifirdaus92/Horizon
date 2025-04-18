/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { CheckboxModule, ContainedAccordionModule, InputLabelModule } from '@sitecore/ng-spd-lib';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ContentItemDialogService } from 'app/shared/dialogs/content-item-dialog/content-item-dialog.service';
import { BaseItemDalService, RawItem } from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { SiteLanguageServiceTestingModule } from 'app/shared/site-language/site-language.service.testing';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EMPTY, of } from 'rxjs';
import { InternalGeneralLink } from '../../general-link.type';
import { InternalLinkComponent } from './internal-link.component';

describe(InternalLinkComponent.name, () => {
  const findInput = (name: 'linkText' | 'path' | 'linkTitle' | 'linkQuerystring' | 'linkAnchor' | 'target') => {
    const cssSelector = name === 'target' ? 'ng-spd-checkbox' : `*[name='${name}']`;
    return fixture.debugElement.query(By.css(cssSelector)).nativeElement;
  };
  const dispatchFocusOut = (relatedTarget?: Parameters<typeof findInput>[0] | undefined) => {
    const rootEl = fixture.debugElement.query(By.css('.internal-link')).nativeElement;
    rootEl.dispatchEvent(
      new FocusEvent('focusout', {
        bubbles: true,
        relatedTarget: relatedTarget ? findInput(relatedTarget).nativeElement : undefined,
      }),
    );
  };

  let sut: InternalLinkComponent;
  let fixture: ComponentFixture<InternalLinkComponent>;

  let contentItemDialogService: jasmine.SpyObj<ContentItemDialogService>;
  let context: ContextServiceTesting;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InternalLinkComponent],
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
          provide: ContentItemDialogService,
          useValue: jasmine.createSpyObj<ContentItemDialogService>(['show']),
        },
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>({
            getRawItem: of({
              id: 'id',
              displayName: 'displayName',
              path: '/content/some/path',
              url: '/some/path',
            } as RawItem),
            getItemState: of({} as Item),
            getItem: of({} as Item),
          }),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    contentItemDialogService = TestBedInjectSpy(ContentItemDialogService);
    contentItemDialogService.show.and.returnValue(
      of({
        id: 'new id',
        path: 'path001',
        site: 'new site',
        language: 'new language',
        url: 'url001',
        displayName: 'dName001',
      }),
    );

    context = TestBed.inject(ContextServiceTesting);
    context.provideDefaultTestContext();

    fixture = TestBed.createComponent(InternalLinkComponent);
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
        linktype: 'internal',
        text: 'linkTextValue',
        title: undefined,
        className: undefined,
        item: {
          id: '',
          displayName: '',
          url: '',
        },
        target: undefined,
        anchor: undefined,
        querystring: undefined,
      };
      sut.value = linkValue as InternalGeneralLink;
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
        linktype: 'internal',
        text: 'linkTextValue',
        title: 'linkTitleValue',
        className: 'linkClassNameValue',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: '_blank',
        anchor: 'linkAnchorValue',
        querystring: 'linkQuerystringValue',
      };

      // act
      sut.value = linkValue as InternalGeneralLink;
      fixture.detectChanges();
      tick();

      // assert
      expect(findInput('linkText').value).toBe('linkTextValue');
      expect(findInput('linkTitle').value).toBe('linkTitleValue');
      expect(findInput('linkQuerystring').value).toBe('linkQuerystringValue');
      expect(findInput('linkAnchor').value).toBe('linkAnchorValue');
      expect(findInput('target').className).toBe('checked');
      flush();
    }));

    it('should show selected item path', fakeAsync(() => {
      // arrange
      const initialValue = {
        linktype: 'internal',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'url',
        },
      };

      // act
      sut.value = initialValue as InternalGeneralLink;
      // Setting value triggers a request to get item path
      fixture.detectChanges();
      tick();
      // Apply changes from the request
      fixture.detectChanges();
      tick();

      // assert
      expect(findInput('path').value).toBe('/content/some/path');
      flush();
    }));

    it('should update item details', fakeAsync(() => {
      // arrange
      const initialValue = {
        linktype: 'internal',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'url',
        },
      };

      // act
      sut.value = initialValue as InternalGeneralLink;
      // Setting value triggers a request to get item path
      fixture.detectChanges();
      tick();
      // Apply changes from the request
      fixture.detectChanges();
      tick();

      // assert
      expect(sut.draftLink.item.displayName).toBe('displayName');
      expect(sut.draftLink.item.url).toBe('/some/path');
      expect(sut.draftLink.item.id).toBe('id');
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

    it('should emit new link query string value', () => {
      // arrange
      sut.value = null;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const input = findInput('linkQuerystring');

      // act
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ querystring: 'new value' }));
    });

    it('should emit new link anchor value', () => {
      // arrange
      sut.value = null;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);
      const input = findInput('linkAnchor');

      // act
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      dispatchFocusOut();

      // assert
      expect(spy.next).toHaveBeenCalledWith(jasmine.objectContaining({ anchor: 'new value' }));
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
      const initialValue: InternalGeneralLink = {
        text: 'initialText',
        title: 'initialTitle',
        class: 'className',
        linktype: 'internal',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: undefined,
        anchor: undefined,
        querystring: undefined,
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
      const initialValue: InternalGeneralLink = {
        text: '',
        title: 'title',
        class: 'class',
        linktype: 'internal',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: undefined,
        anchor: 'anchor',
        querystring: 'querystring',
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
        linktype: 'internal',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: undefined,
        anchor: 'anchor',
        querystring: 'querystring',
      });
    });

    it('should not emit value if no changes introduced while user focuses among multiple inputs', () => {
      // arrange
      const linkValue = {
        linktype: 'internal',
        text: 'linkTextValue',
        title: 'linkTitleValue',
        className: 'linkClassNameValue',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: '_blank',
        anchor: 'linkAnchorValue',
        querystring: 'linkQuerystringValue',
      };
      sut.value = linkValue as InternalGeneralLink;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);

      // act
      dispatchFocusOut('linkText');
      dispatchFocusOut('linkTitle');
      dispatchFocusOut('linkQuerystring');
      dispatchFocusOut('linkAnchor');

      // assert
      expect(spy.next).not.toHaveBeenCalled();
    });

    it('should emit value only once when changes introduced and user focuses among multiple inputs', () => {
      // arrange
      const linkValue = {
        linktype: 'internal',
        text: 'linkTextValue',
        title: 'linkTitleValue',
        className: 'linkClassNameValue',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: '_blank',
        anchor: 'linkAnchorValue',
        querystring: 'linkQuerystringValue',
      };
      sut.value = linkValue as InternalGeneralLink;
      fixture.detectChanges();
      const spy = createSpyObserver();
      sut.valueChange.subscribe(spy);

      // act
      const input = findInput('linkText');
      input.value = 'new value';
      input.dispatchEvent(new Event('input'));
      dispatchFocusOut('linkTitle');
      dispatchFocusOut('linkQuerystring');
      dispatchFocusOut('linkAnchor');

      // assert
      expect(spy.next).toHaveBeenCalledTimes(1);
    });
  });

  describe('item in the dialog', () => {
    it('should open item picker dialog', () => {
      // arrange
      const initialValue: InternalGeneralLink = {
        text: '',
        title: 'title',
        class: 'className',
        linktype: 'internal',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: undefined,
        anchor: 'anchor',
        querystring: 'sc_site=site&sc_lang=language',
      };
      sut.value = initialValue;
      const openDialogBtn = fixture.debugElement.query(By.css('button')).nativeElement;

      // act
      openDialogBtn.click();

      // assert
      expect(contentItemDialogService.show).toHaveBeenCalledWith({
        id: initialValue.item?.id || '',
        language: 'language',
        site: 'site',
        showPagesOnly: true,
      });
    });

    it('should pass sc_site query string param from item URL to item picker dialog when present', () => {
      // arrange
      const initialValue: InternalGeneralLink = {
        text: '',
        title: 'title',
        class: 'className',
        linktype: 'internal',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path?sc_site=site1',
        },
        target: undefined,
        anchor: 'anchor',
        querystring: 'sc_lang=language',
      };
      sut.value = initialValue;
      const openDialogBtn = fixture.debugElement.query(By.css('button')).nativeElement;

      // act
      openDialogBtn.click();

      // assert
      expect(contentItemDialogService.show).toHaveBeenCalledWith({
        id: initialValue.item?.id || '',
        language: 'language',
        site: 'site1',
        showPagesOnly: true,
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
        sut.value = initialValue as InternalGeneralLink;
        openDialogBtn.click();
        tick();

        // assert
        expect(saveValueSpy).toHaveBeenCalledWith({
          text: undefined,
          title: undefined,
          class: undefined,
          linktype: 'internal',
          item: {
            id: 'new id',
            displayName: 'dName001',
            url: 'url001',
          },
          target: undefined,
          anchor: undefined,
          querystring: 'sc_lang=new+language&sc_site=new+site',
        });
        flush();
      }));

      it('should exclude sc_site param from querystring when item URL already contains sc_site param', fakeAsync(() => {
        contentItemDialogService.show.and.returnValue(
          of({
            id: 'id',
            path: 'path001',
            site: 'new site',
            language: 'new language',
            url: '/some/path?&sc_site=new+site',
            displayName: 'displayName',
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
        sut.value = initialValue as InternalGeneralLink;
        openDialogBtn.click();
        tick();

        // assert
        expect(saveValueSpy).toHaveBeenCalledWith({
          text: undefined,
          title: undefined,
          class: undefined,
          linktype: 'internal',
          item: {
            id: 'id',
            displayName: 'displayName',
            url: '/some/path?&sc_site=new+site',
          },
          target: undefined,
          anchor: undefined,
          querystring: 'sc_lang=new+language',
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
          sut.value = initialValue as InternalGeneralLink;
          openDialogBtn.click();
          tick();
          openDialogBtn.click();
          tick();

          // assert
          expect(contentItemDialogService.show).toHaveBeenCalledWith({
            id: 'new id',
            site: 'new site',
            language: 'new language',
            showPagesOnly: true,
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
          contentItemDialogService.show.and.returnValue(EMPTY);
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
      const valueToSave: InternalGeneralLink = {
        text: undefined,
        title: 'title',
        class: 'className',
        linktype: 'internal',
        item: {
          id: 'id',
          displayName: 'name',
          url: 'path',
        },
        target: undefined,
        anchor: 'anchor',
        querystring: undefined,
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
