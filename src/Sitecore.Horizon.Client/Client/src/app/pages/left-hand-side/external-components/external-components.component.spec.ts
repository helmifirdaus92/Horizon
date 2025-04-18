/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { TestBedInjectSpy } from 'app/testing/test.utils';

import { FeatureFlagsModule } from 'app/feature-flags/feature-flags.module';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ExternalComponentsComponent } from './external-components.component';

describe(ExternalComponentsComponent.name, () => {
  let component: ExternalComponentsComponent;
  let fixture: ComponentFixture<ExternalComponentsComponent>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;

  const scRegionEl = () => fixture.debugElement.query(By.css('app-sitecore-region'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, SitecoreExtensibilityModule, FeatureFlagsModule],
      declarations: [ExternalComponentsComponent],
      providers: [
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj('FeatureFlagsService', ['isFeatureEnabled']),
        },
      ],
    }).compileComponents();

    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);
    fixture = TestBed.createComponent(ExternalComponentsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render external components if feature is enabled', async () => {
    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(true);
    await fixture.detectChanges();

    expect(scRegionEl()).toBeDefined();
    expect(scRegionEl().attributes.name).toEqual('EditingShell.LHS.Components');
  });

  it('should not render external components if extension is not enabled', () => {
    featureFlagsServiceSpy.isFeatureEnabled.and.returnValue(false);
    fixture.detectChanges();

    expect(scRegionEl()).toEqual(null as any);
  });
});
