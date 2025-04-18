/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule, DialogCloseHandle, DialogModule } from '@sitecore/ng-spd-lib';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { BaseItemDalService, RawItem } from 'app/shared/graphql/item.dal.service';
import { Language, Site } from 'app/shared/site-language/site-language.service';
import {
  dummyLanguages,
  dummySites,
  SiteLanguageServiceTestingModule,
} from 'app/shared/site-language/site-language.service.testing';
import { RecreateOnChangeModule } from 'app/shared/utils/recreate-on-change/recreate-on-change.module';
import { DialogCloseHandleStubModule } from 'app/testing/dialog-close-handle-stub.module';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { ContentItemDialogComponent } from './content-item-dialog.component';

@Component({
  selector: 'app-site-language-dropdowns',
  template: ``,
})
class SiteLanguageTestComponent {
  @Input() sites: { definedSites: Site[]; activeSite: Site } | null = null;
  @Input() languages: { definedLanguages: Language[]; activeLanguage: Language } | null = null;
  @Output() siteChange = new EventEmitter<string | null>();
  @Output() languageChange = new EventEmitter<string | null>();
}

@Component({
  selector: 'app-item-picker',
  template: ``,
})
class ItemPickerTestComponent {
  @Input() itemId: string | null = null;
  @Input() language = '';
  @Input() site = '';
  @Output() selectChange = new EventEmitter<string>();
}
@Component({
  selector: 'app-page-picker',
  template: ``,
})
class PagePickerTestComponent {
  @Input() usePageNames: boolean;
  @Input() site = '';
  @Output() selectItem = new EventEmitter<string>();
}

describe(ContentItemDialogComponent.name, () => {
  let sut: ContentItemDialogComponent;
  let fixture: ComponentFixture<ContentItemDialogComponent>;
  let de: DebugElement;

  let itemPicker: ItemPickerTestComponent;
  let switcher: SiteLanguageTestComponent;
  let closeHandle: DialogCloseHandle;
  let itemDalService: jasmine.SpyObj<BaseItemDalService>;

  let contextService: ContextServiceTesting;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SiteLanguageServiceTestingModule,
        ContextServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        DialogModule,
        DialogCloseHandleStubModule,
        ButtonModule,
        RecreateOnChangeModule,
      ],
      providers: [
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>({
            getRawItem: of({
              id: 'id',
              displayName: 'displayName',
              path: '/content/some/path',
              url: '/some/path',
            } as RawItem),
            getItemState: of({} as any),
            getItem: of({} as any),
          }),
        },
      ],
      declarations: [
        ContentItemDialogComponent,
        SiteLanguageTestComponent,
        ItemPickerTestComponent,
        PagePickerTestComponent,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentItemDialogComponent);
    fixture.detectChanges();

    sut = fixture.componentInstance;
    de = fixture.debugElement;

    closeHandle = de.injector.get<DialogCloseHandle>(DialogCloseHandle);
    itemPicker = de.query(By.directive(ItemPickerTestComponent)).componentInstance;
    switcher = de.query(By.directive(SiteLanguageTestComponent)).componentInstance;

    contextService = TestBed.inject(ContextServiceTesting);
    itemDalService = TestBedInjectSpy(BaseItemDalService);
    contextService.provideDefaultTestContext();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('close', () => {
    it(`should close dialog and complete onSelect emitter subscribtions`, () => {
      // arrange
      const onSelectSpy = createSpyObserver();
      const closeHanlderSpy = spyOn(closeHandle, 'close');

      sut.onSelect.subscribe(onSelectSpy);

      // act
      sut.close();

      // assert
      expect(onSelectSpy.complete).toHaveBeenCalled();
      expect(closeHanlderSpy).toHaveBeenCalled();
    });

    describe(`WHEN 'X' is clicked'`, () => {
      it('should call close()', () => {
        const spy = spyOn(sut, 'close');
        const button = de.query(By.css('ng-spd-dialog-close-button button'));

        button.triggerEventHandler('click', null);

        expect(spy).toHaveBeenCalled();
      });
    });

    describe('when `Cancel` is clicked', () => {
      it('should call close()', () => {
        const spy = spyOn(sut, 'close');
        const button = de.query(By.css('ng-spd-dialog-actions button:not(.primary)'));

        button.triggerEventHandler('click', null);

        expect(spy).toHaveBeenCalled();
      });
    });

    describe('WHEN type "Escape"', () => {
      it('should close', () => {
        const preventSpy = jasmine.createSpy();
        const spy = spyOn(sut, 'close');
        const event = { preventDefault: preventSpy, code: 'Escape' } as any;

        sut.onKeydownHandler(event);

        expect(preventSpy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('submit', () => {
    describe('disable submit button', () => {
      describe('WHEN item is NOT selected', () => {
        it('should disable', () => {
          const submitbutton = de.query(By.css('ng-spd-dialog-actions button.primary'));

          expect(submitbutton.attributes['disabled']).toBeDefined();
        });
      });

      describe('WHEN item is selected', () => {
        it('should enable', () => {
          // act
          sut.selection = { id: 'new selection', site: 'new site', language: 'new language' };
          fixture.detectChanges();

          // assert
          const submitbutton = de.query(By.css('ng-spd-dialog-actions button.primary'));
          expect(submitbutton.attributes['disabled']).toBeUndefined();
        });
      });

      describe(`WHEN there's initial selection`, () => {
        it('should disable', () => {
          // act
          sut.selection = { id: 'new selection', site: 'new site', language: 'new language' };
          sut.ngOnInit();
          fixture.detectChanges();

          // assert
          const submitbutton = de.query(By.css('ng-spd-dialog-actions button.primary'));
          expect(submitbutton.attributes['disabled']).toBeDefined();
        });

        describe('AND new item selected', () => {
          it('should enable', () => {
            // arrange
            // Initial selection
            sut.selection = { id: 'selection', site: dummySites[0].name, language: dummyLanguages[0].name };
            sut.ngOnInit();
            fixture.detectChanges();

            // act
            // New selection
            sut.selection = { id: 'new selection', site: 'new site', language: 'new language' };
            fixture.detectChanges();

            // assert
            const submitbutton = de.query(By.css('ng-spd-dialog-actions button.primary'));
            expect(submitbutton.attributes['disabled']).toBeUndefined();
          });
        });

        describe('AND the same item selected', () => {
          it('should enable', () => {
            // arrange
            // Initial selection
            sut.selection = { id: 'selection', site: dummySites[0].name, language: dummyLanguages[0].name };
            sut.ngOnInit();
            fixture.detectChanges();

            // act
            // New selection
            sut.selection = { id: 'selection', site: dummySites[0].name, language: dummyLanguages[0].name };
            fixture.detectChanges();

            // assert
            const submitbutton = de.query(By.css('ng-spd-dialog-actions button.primary'));
            expect(submitbutton.attributes['disabled']).toBeDefined();
          });
        });
      });
    });

    describe('WHEN submit button is clicked', () => {
      it('should emit content item result', async () => {
        // arrange
        itemDalService.getRawItem.and.returnValue(
          of({ url: '/test/itemUrl', displayName: 'Test', path: 'testPath001' } as RawItem),
        );
        const onSelectSpy = createSpyObserver();
        sut.onSelect.subscribe(onSelectSpy);

        // act
        sut.selection = { id: 'new selection', site: 'new site', language: 'new language' };
        fixture.detectChanges();

        const submitbutton = de.query(By.css('ng-spd-dialog-actions button.primary')).nativeElement;
        submitbutton.click();
        await fixture.whenStable();

        // assert
        expect(onSelectSpy.next).toHaveBeenCalledWith({
          id: 'new selection',
          path: 'testPath001',
          language: 'new language',
          site: 'new site',
          displayName: 'Test',
          url: '/test/itemUrl',
        });
      });
    });
  });

  describe('site and language switcher', () => {
    it('should pass initial values', () => {
      // act
      sut.selection = { id: 'selection', site: dummySites[0].name, language: dummyLanguages[0].name };
      fixture.detectChanges();

      // assert
      expect(switcher.languages?.definedLanguages.length).toBe(dummyLanguages.length + 1); // + 1 => context language stub
      expect(switcher.languages?.definedLanguages).toEqual(jasmine.arrayContaining(dummyLanguages));
      expect(switcher.languages?.activeLanguage).toEqual(dummyLanguages[0]);
      expect(switcher.sites?.definedSites.length).toBe(dummySites.length + 1); // + 1 => context site stub
      expect(switcher.sites?.definedSites).toEqual(jasmine.arrayContaining(dummySites));
      expect(switcher.sites?.activeSite).toEqual(dummySites[0]);
    });

    describe('WHEN site changes', () => {
      it('should hold current value', () => {
        // act
        sut.selection = { id: 'selection', site: 'site', language: 'language' };
        switcher.siteChange.emit('new site');
        fixture.detectChanges();

        // assert
        expect(sut.site).toBe('new site');
      });

      it('should enable submit button only when selected item belongs to the selected site', () => {
        // act
        sut.selection = { id: 'selection', site: 'site', language: 'language' };
        const submitbutton = de.query(By.css('ng-spd-dialog-actions button.primary'));

        switcher.siteChange.emit('new site');
        fixture.detectChanges();
        expect(submitbutton.attributes['disabled']).toBe('');

        switcher.siteChange.emit('site');
        fixture.detectChanges();
        expect(submitbutton.attributes['disabled']).toBeUndefined();
      });

      it('should pass new value to itemPicker', () => {
        // act
        sut.selection = { id: 'selection', site: 'site', language: 'language' };
        switcher.siteChange.emit('new site');
        fixture.detectChanges();

        // assert
        expect(itemPicker.site).toBe('new site');
      });
    });

    describe('WHEN language changes', () => {
      it('should hold current value', () => {
        // act
        sut.selection = { id: 'selection', site: 'site', language: 'language' };
        switcher.languageChange.emit('new language');
        fixture.detectChanges();

        // assert
        expect(sut.selection.language).toBe('new language');
      });

      it('should enable submit button', () => {
        // act
        sut.selection = { id: 'selection', site: 'site', language: 'language' };
        switcher.languageChange.emit('new language');
        fixture.detectChanges();

        // assert
        const submitbutton = de.query(By.css('ng-spd-dialog-actions button.primary'));
        expect(submitbutton.attributes['disabled']).toBeUndefined();
      });

      it('should pass new value to itemPicker', () => {
        // act
        sut.selection = { id: 'selection', site: 'site', language: 'language' };
        switcher.languageChange.emit('new language');
        fixture.detectChanges();

        // assert
        expect(itemPicker.language).toBe('new language');
      });
    });
  });

  describe('item picker', () => {
    it('should pass initial values', () => {
      // act
      sut.selection = { id: 'selection', site: 'site', language: 'language' };
      fixture.detectChanges();

      // assert
      expect(itemPicker.itemId).toBe('selection');
      expect(itemPicker.site).toBe('site');
      expect(itemPicker.language).toBe('language');
    });

    describe('WHEN selection changes', () => {
      it('should hold current value', () => {
        // act
        sut.selection = { id: 'selection', site: 'site', language: 'language' };
        itemPicker.selectChange.emit('new selection');
        fixture.detectChanges();

        // assert
        expect(sut.selection.id).toBe('new selection');
      });

      it('should enable submit button', () => {
        // act
        sut.selection = { id: 'selection', site: 'site', language: 'language' };
        itemPicker.selectChange.emit('new selection');
        fixture.detectChanges();

        // assert
        const submitbutton = de.query(By.css('ng-spd-dialog-actions button.primary'));
        expect(submitbutton.attributes['disabled']).toBeUndefined();
      });
    });
  });
});
