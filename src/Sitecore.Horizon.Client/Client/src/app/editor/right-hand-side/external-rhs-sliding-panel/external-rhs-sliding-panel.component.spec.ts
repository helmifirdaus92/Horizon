/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgGlobalMessaging } from '@sitecore/ng-page-composer';
import { SlideInPanelHeaderComponent } from 'app/component-lib/slide-in-panel/slide-in-panel-header.component';
import { SlideInPanelComponent } from 'app/component-lib/slide-in-panel/slide-in-panel.component';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { SitecoreRegionComponent } from 'app/extensibility/sitecore-region.component';
import { GlobalMessagingTesting } from 'app/testing/global-messaging-testing';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { Subject } from 'rxjs';
import { ExternalRhsSlidingPanelComponent } from './external-rhs-sliding-panel.component';
import { ExternalRhsPanelService } from './external-rhs-sliding-panel.service';

describe(ExternalRhsSlidingPanelComponent.name, () => {
  let component: ExternalRhsSlidingPanelComponent;
  let fixture: ComponentFixture<ExternalRhsSlidingPanelComponent>;
  let panelService: ExternalRhsPanelService;
  let resetPanel$: Subject<void>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExternalRhsSlidingPanelComponent],
      imports: [SlideInPanelModule, NoopAnimationsModule, SitecoreExtensibilityModule],
      providers: [ExternalRhsPanelService, { provide: NgGlobalMessaging, useValue: new GlobalMessagingTesting() }],
    }).compileComponents();

    fixture = TestBed.createComponent(ExternalRhsSlidingPanelComponent);
    panelService = TestBedInjectSpy(ExternalRhsPanelService);
    component = fixture.componentInstance;
    component.resetPanel$ = resetPanel$ = new Subject();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be empty by default create', () => {
    const panels = fixture.debugElement.queryAll(By.directive(SlideInPanelComponent));
    expect(panels).toHaveSize(0);
  });

  it('should show provided header when panel is opened', () => {
    panelService.openPanel('key1', 'header1');
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.directive(SlideInPanelHeaderComponent));
    const headerElement = header.nativeElement as HTMLElement;
    expect(headerElement.innerText).toEqual('header1');
  });

  it('should set region with key when panel is opened', () => {
    panelService.openPanel('key1', 'header1');
    fixture.detectChanges();

    const region = fixture.debugElement.query(By.directive(SitecoreRegionComponent)).componentInstance;
    expect(region.input).toEqual('key1');
  });

  it('should remove panel when it is closed', () => {
    panelService.openPanel('key1', 'header1');
    fixture.detectChanges();
    panelService.closePanel();
    fixture.detectChanges();

    const panels = fixture.debugElement.queryAll(By.directive(SlideInPanelComponent));
    expect(panels).toHaveSize(0);
  });

  it('should close panel when resetPanel$ is triggeered', () => {
    panelService.openPanel('key1', 'header1');
    fixture.detectChanges();
    resetPanel$.next();
    fixture.detectChanges();

    const panels = fixture.debugElement.queryAll(By.directive(SlideInPanelComponent));
    expect(panels).toHaveSize(0);
  });
});
