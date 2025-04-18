/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { DroplistModule, ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import {
  dummyLanguages,
  dummyLanguagesWithoutDisplayName,
  dummySites,
} from 'app/shared/site-language/site-language.service.testing';
import { getMockTenants } from 'app/testing/static-configuration-stub';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { SiteLanguageDropdownsComponent, TenantSwitcherInput } from './site-language-dropdowns.component';

const INITIAL_CONTEXT = {
  itemId: 'foo',
  language: 'en',
  siteName: 'website',
};

@Component({
  selector: 'app-does-not-matter',
  template: `
    <app-site-language-dropdowns
      [sites]="sites"
      [languages]="languages"
      [tenants]="tenants"
      (siteChange)="onSiteSelectionChange($event)"
      (languageChange)="onLanguageSelectionChange($event)"
      (tenantChange)="onTenantSelectionChange($event)"
    ></app-site-language-dropdowns>
  `,
})
class TestSwitcherContainerComponent {
  sites: SiteLanguageDropdownsComponent['sites'] = {
    definedSites: dummySites,
    activeSite: dummySites[0],
    collections: [],
  };
  languages: SiteLanguageDropdownsComponent['languages'] = {
    definedLanguages: dummyLanguages,
    activeLanguage: dummyLanguages[0],
  };
  tenants: TenantSwitcherInput | null = { definedTenants: getMockTenants(), activeTenantName: 'Tenant2' };

  onSiteSelectionChange = jasmine.createSpy();
  onLanguageSelectionChange = jasmine.createSpy();
  onTenantSelectionChange = jasmine.createSpy();
}

describe(SiteLanguageDropdownsComponent.name, () => {
  let contextService: ContextServiceTesting;

  function getLanguagesDropDownButton(): DebugElement {
    return fixture.debugElement.query(By.css('#language-switcher-btn'));
  }

  function getSitesDropDownButton(): DebugElement {
    return fixture.debugElement.query(By.css('#site-switcher-btn'));
  }

  function getSiteListOptions(): DebugElement[] {
    return fixture.debugElement.queryAll(By.css('#site-switcher-list button'));
  }
  function getLanguageListOptions(): DebugElement[] {
    return fixture.debugElement.queryAll(By.css('#language-switcher-list button'));
  }
  function getTenantListOptions(): DebugElement[] {
    return fixture.debugElement.queryAll(By.css('#tenant-switcher-list button'));
  }

  let testSwitcherContainerComponent: TestSwitcherContainerComponent;

  let sut: SiteLanguageDropdownsComponent;
  let fixture: ComponentFixture<TestSwitcherContainerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SiteLanguageDropdownsComponent, TestSwitcherContainerComponent],
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        PopoverModule,
        ListModule,
        DroplistModule,
        BrowserAnimationsModule,
        NoopAnimationsModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestSwitcherContainerComponent);
    fixture.detectChanges();

    sut = fixture.debugElement.query(By.directive(SiteLanguageDropdownsComponent)).componentInstance;

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(INITIAL_CONTEXT);

    testSwitcherContainerComponent = fixture.componentInstance;
    testSwitcherContainerComponent.sites = {
      definedSites: dummySites,
      activeSite: dummySites[0],
      collections: [
        {
          id: 'collectionId',
          name: 'Collection 1',
          displayName: 'testCollection',
        },
      ],
    };
  });

  it('should create', async () => {
    expect(sut).toBeTruthy();
  });

  describe('languages', () => {
    it(`should show 'no languages' placeholder`, () => {
      // arrange
      testSwitcherContainerComponent.languages = { definedLanguages: [], activeLanguage: null as any };

      // act
      fixture.detectChanges();

      // assert
      expect(getLanguagesDropDownButton().nativeNode.innerText).toBe('SITE_LANGUAGE.NO_LANGUAGES');
    });

    it('should show list of languages with english display name', () => {
      // act
      getLanguagesDropDownButton().nativeElement.click();
      fixture.detectChanges();

      // assert
      const languages = getLanguageListOptions();
      expect(languages.length).toBe(dummyLanguages.length);
      for (let i = 0; i < dummyLanguages.length; i++) {
        const languageDisplayName = languages[i].nativeNode.innerText;
        expect(languageDisplayName).toBe(dummyLanguages[i].englishName);
      }
    });

    it('should show list of languages without english display name', () => {
      testSwitcherContainerComponent.languages = {
        definedLanguages: dummyLanguagesWithoutDisplayName,
        activeLanguage: dummyLanguagesWithoutDisplayName[0],
      };

      // act
      getLanguagesDropDownButton().nativeElement.click();
      fixture.detectChanges();

      // assert
      const languages = getLanguageListOptions();
      expect(languages.length).toBe(dummyLanguages.length);
      for (let i = 0; i < dummyLanguagesWithoutDisplayName.length; i++) {
        const nativeLanguageName = languages[i].query(By.css('div')).nativeNode.innerText;
        const languageDisplayName = languages[i].nativeNode.innerText;

        expect(nativeLanguageName).toBe(dummyLanguagesWithoutDisplayName[i].nativeName);
        expect(languageDisplayName).toContain(dummyLanguagesWithoutDisplayName[i].displayName);
      }
    });

    it('should emit language change event when new language is selected', () => {
      // act
      getLanguagesDropDownButton().nativeElement.click();
      fixture.detectChanges();
      getLanguageListOptions()[1].nativeElement.click();

      // assert
      expect(testSwitcherContainerComponent.onLanguageSelectionChange).toHaveBeenCalledWith(dummyLanguages[1].name);
    });

    it('should not emit language change event when new selected language is same as before', () => {
      // act
      getLanguagesDropDownButton().nativeElement.click();
      fixture.detectChanges();
      getLanguageListOptions()[0].nativeElement.click();

      // assert
      expect(testSwitcherContainerComponent.onLanguageSelectionChange).not.toHaveBeenCalled();
    });
  });

  describe('sites', () => {
    it(`should show 'no sites' placeholder`, () => {
      // arrange
      testSwitcherContainerComponent.sites = { definedSites: [], activeSite: null as any, collections: [] };

      // act
      fixture.detectChanges();

      // assert
      expect(getSitesDropDownButton().nativeNode.innerText).toBe('SITE_LANGUAGE.NO_SITES');
    });

    it('should show list of sites', () => {
      // act
      getSitesDropDownButton().nativeElement.click();
      fixture.detectChanges();

      // assert
      const sites = getSiteListOptions();
      expect(sites.length).toBe(dummySites.length);
      for (let i = 0; i < dummySites.length; i++) {
        const siteDisplayName = sites[i].nativeNode.innerText;
        expect(siteDisplayName).toBe(dummySites[i].displayName);
      }
    });

    it('should emit site change event when new site is selected', () => {
      // act
      getSitesDropDownButton().nativeElement.click();
      fixture.detectChanges();
      getSiteListOptions()[1].nativeElement.click();

      // assert
      expect(testSwitcherContainerComponent.onSiteSelectionChange).toHaveBeenCalledWith(dummySites[1].name);
    });

    it('should not emit site change event when new selected site is same as before', () => {
      // act
      getSitesDropDownButton().nativeElement.click();
      fixture.detectChanges();
      getSiteListOptions()[0].nativeElement.click();

      // assert
      expect(testSwitcherContainerComponent.onSiteSelectionChange).not.toHaveBeenCalled();
    });
  });

  describe('tenants', () => {
    it(`should not show tenants list if it is not provided`, () => {
      // arrange
      testSwitcherContainerComponent.tenants = { definedTenants: [], activeTenantName: 'no tenants' };

      getSitesDropDownButton().nativeElement.click();
      fixture.detectChanges();

      // assert
      expect(getTenantListOptions().length).toBe(0);
    });

    it('should show list of tenants', () => {
      // act
      getSitesDropDownButton().nativeElement.click();
      fixture.detectChanges();

      // assert
      const tenants = getTenantListOptions();
      expect(tenants.length).toBe(getMockTenants().length); // Account on
      for (let i = 0; i < getMockTenants().length; i++) {
        const tenantDisplayName = tenants[i].nativeNode.innerText;
        expect(tenantDisplayName).toBe(getMockTenants()[i].displayName);
      }

      expect(tenants[1].classes['select']).toBeTruthy();
    });

    it('should emit tenant change event when new site is selected', () => {
      // act
      getSitesDropDownButton().nativeElement.click();
      fixture.detectChanges();
      getTenantListOptions()[0].nativeElement.click();

      // assert
      expect(testSwitcherContainerComponent.onTenantSelectionChange).toHaveBeenCalledWith(getMockTenants()[0].name);
    });

    it('should not emit tenant change event when new selected tenant is same as before', () => {
      // act
      getSitesDropDownButton().nativeElement.click();
      fixture.detectChanges();
      getTenantListOptions()[1].nativeElement.click();

      // assert
      expect(testSwitcherContainerComponent.onTenantSelectionChange).not.toHaveBeenCalled();
    });
  });
});
