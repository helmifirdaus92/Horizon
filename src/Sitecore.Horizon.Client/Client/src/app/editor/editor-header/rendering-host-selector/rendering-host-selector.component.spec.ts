/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PopoverModule } from '@sitecore/ng-spd-lib';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { RenderingHostResolverService } from 'app/shared/rendering-host/rendering-host-resolver.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { RenderingHostSelectorComponent } from './rendering-host-selector.component';

describe('RenderingHostSelectorComponent', () => {
  let component: RenderingHostSelectorComponent;
  let fixture: ComponentFixture<RenderingHostSelectorComponent>;
  let hostResolverService: jasmine.SpyObj<RenderingHostResolverService>;
  let timedNotificationService: jasmine.SpyObj<TimedNotificationsService>;
  let contextService: ContextServiceTesting;

  const localHostUrl = 'http://localhost001';

  beforeEach(async () => {
    const hostResolverServiceSpy = jasmine.createSpyObj(
      { isLocalRenderingHostSelected: false, removeLocalRenderingHost: undefined, setLocalRenderingHost: undefined },
      { hostUrl: localHostUrl, hostUrl$: of(localHostUrl), errorState$: of(false) },
    );
    const timedNotificationServiceSpy = jasmine.createSpyObj('TimedNotificationsService', [
      'pushNotification',
      'hideNotificationById',
    ]);

    await TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule, TranslateModule, TranslateServiceStubModule, PopoverModule],
      declarations: [RenderingHostSelectorComponent],
      providers: [
        { provide: RenderingHostResolverService, useValue: hostResolverServiceSpy },
        { provide: TimedNotificationsService, useValue: timedNotificationServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RenderingHostSelectorComponent);
    component = fixture.componentInstance;

    hostResolverService = TestBedInjectSpy(RenderingHostResolverService);
    timedNotificationService = TestBedInjectSpy(TimedNotificationsService);
    contextService = TestBed.inject(ContextServiceTesting);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read initial values', () => {
    hostResolverService.isLocalRenderingHostSelected.and.returnValue(true);

    component.ngOnInit();

    expect(component.currentHost.type).toBe('local');
    expect(component.currentHost.url).toBe(localHostUrl);
  });

  it('should save the host type and URL', () => {
    component.hostTypeDraft = 'local';
    component.localHostUrlDraft = 'http://localhost';
    const updateCtxSpy = spyOn(contextService, 'updateContext');

    component.save();

    expect(component.currentHost.type).toBe('local');
    expect(component.currentHost.url).toBe('http://localhost');
    expect(hostResolverService.setLocalRenderingHost).toHaveBeenCalledWith('http://localhost');
    expect(updateCtxSpy).toHaveBeenCalled();
  });

  it('should reset local state to the currently applied host configuration', fakeAsync(() => {
    component.hostTypeDraft = 'local';
    component.localHostUrlDraft = 'http://localhost';
    component.currentHost = { type: 'default', url: '' };

    component.popoverIsActiveChange(false);
    tick(500);

    expect(component.hostTypeDraft).toBe('default');
    expect(component.localHostUrlDraft).toBe('');
  }));

  it('should show local host notification', fakeAsync(() => {
    hostResolverService.isLocalRenderingHostSelected.and.returnValue(true);

    component.ngOnInit();
    tick();

    expect(timedNotificationService.pushNotification).toHaveBeenCalled();
  }));

  it('should hide local host notification when saving default rendering host', fakeAsync(() => {
    component.hostTypeDraft = 'default';

    component.save();
    tick();

    expect(timedNotificationService.hideNotificationById).toHaveBeenCalledOnceWith(
      'local-rendering-host-used-notification-id',
    );
  }));
});
