/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { LhsPanelStateService } from 'app/editor/lhs-panel/lhs-panel.service';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { ReplaySubject, Subject } from 'rxjs';
import { LeftHandSideComponent } from './left-hand-side.component';
import { LHSNavigationService } from './lhs-navigation.service';

describe(LeftHandSideComponent.name, () => {
  let sut: LeftHandSideComponent;
  let fixture: ComponentFixture<LeftHandSideComponent>;
  let navService: jasmine.SpyObj<LHSNavigationService>;
  let activeNavigation$: Subject<string>;
  let lhsPanelStateService: LhsPanelStateService;

  const compWrapperEle = () => fixture.debugElement.query(By.css('.components-wrapper'));
  const templatesLhsPanel = () => fixture.debugElement.query(By.css('app-templates-lhs-panel'));
  const sitetree = () => fixture.debugElement.query(By.css('app-content-tree-area'));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, CommonModule, AppLetModule, ContextServiceTestingModule],
      declarations: [LeftHandSideComponent],
      providers: [
        {
          provide: LHSNavigationService,
          useValue: jasmine.createSpyObj<LHSNavigationService>('nav-service', ['watchRouteSegment']),
        },
        LhsPanelStateService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    lhsPanelStateService = TestBed.inject(LhsPanelStateService);

    fixture = TestBed.createComponent(LeftHandSideComponent);
    sut = fixture.componentInstance;

    navService = TestBedInjectSpy(LHSNavigationService);

    activeNavigation$ = new ReplaySubject(1);
    navService.watchRouteSegment.and.returnValue(activeNavigation$);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('activeNavigation', () => {
    it('should not show the editor lhs content when the route state is "analytics"', () => {
      // act
      activeNavigation$.next('analytics');
      fixture.detectChanges();

      const editorLHSContent = fixture.debugElement.query(By.css('.editor-lhs-nav'));

      // assert
      expect(editorLHSContent).toBeFalsy();
    });

    it('should show site tree and hide components-wrapper element if active navigation is "editor" and "sitetree" icon button is selected', () => {
      activeNavigation$.next('editor');
      fixture.detectChanges();

      const sitetreeButton = fixture.debugElement.query(By.css('button[icon="file-outline"]')).nativeElement;
      sitetreeButton.click();
      fixture.detectChanges();

      expect(sitetree().classes.hidden).toBeUndefined();
      expect(compWrapperEle().classes.hidden).toBeTrue();
    });

    it('should hide site tree and show components-wrapper element when the active navigation is "editor" and "components" icon button is selected', () => {
      activeNavigation$.next('editor');
      fixture.detectChanges();

      const componentsButton = fixture.debugElement.query(
        By.css('button[icon="view-grid-plus-outline"]'),
      ).nativeElement;
      componentsButton.click();
      fixture.detectChanges();

      expect(sitetree().classes.hidden).toBeTrue();
      expect(compWrapperEle().classes.hidden).toBeUndefined();
    });

    it('should show components-wrapper element when the active navigation is "editpartialdesign"', () => {
      activeNavigation$.next('editpartialdesign');
      fixture.detectChanges();

      expect(compWrapperEle().classes.hidden).toBeUndefined();
    });

    it('should show the "page-designs-lhs-panel" component when the active navigation is "editpagedesign"', () => {
      // act
      activeNavigation$.next('editpagedesign');
      fixture.detectChanges();

      const pageDesignsLHSComponent = fixture.debugElement.query(By.css('app-page-designs-lhs-panel'));

      // assert
      expect(pageDesignsLHSComponent).toBeTruthy();
    });

    it('should show the "Personalization" component when the active navigation is "Personalization"', () => {
      // act
      activeNavigation$.next('personalization');
      fixture.detectChanges();

      const personalizationComponent = fixture.debugElement.query(By.css('app-personalization'));

      // assert
      expect(personalizationComponent).toBeTruthy();
    });

    it('should render templates-lhs-panel component if active navigation is "templates"', () => {
      // act
      activeNavigation$.next('templates');
      fixture.detectChanges();

      // assert
      expect(templatesLhsPanel()).toBeTruthy();
    });

    it('should render templates-lhs-panel component if active navigation is "partialdesigns"', () => {
      // act
      activeNavigation$.next('partialdesigns');
      fixture.detectChanges();

      // assert
      expect(templatesLhsPanel).toBeTruthy();
    });

    it('should render templates-lhs-panel component if active navigation is "pagedesigns"', () => {
      // act
      activeNavigation$.next('pagedesigns');
      fixture.detectChanges();

      // assert
      expect(templatesLhsPanel()).toBeTruthy();
    });

    it('should render templates-lhs-panel component if active navigation is "pagebranches"', () => {
      // act
      activeNavigation$.next('pagebranches');
      fixture.detectChanges();

      // assert
      expect(templatesLhsPanel()).toBeTruthy();
    });
  });

  describe('expanded LHS panel', () => {
    afterEach(() => {
      lhsPanelStateService.setExpand(false);
    });

    it('should disable device switcher when LHS panel is expanded', () => {
      activeNavigation$.next('editor');
      lhsPanelStateService.setExpand(true);
      fixture.detectChanges();

      const componentsButton = fixture.debugElement.query(
        By.css('button[icon="view-grid-plus-outline"]'),
      ).nativeElement;
      expect(componentsButton.disabled).toBeTrue();
    });
  });
});
