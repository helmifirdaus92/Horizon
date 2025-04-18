/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { AuthenticationService } from 'app/authentication/authentication.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import {
  dummyLanguages,
  dummySelectedLanguage,
  dummySelectedSite,
  dummySites,
  LanguageServiceStub,
  SiteLanguageServiceTestingModule,
  SiteServiceStub,
} from 'app/shared/site-language/site-language.service.testing';
import { getMockTenants, StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { TenantSwitcherInput } from './site-language-dropdowns/site-language-dropdowns.component';
import { SiteLanguageSwitcherComponent } from './site-language-switcher.component';
import {
  Language,
  LanguageSwitcherService,
  SiteInSwitcher,
  SiteSwitcherService,
} from './site-language-switcher.service';

@Component({
  selector: 'app-site-language-dropdowns',
  template: '',
})
class TestSiteLanguageDropDownComponent {
  @Input() sites: { definedSites: SiteInSwitcher[]; activeSite: SiteInSwitcher } | null = null;
  @Input() languages: { definedLanguages: Language[]; activeLanguage: Language } | null = null;
  @Input() tenants: TenantSwitcherInput | null = null;

  @Output() siteChange = new EventEmitter<string | null>();
  @Output() languageChange = new EventEmitter<string | null>();
  @Output() tenantChange = new EventEmitter<string | null>();
  notifySiteSelection(siteName: string | null) {
    this.siteChange.emit(siteName);
  }
  notifyLanguageSelection(LanguageName: string | null) {
    this.languageChange.emit(LanguageName);
  }
  notifyTenantSelection(name: string | null) {
    this.tenantChange.emit(name);
  }
}

describe(SiteLanguageSwitcherComponent.name, () => {
  let sut: SiteLanguageSwitcherComponent;
  let fixture: ComponentFixture<SiteLanguageSwitcherComponent>;

  let siteSwitcherServiceSpy: jasmine.SpyObj<SiteSwitcherService>;
  let languageSwitcherSpy: jasmine.SpyObj<LanguageSwitcherService>;
  let authenticationServiceSpy: jasmine.SpyObj<AuthenticationService>;
  let siteService: SiteServiceStub;
  let languageService: LanguageServiceStub;
  let siteLangDropDownComponent: TestSiteLanguageDropDownComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SiteLanguageSwitcherComponent, TestSiteLanguageDropDownComponent],
      imports: [
        SiteLanguageServiceTestingModule,
        TranslateModule,
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        StaticConfigurationServiceStubModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: SiteSwitcherService,
          useValue: jasmine.createSpyObj<SiteSwitcherService>(
            {
              selectSite: undefined,
            },
            {
              site: of(dummySelectedSite),
            },
          ),
        },
        {
          provide: LanguageSwitcherService,
          useValue: jasmine.createSpyObj<LanguageSwitcherService>(
            {
              selectLanguage: undefined,
            },
            {
              language: of(dummySelectedLanguage),
            },
          ),
        },
        {
          provide: AuthenticationService,
          useValue: jasmine.createSpyObj<AuthenticationService>(['changeAuthParams']),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>({
            isFeatureEnabled: true,
          }),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    siteSwitcherServiceSpy = TestBedInjectSpy(SiteSwitcherService);
    languageSwitcherSpy = TestBedInjectSpy(LanguageSwitcherService);
    authenticationServiceSpy = TestBedInjectSpy(AuthenticationService);

    siteService = TestBed.inject(SiteServiceStub);
    languageService = TestBed.inject(LanguageServiceStub);

    ConfigurationService.tenants = getMockTenants();
    ConfigurationService.tenantName = getMockTenants()[1].name;
    ConfigurationService.organization = 'test-org';

    fixture = TestBed.createComponent(SiteLanguageSwitcherComponent);
    sut = fixture.componentInstance;

    fixture.detectChanges();

    siteLangDropDownComponent = fixture.debugElement.query(
      By.directive(TestSiteLanguageDropDownComponent),
    ).componentInstance;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('provide defined and active sites and languages', () => {
    it('should provide defined sites alongside with active site', () => {
      expect(siteLangDropDownComponent.sites?.definedSites).toEqual(dummySites);
      expect(siteLangDropDownComponent.sites?.activeSite.name).toEqual(dummySelectedSite);
    });

    it('should provide defined languages alongside with active language', () => {
      expect(siteLangDropDownComponent.languages?.definedLanguages).toEqual(dummyLanguages);
      expect(siteLangDropDownComponent.languages?.activeLanguage.name).toEqual(dummySelectedLanguage);
    });

    it('should provide defined tenants alongside with active tenant', () => {
      expect(siteLangDropDownComponent.tenants?.definedTenants).toEqual(getMockTenants());
      expect(siteLangDropDownComponent.tenants?.activeTenantName).toEqual(getMockTenants()[1].name);
    });
  });

  describe('notify site and language select', () => {
    it(`should notify ${SiteSwitcherService.name} to select new site`, () => {
      const newSite = 'siteAbcdef';
      siteLangDropDownComponent.notifySiteSelection(newSite);

      expect(siteSwitcherServiceSpy.selectSite).toHaveBeenCalledWith(newSite);
    });

    it(`should not notify ${SiteSwitcherService.name} to select new site if provided site is null`, () => {
      siteLangDropDownComponent.notifySiteSelection(null);

      expect(siteSwitcherServiceSpy.selectSite).not.toHaveBeenCalled();
    });

    it(`should notify ${LanguageSwitcherService.name} to select new language`, () => {
      const newLanguage = 'LanguageAbcdef';
      siteLangDropDownComponent.notifyLanguageSelection(newLanguage);

      expect(languageSwitcherSpy.selectLanguage).toHaveBeenCalledWith(newLanguage);
    });

    it(`should not notify ${LanguageSwitcherService.name} to select new language if provided language is null`, () => {
      siteLangDropDownComponent.notifySiteSelection(null);

      expect(languageSwitcherSpy.selectLanguage).not.toHaveBeenCalled();
    });

    it(`should notify ${AuthenticationService.name} to select new tenant`, () => {
      const newTenantName = 'TenantAbcdef';
      siteLangDropDownComponent.notifyTenantSelection(newTenantName);

      expect(authenticationServiceSpy.changeAuthParams).toHaveBeenCalledWith({
        organization: null,
        tenantName: newTenantName,
      });
    });

    it(`should not notify ${AuthenticationService.name} to select new tenant if provided tenant is invalid`, () => {
      siteLangDropDownComponent.notifyTenantSelection(null);

      expect(authenticationServiceSpy.changeAuthParams).not.toHaveBeenCalled();
    });
  });
});
