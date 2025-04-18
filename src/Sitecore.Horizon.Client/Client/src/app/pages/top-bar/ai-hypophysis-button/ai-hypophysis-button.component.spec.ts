/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { IconButtonModule, PopoverModule } from '@sitecore/ng-spd-lib';
import { AiHypophysisPanelService } from 'app/editor/right-hand-side/ai-hypophysis-panel/ai-hypophysis-panel.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { AiHypophysisButtonComponent } from './ai-hypophysis-button.component';

describe(AiHypophysisButtonComponent.name, () => {
  let sut: AiHypophysisButtonComponent;
  let fixture: ComponentFixture<AiHypophysisButtonComponent>;

  let aiHypophysisPanelServiceSpy: jasmine.SpyObj<AiHypophysisPanelService>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, IconButtonModule, PopoverModule, NoopAnimationsModule],
      declarations: [AiHypophysisButtonComponent],
      providers: [
        {
          provide: AiHypophysisPanelService,
          useValue: jasmine.createSpyObj<AiHypophysisPanelService>(['openPanel']),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(['isFeatureEnabled']),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    aiHypophysisPanelServiceSpy = TestBedInjectSpy(AiHypophysisPanelService);
    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);
    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);

    fixture = TestBed.createComponent(AiHypophysisButtonComponent);
    sut = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should open AI hypophysis panel on click', () => {
    fixture.debugElement.query(By.css('#aiHypophysisBtn')).nativeElement.click();
    fixture.detectChanges();
    fixture.debugElement.query(By.css('ng-spd-popover button')).nativeElement.click();
    fixture.detectChanges();

    expect(aiHypophysisPanelServiceSpy.openPanel).toHaveBeenCalledTimes(1);
  });

  it('should not show the button if Feature is not enabled', () => {
    expect(fixture.debugElement.query(By.css('#aiHypophysisBtn'))).toBeTruthy();

    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(false);
    fixture = TestBed.createComponent(AiHypophysisButtonComponent);
    sut = fixture.componentInstance;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('#aiHypophysisBtn'))).toBeFalsy();
  });
});
