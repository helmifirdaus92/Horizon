/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ListModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { getLocalStorageMock } from 'app/testing/local-storage-mock';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ExtensionLibComponent, MarketplaceAppsLocalStorageKey, MkpApplicationConfig } from './extension-lib.component';

describe(ExtensionLibComponent.name, () => {
  let component: ExtensionLibComponent;
  let fixture: ComponentFixture<ExtensionLibComponent>;
  const localStorage = window.localStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        ListModule,
        PopoverModule,
        TranslateServiceStubModule,
        TranslateModule,
        BrowserAnimationsModule,
        A11yModule,
      ],
      declarations: [ExtensionLibComponent],
      providers: [
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>({ isFeatureEnabled: true }),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExtensionLibComponent);
    component = fixture.componentInstance;

    Object.defineProperty(window, 'localStorage', {
      value: getLocalStorageMock(),
    });
  });

  afterEach(async () => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorage,
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('localStorage', () => {
    it('should read extensions from localStorage', async () => {
      const extensions = [
        {
          application: {
            id: '000',
            name: 'angular',
            type: 'extension',
            url: 'url001',
            iconUrl: 'iconUrl001',
          },
        },
        {
          application: {
            id: '111',
            name: 'stackoverflow',
            type: 'extension',
            url: 'url002',
            iconUrl: 'iconUrl002',
          },
        },
      ] as MkpApplicationConfig[];
      window.localStorage.setItem(MarketplaceAppsLocalStorageKey, JSON.stringify(extensions));

      component.ngOnInit();
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.css('#pluginsBtn')).nativeElement as HTMLButtonElement;
      button.click();

      const entities = fixture.debugElement.queryAll(By.css('button.list-option'));
      expect(entities.length).toBe(2);
      expect((entities[0].nativeElement as HTMLButtonElement).textContent?.trim()).toBe('angular');
      expect((entities[1].nativeElement as HTMLButtonElement).textContent?.trim()).toBe('stackoverflow');
    });
  });
});
