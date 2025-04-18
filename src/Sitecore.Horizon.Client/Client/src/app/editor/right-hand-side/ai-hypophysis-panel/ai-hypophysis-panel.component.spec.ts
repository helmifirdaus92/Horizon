/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { LoadingIndicatorModule, TabsModule } from '@sitecore/ng-spd-lib';
import { SlideInPanelComponent } from 'app/component-lib/slide-in-panel/slide-in-panel.component';
import { SlideInPanelModule } from 'app/component-lib/slide-in-panel/slide-in-panel.module';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { Subject } from 'rxjs';
import { AiHypophysisPanelComponent } from './ai-hypophysis-panel.component';
import { AiHypophysisPanelService } from './ai-hypophysis-panel.service';

describe(AiHypophysisPanelComponent.name, () => {
  let component: AiHypophysisPanelComponent;
  let fixture: ComponentFixture<AiHypophysisPanelComponent>;
  let panelService: AiHypophysisPanelService;
  let resetPanel$: Subject<void>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AiHypophysisPanelComponent],
      imports: [
        SlideInPanelModule,
        NoopAnimationsModule,
        SitecoreExtensibilityModule,
        TranslateModule,
        TranslateServiceStubModule,
        TabsModule,
        LoadingIndicatorModule,
      ],
      providers: [AiHypophysisPanelService],
    }).compileComponents();

    fixture = TestBed.createComponent(AiHypophysisPanelComponent);
    panelService = TestBedInjectSpy(AiHypophysisPanelService);
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

  it('should remove panel when it is closed', () => {
    panelService.openPanel();
    fixture.detectChanges();
    panelService.closePanel();
    fixture.detectChanges();

    const panels = fixture.debugElement.queryAll(By.directive(SlideInPanelComponent));
    expect(panels).toHaveSize(0);
  });

  it('should close panel when resetPanel$ is triggered', () => {
    panelService.openPanel();
    fixture.detectChanges();
    resetPanel$.next();
    fixture.detectChanges();

    const panels = fixture.debugElement.queryAll(By.directive(SlideInPanelComponent));
    expect(panels).toHaveSize(0);
  });
});
