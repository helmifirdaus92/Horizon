/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { BadgeModule, TableModule } from '@sitecore/ng-spd-lib';
import { mockComponentFlowDefinition } from 'app/editor/right-hand-side/test-component/ab-test-component.utils';
import { ExperimentStatusComponent } from 'app/editor/right-hand-side/test-component/experiment-status/experiment-status.component';
import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ComponentFlowDefinitionWithPublishedStatus } from '../page-ab-tests-dialog.component';
import { PageAbTestsListComponent } from './page-ab-tests-list.component';

describe(PageAbTestsListComponent.name, () => {
  let sut: PageAbTestsListComponent;
  let fixture: ComponentFixture<PageAbTestsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PageAbTestsListComponent],
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        TableModule,
        BadgeModule,
        ExperimentStatusComponent,
        StaticConfigurationServiceStubModule,
        FeatureFlagsModule,
        ContextServiceTestingModule,
      ],
      providers: [
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>(['getContextSite']),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageAbTestsListComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should display the correct number of ab tests', () => {
    const pageAbTests: ComponentFlowDefinitionWithPublishedStatus[] = [
      { ...mockComponentFlowDefinition, isPagePublished: true },
    ];
    sut.pageAbTests = pageAbTests;
    fixture.detectChanges();

    const testItemElment = fixture.nativeElement;
    const items = testItemElment.querySelectorAll('.ab-test-item');
    expect(items.length).toBe(pageAbTests.length);
  });

  it('should display the correct ab tests names', () => {
    const pageAbTests: ComponentFlowDefinitionWithPublishedStatus[] = [
      { ...mockComponentFlowDefinition, isPagePublished: true },
    ];
    sut.pageAbTests = pageAbTests;
    fixture.detectChanges();

    const testItemElment = fixture.nativeElement;
    const items = testItemElment.querySelectorAll('.ab-test-name');
    expect(items[0].textContent).toContain('morning visitor');
  });

  it('should display the correct status icons', () => {
    const pageAbTests: ComponentFlowDefinitionWithPublishedStatus[] = [
      { ...mockComponentFlowDefinition, status: 'COMPLETED', isPagePublished: true },
    ];
    sut.pageAbTests = pageAbTests;
    fixture.detectChanges();

    const testItemElment = fixture.nativeElement;
    const icons = testItemElment.querySelectorAll('.mdi-chevron-right');
    expect(icons.length).toBe(1);
  });
});
