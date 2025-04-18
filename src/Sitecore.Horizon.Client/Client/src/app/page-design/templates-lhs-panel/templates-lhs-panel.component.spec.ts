/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component, NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';

import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TemplateNavigationItem, TemplatesLhsPanelComponent } from './templates-lhs-panel.component';

@Component({
  template: '',
})
class DummyComponent {}

const testRoutes: Routes = [
  { path: 'item1', component: DummyComponent },
  { path: 'item2', component: DummyComponent },
  { path: 'item3', component: DummyComponent },
];

describe(TemplatesLhsPanelComponent.name, () => {
  let sut: TemplatesLhsPanelComponent;
  let fixture: ComponentFixture<TemplatesLhsPanelComponent>;
  let router: Router;
  let ngZone: NgZone;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;

  const mockItems: TemplateNavigationItem[] = [
    { label: 'Item-1', routerLink: '/item1', icon: 'item1-icon', testid: 'test' },
    { label: 'Item-2', routerLink: '/item2', icon: 'item2-icon', testid: 'test' },
    { label: 'Item-3', routerLink: '/item3', icon: 'item3-icon', testid: 'test' },
  ];

  const panelContentNavItems = () => fixture.debugElement.queryAll(By.css('.panel-content .links'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, TranslateModule, TranslateServiceStubModule, RouterTestingModule.withRoutes(testRoutes)],
      declarations: [TemplatesLhsPanelComponent],
      providers: [
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>('FeatureFlagsService', ['isFeatureEnabled']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TemplatesLhsPanelComponent);
    router = TestBed.inject(Router);
    ngZone = TestBed.inject(NgZone);

    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);

    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should render navigation items with correct labels and icons', () => {
    sut.createDesignNavigationItem = mockItems;
    fixture.detectChanges();

    const panelList = panelContentNavItems();

    expect(panelList.length).toBe(3);
    expect(panelList[0].nativeElement.textContent).toBe('Item-1');
    expect(panelList[0].query(By.css('i')).nativeElement.classList).toContain('mdi-item1-icon');
    expect(panelList[1].nativeElement.textContent).toBe('Item-2');
    expect(panelList[1].query(By.css('i')).nativeElement.classList).toContain('mdi-item2-icon');
    expect(panelList[2].nativeElement.textContent).toBe('Item-3');
    expect(panelList[2].query(By.css('i')).nativeElement.classList).toContain('mdi-item3-icon');
  });

  it('should navigate to the correct route when navigation items is clicked', async () => {
    sut.createDesignNavigationItem = mockItems;
    fixture.detectChanges();

    const navigateSpy = spyOn(router, 'navigateByUrl').and.callThrough();
    const panelList = panelContentNavItems();
    ngZone.run(() => panelList[0].nativeElement.click());
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledOnceWith(jasmine.stringMatching(/\/item1/), {
      skipLocationChange: false,
      replaceUrl: false,
      state: undefined,
      info: undefined,
    });
  });

  describe('pages_show-templates-design-updates featureflag', () => {
    it(`should show new design when pages_show-templates-design-updates featureflag is enabled`, () => {
      featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);
      sut.ngOnInit();
      fixture.detectChanges();

      const lhsPanelContainer = fixture.debugElement.query(By.css('.lhs-panel-container'));

      expect(lhsPanelContainer.classes['p-l']).toBeTrue();
    });

    it(`should show old design when pages_show-templates-design-updates featureflag is not enabled`, () => {
      featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(false);
      sut.ngOnInit();
      fixture.detectChanges();

      const lhsPanelContainer = fixture.debugElement.query(By.css('.lhs-panel-container'));
      expect(lhsPanelContainer.classes['p-sm']).toBeTrue();
    });
  });

  describe('pages_show-page-branches featureflag', () => {
    it(`should show page branches navigation item when pages_show-page-branches featureflag is enabled`, () => {
      featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);
      sut.ngOnInit();
      fixture.detectChanges();

      const panelList = panelContentNavItems();

      expect(panelList.length).toBe(3);
      expect(panelList[2].nativeElement.textContent).toBe('PAGE_DESIGNS.LHS_PANEL.PAGE_BRANCHES');
    });

    it(`should not show page branches navigation item when pages_show-page-branches featureflag is not enabled`, () => {
      featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(false);
      sut.ngOnInit();

      const panelList = panelContentNavItems();

      expect(panelList.length).toBe(2);
    });
  });
});
