/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { FeatureEnabledDirective } from './feature-enabled.directive';
import { FeatureFlagsService } from './feature-flags.service';

@Component({
  template: `
    <div *ifFeatureEnabled="'myFeatureFlag'">My feature is enabled!</div>
    <div *ifFeatureEnabled="'otherFeatureFlag'">My feature is disabled!</div>
    <div *ifFeatureEnabled="'ifElseFeature'; else elseBlockTestTemplate">My feature is disabled!</div>
    <ng-template #elseBlockTestTemplate><h1>Else block test text</h1></ng-template>
  `,
})
class TestComponent {
  @Input() featureFlagName = '';
}

describe(FeatureEnabledDirective.name, () => {
  let fixture: ComponentFixture<TestComponent>;
  let featureFlagsServiceSpy: jasmine.SpyObj<FeatureFlagsService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeatureEnabledDirective, TestComponent],
      providers: [
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(['isFeatureEnabled']),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    featureFlagsServiceSpy = TestBedInjectSpy(FeatureFlagsService);
    fixture = TestBed.createComponent(TestComponent);

    featureFlagsServiceSpy.isFeatureEnabled.and.callFake((featureFlagName: string) => {
      return featureFlagName === 'myFeatureFlag';
    });
  });

  it('should show content for enabled feature flags', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    // Feature A should be enabled
    const featureAContent: DebugElement = fixture.debugElement.queryAll(By.css('div'))[0];
    expect(featureAContent.nativeElement.textContent).toContain('My feature is enabled!');
    flush();
  }));

  it('should clear content if feature flag is disabled', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    // Feature B should be disabled
    const featureBContent: DebugElement = fixture.debugElement.queryAll(By.css('div'))[1];
    expect(featureBContent).toBeFalsy();
    flush();
  }));

  it('should show content for else condition', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    // Feature A should be enabled
    const featureAContent: DebugElement = fixture.debugElement.queryAll(By.css('h1'))[0];
    expect(featureAContent.nativeElement.textContent).toContain('Else block test text');
    flush();
  }));
});
