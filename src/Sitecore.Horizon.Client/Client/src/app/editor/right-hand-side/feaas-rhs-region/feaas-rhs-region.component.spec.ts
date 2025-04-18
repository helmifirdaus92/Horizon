/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RenderingPropertiesSdkMessagingService } from 'app/editor/right-hand-side/rendering-details/rendering-properties.sdk-messaging.service';
import { SitecoreExtensibilityModule } from 'app/extensibility/sitecore-extensibility.module';
import { RecreateOnChangeModule } from 'app/shared/utils/recreate-on-change/recreate-on-change.module';
import { BehaviorSubject } from 'rxjs';
import { FeaasRhsRegionComponent } from './feaas-rhs-region.component';

describe('FeaasRhsRegionComponent', () => {
  let component: FeaasRhsRegionComponent;
  let fixture: ComponentFixture<FeaasRhsRegionComponent>;
  let messagingStatus$: BehaviorSubject<'connected' | 'disconnected'>;

  beforeEach(async () => {
    messagingStatus$ = new BehaviorSubject<'connected' | 'disconnected'>('connected');

    await TestBed.configureTestingModule({
      imports: [RecreateOnChangeModule, SitecoreExtensibilityModule],
      declarations: [FeaasRhsRegionComponent],
      providers: [
        {
          provide: RenderingPropertiesSdkMessagingService,
          useValue: jasmine.createSpyObj('RenderingPropertiesSdkMessagingService', [], {
            messagingStatus$,
          }),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaasRhsRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render extensions when chrome is selected', () => {
    component.chrome = { chromeId: 'chromeId1' } as any;
    fixture.detectChanges();

    const sitecoreRegion = fixture.nativeElement.querySelector('app-sitecore-region');

    expect(sitecoreRegion).toBeTruthy();
  });

  it('should not render extensions when messaging is disconnected', () => {
    component.chrome = { chromeId: 'chromeId1' } as any;
    messagingStatus$.next('disconnected');
    fixture.detectChanges();

    const sitecoreRegion = fixture.nativeElement.querySelector('app-sitecore-region');

    expect(sitecoreRegion).toBeNull();
  });

  it('should re-render extensions when chrome is changed', () => {
    component.chrome = { chromeId: 'chromeId1' } as any;
    fixture.detectChanges();
    const oldExtensions = fixture.nativeElement.querySelector('app-sitecore-region');

    component.chrome = { chromeId: 'chromeId2' } as any;
    fixture.detectChanges();

    const newExtensions = fixture.nativeElement.querySelector('app-sitecore-region');

    expect(oldExtensions).not.toBe(newExtensions);
    expect(oldExtensions).not.toBe(newExtensions);
  });
});
