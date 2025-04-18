/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonModule } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { DialogCloseHandle, DialogOverlayService, LoadingIndicatorModule } from '@sitecore/ng-spd-lib';
import { mockComponentFlowDefinition } from 'app/editor/right-hand-side/test-component/ab-test-component.utils';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of, ReplaySubject } from 'rxjs';
import { AbTestComponentService } from '../left-hand-side/personalization/personalization-services/ab-test-component.service';
import { VariantPublishedStatusService } from '../left-hand-side/personalization/personalization-services/variant-published-status.service';
import { PageAbTestsDialogComponent } from './page-ab-tests-dialog.component';

const INITIAL_CONTEXT = {
  itemId: 'foo',
  language: 'en',
  siteName: 'website',
};

@Component({ selector: 'app-page-ab-tests', template: '' })
class PageAbTestsStubComponent {}

describe(PageAbTestsDialogComponent.name, () => {
  let sut: PageAbTestsDialogComponent;
  let fixture: ComponentFixture<PageAbTestsDialogComponent>;
  let closeHandleSpy: jasmine.SpyObj<DialogCloseHandle>;
  let dialogOverlayServiceSpy: jasmine.SpyObj<DialogOverlayService>;
  let variantPublishedStatusServiceSpy: jasmine.SpyObj<VariantPublishedStatusService>;
  let abTestComponentServiceSpy: jasmine.SpyObj<AbTestComponentService>;
  let variantsFetched$: ReplaySubject<boolean>;

  async function whenInitialized() {
    await Promise.resolve();
    fixture.detectChanges();
    await fixture.whenStable();
    await Promise.resolve();
  }

  beforeEach(async () => {
    variantsFetched$ = new ReplaySubject<boolean>(1);
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        TranslateModule,
        TranslateServiceStubModule,
        LoadingIndicatorModule,
        ContextServiceTestingModule,
      ],
      declarations: [PageAbTestsDialogComponent, PageAbTestsStubComponent],
      providers: [
        {
          provide: DialogCloseHandle,
          useValue: jasmine.createSpyObj<DialogCloseHandle>('DialogCloseHandle', ['close']),
        },
        {
          provide: DialogOverlayService,
          useValue: jasmine.createSpyObj<DialogOverlayService>(['open']),
        },
        {
          provide: VariantPublishedStatusService,
          useValue: {
            variantsFetched$: variantsFetched$,
            isPagePublished: jasmine.createSpy().and.returnValue(true),
          },
        },
        {
          provide: AbTestComponentService,
          useValue: jasmine.createSpyObj<AbTestComponentService>('AbTestComponentService', [
            'getAbTestsConfiguredOnPage',
          ]),
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    TestBed.inject(ContextServiceTesting).provideDefaultTestContext();

    dialogOverlayServiceSpy = TestBedInjectSpy(DialogOverlayService);
    abTestComponentServiceSpy = TestBedInjectSpy(AbTestComponentService);
    variantPublishedStatusServiceSpy = TestBedInjectSpy(VariantPublishedStatusService);

    abTestComponentServiceSpy.getAbTestsConfiguredOnPage.and.returnValue(
      Promise.resolve([mockComponentFlowDefinition]),
    );

    closeHandleSpy = TestBedInjectSpy(DialogCloseHandle);

    fixture = TestBed.createComponent(PageAbTestsDialogComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  it('should show AB tests list when pageAbTests has more than one item', async () => {
    sut.isLoading = false;
    const pageAbTests = [
      { ...mockComponentFlowDefinition, isPagePublished: true },
      {
        ...mockComponentFlowDefinition,
        friendlyId: 'component_scope_foo1bar2baz30000aaaabbbbcccc1234_renderinginstanceid_lang001_20240715t090123427z',
        isPagePublished: true,
      },
    ];

    abTestComponentServiceSpy.getAbTestsConfiguredOnPage.and.returnValue(Promise.resolve(pageAbTests));
    sut.contextValue$ = of(INITIAL_CONTEXT);

    variantsFetched$.next(true);
    await whenInitialized();

    const abTestsList = fixture.debugElement.query(By.css('app-page-ab-tests-list'));
    expect(abTestsList).toBeTruthy();
    expect(abTestsList.componentInstance.pageAbTests.length).toEqual(2);

    const otherComponents = fixture.debugElement.queryAll(By.css('app-empty-state, app-page-ab-test-detail'));
    expect(otherComponents.length).toBe(0);
    expect(sut.pageAbTests[0].isPagePublished).toBeTrue();
  });

  it('should show page detail when pageAbTests has one item', async () => {
    sut.isLoading = false;
    abTestComponentServiceSpy.getAbTestsConfiguredOnPage.and.returnValue(
      Promise.resolve([{ ...mockComponentFlowDefinition, isPagePublished: true }]),
    );
    sut.contextValue$ = of(INITIAL_CONTEXT);

    variantsFetched$.next(true);
    await whenInitialized();

    const pageDetail = fixture.debugElement.query(By.css('app-page-ab-test-details'));
    expect(pageDetail).toBeTruthy();

    const otherComponents = fixture.debugElement.queryAll(By.css('app-empty-state, app-page-ab-tests-list'));
    expect(otherComponents.length).toBe(0);
  });

  it('should show loading indicator when isLoading is true', () => {
    sut.isLoading = true;

    fixture.detectChanges();

    const loadingIndicator = fixture.debugElement.query(By.css('ng-spd-loading-indicator'));
    expect(loadingIndicator).toBeTruthy();

    const otherComponents = fixture.debugElement.queryAll(
      By.css('app-empty-state, app-page-ab-test-details, app-page-ab-tests-list'),
    );
    expect(otherComponents.length).toBe(0);
  });

  it('should show empty state when pageAbTests is empty', () => {
    sut.isLoading = false;
    sut.pageAbTests = [];
    sut.contextValue$ = of(INITIAL_CONTEXT);

    fixture.detectChanges();

    const emptyState = fixture.debugElement.query(By.css('app-empty-state'));
    expect(emptyState).toBeTruthy();

    const otherComponents = fixture.debugElement.queryAll(By.css('app-page-ab-test-details, app-page-ab-tests-list'));
    expect(otherComponents.length).toBe(0);
  });
});
