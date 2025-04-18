/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { SlideInPanelComponent } from 'app/component-lib/slide-in-panel/slide-in-panel.component';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import {
  CanvasPageStateManagerTesting,
  CanvasPageStateManagerTestingModule,
} from 'app/shared/client-state/canvas-page-state-manager.testing';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { PageInteractionsGuardService } from 'app/shared/client-state/page-interactions-guard.service';
import { ChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EMPTY, Observable } from 'rxjs';
import { OptimizationConfirmationDialogService } from '../optimization-confirmation-dialog/optimization-confirmation-dialog.service';
import { OptimizeContentPanelComponent } from './optimize-content-panel.component';
import { OptimizeContentPanelService } from './optimize-content-panel.service';

@Component({
  selector: `<app-optimize-content-prompt ></app-optimize-content-prompt>`,
})
class OptimizeContentPromptComponent {
  @Input() resetPanel$: Observable<unknown> = EMPTY;
  @Input() chrome?: ChromeInfo;
}

describe(OptimizeContentPanelComponent.name, () => {
  let component: OptimizeContentPanelComponent;
  let fixture: ComponentFixture<OptimizeContentPanelComponent>;
  let panelService: OptimizeContentPanelService;
  let canvasPageStateManager: CanvasPageStateManagerTesting;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OptimizeContentPanelComponent, OptimizeContentPromptComponent],
      imports: [
        SlideInPanelModule,
        NoopAnimationsModule,
        SitecoreExtensibilityModule,
        TranslateModule,
        TranslateServiceStubModule,
        CanvasPageStateManagerTestingModule,
        ContextServiceTestingModule,
      ],
      providers: [
        OptimizeContentPanelService,
        {
          provide: OptimizationConfirmationDialogService,
          useValue: jasmine.createSpyObj<OptimizationConfirmationDialogService>({
            show: Promise.resolve('discard'),
          } as any),
        },
        {
          provide: PageInteractionsGuardService,
          useValue: jasmine.createSpyObj<PageInteractionsGuardService>(['injectGuard', 'releaseGuard']),
        },
      ],
    }).compileComponents();

    canvasPageStateManager = TestBed.inject(CanvasPageStateManagerTesting);
    canvasPageStateManager.provideDefaultTestState();
    canvasPageStateManager.setTestMode('persist');

    fixture = TestBed.createComponent(OptimizeContentPanelComponent);
    panelService = TestBedInjectSpy(OptimizeContentPanelService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be empty by default', () => {
    const panels = fixture.debugElement.queryAll(By.directive(SlideInPanelComponent));
    expect(panels).toHaveSize(0);
  });

  it('should remove panel when it is closed', () => {
    panelService.openPanel();
    fixture.detectChanges();
    panelService.closePanel();
    fixture.detectChanges();

    const panels = fixture.debugElement.queryAll(By.directive(SlideInPanelComponent));
    expect(panels).toHaveSize(0);
  });

  it('should open panel when panelState$ emits true', () => {
    panelService.openPanel();
    fixture.detectChanges();

    const panels = fixture.debugElement.queryAll(By.directive(SlideInPanelComponent));
    expect(panels).toHaveSize(1);
  });

  it('should close panel when closePanel is called', async () => {
    panelService.openPanel();
    fixture.detectChanges();

    await component.onClosePanel();
    await fixture.detectChanges();

    const panels = fixture.debugElement.queryAll(By.directive(SlideInPanelComponent));
    expect(panels).toHaveSize(0);
  });

  it('should not close panel if new chromeId starts with current chromeId', () => {
    panelService.openPanel();
    fixture.detectChanges();

    component.chrome = { chromeId: 'RENDERING_123', chromeType: 'rendering' } as ChromeInfo;
    fixture.detectChanges();

    component.chrome = { chromeId: 'RENDERING_123/FIELD_789', chromeType: 'field' } as ChromeInfo;
    fixture.detectChanges();

    const panels = fixture.debugElement.queryAll(By.directive(SlideInPanelComponent));
    expect(panels).toHaveSize(1);
  });
});
