/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { SiteSwitcherService } from 'app/editor/shared/site-language-switcher/site-language-switcher.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { CmUrlTestingModule } from 'app/shared/pipes/platform-url/cm-url.module.testing';
import {
  SiteLanguageServiceTestingModule,
  dummySelectedSite,
} from 'app/shared/site-language/site-language.service.testing';
import { AssetsPipeMockModule } from 'app/testing/assets-pipe-mock.module';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { ApplicationLinksComponent } from './application-links.component';

describe(ApplicationLinksComponent.name, () => {
  let sut: ApplicationLinksComponent;
  let fixture: ComponentFixture<ApplicationLinksComponent>;

  const getLaunchpadIconEl = () => fixture.debugElement.query(By.css('a'));

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationLinksComponent],
      imports: [
        CommonModule,
        AssetsPipeMockModule,
        TranslateServiceStubModule,
        TranslateModule,
        CmUrlTestingModule,
        StaticConfigurationServiceStubModule,
        SiteLanguageServiceTestingModule,
      ],
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
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationLinksComponent);
    sut = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeDefined();
  });

  describe('Launchpad icon link', () => {
    it('should link to XM apps dashboard in Prod mode', () => {
      sut.isDevMode = false;
      fixture.detectChanges();

      expect(getLaunchpadIconEl().attributes.href).toContain('?tab=sites&tenantName');
    });

    it('should link to Local XM instance in Dev mode', () => {
      sut.isDevMode = true;
      fixture.detectChanges();

      expect(getLaunchpadIconEl().attributes.href).toContain('sitecore/shell/sitecore/client/Applications/Launchpad');
    });
  });

  describe('Pocket Navigation', () => {
    it('should hide pocket navigation if tenantName is missing', () => {
      ConfigurationService.tenantName = '';
      sut.ngOnInit();
      fixture.detectChanges();

      expect(sut.pocketNavigation.isEnabledAndValid).toBeFalse();
    });

    it('should hide pocket navigation if organization is missing', () => {
      ConfigurationService.organization = '';
      sut.ngOnInit();
      fixture.detectChanges();

      expect(sut.pocketNavigation.isEnabledAndValid).toBeFalse();
    });
  });
});
