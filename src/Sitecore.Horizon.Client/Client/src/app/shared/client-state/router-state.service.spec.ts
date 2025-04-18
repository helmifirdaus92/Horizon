/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Location } from '@angular/common';
import { SpyLocation } from '@angular/common/testing';
import { NgZone } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { NavigationExtras, Router, RoutesRecognized } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PageDesignRoutingService } from 'app/page-design/shared/page-design-routing.service';
import { filter, map } from 'rxjs/operators';
import { normalizeGuid } from '../utils/utils';
import { Context } from './context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from './context.service.testing';
import { RouterStateService } from './router-state.service';

describe(RouterStateService.name, () => {
  let sut: RouterStateService;
  let locationSpy: SpyLocation;
  let contextService: ContextServiceTesting;
  let router: Router;
  // Workaround for the https://github.com/angular/angular/issues/25837
  let ngZone: NgZone;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, ContextServiceTestingModule],
      providers: [RouterStateService, PageDesignRoutingService],
    });

    sut = TestBed.inject(RouterStateService);
    locationSpy = TestBed.inject(Location) as unknown as SpyLocation;
    contextService = TestBed.inject(ContextServiceTesting);
    router = TestBed.inject(Router);
    ngZone = TestBed.inject(NgZone);
  });

  it('should be defined', () => {
    expect(sut).toBeTruthy();
  });

  describe('initialize()', () => {
    describe('and Url path has sc_itemid and sc_lang', () => {
      const itemId = '{foo1BAR2-BaZ3-0000-AAAA-bbbbCCCC1234}';

      beforeEach(() => {
        locationSpy.setInitialPath(`/pages?sc_itemid=${itemId}&sc_lang=foo`);
      });

      it('should return the context that matches the url', () => {
        const result = sut.initialize();

        expect(result.itemId).toBe(normalizeGuid(itemId));
        expect(result.language).toBe('foo');
        expect(result.siteName).toBe('');
      });
    });

    describe('and Url path is empty', () => {
      beforeEach(() => {
        locationSpy.setInitialPath('');
      });

      it('should return the context that matches the url', () => {
        const result = sut.initialize();

        expect(result.itemId).toBe('');
        expect(result.language).toBe('');
        expect(result.siteName).toBe('');
        expect(result.itemVersion).toBe(undefined);
      });
    });
  });

  describe('watchAndSyncRouteToContext', () => {
    it('should set route changes to context', async () => {
      // arrange
      locationSpy.setInitialPath('');

      const initalContext: Context = { itemId: 'initial', language: 'initial', siteName: 'initial' };
      contextService.provideTestValue(initalContext);

      ngZone.run(() => {
        sut.initialize();
        sut.watchAndSyncAll();
      });

      const spy = jasmine.createSpy();
      contextService.value$.subscribe(spy);

      const contextUpdate: Context = {
        itemId: 'item',
        language: 'catalan',
        siteName: 'ernestrocks.com',
        deviceLayoutId: '',
        itemVersion: undefined,
        variant: undefined,
      };

      // act
      const navigationExtras: NavigationExtras = {
        queryParams: {
          sc_itemid: contextUpdate.itemId,
          sc_lang: contextUpdate.language,
          sc_site: contextUpdate.siteName,
        },
        queryParamsHandling: 'merge',
      };
      await ngZone.run(() => router.navigate([], navigationExtras));

      // assert
      expect(spy).toHaveBeenCalledWith(contextUpdate);
    });

    it('should ignore route changes that originate from context', fakeAsync(() => {
      locationSpy.setInitialPath('');

      const initalContext: Context = {
        itemId: 'initial',
        language: 'initial',
        siteName: 'initial',
        deviceLayoutId: '',
        itemVersion: undefined,
        variant: undefined,
      };
      contextService.provideTestValue(initalContext);

      ngZone.run(() => {
        sut.initialize();
        sut.watchAndSyncAll();
      });
      tick();

      const spy = spyOn(contextService, 'updateContext');

      const contextUpdate: Context = {
        itemId: 'item',
        language: 'catalan',
        siteName: 'ernestrocks.com',
        deviceLayoutId: '',
        itemVersion: 1,
        variant: undefined,
      };

      ngZone.run(() => contextService.provideTestValue(contextUpdate));
      tick();

      expect(spy).not.toHaveBeenCalled();
      flush();
    }));

    it('should NOT update context with the initial router state', fakeAsync(() => {
      const itemId = '{foo1BAR2-BaZ3-0000-AAAA-bbbbCCCC1234}';
      locationSpy.setInitialPath(`/pages?sc_itemid=${itemId}&sc_lang=foo`);

      const initalContext: Context = {
        itemId: 'initial',
        language: 'initial',
        siteName: 'initial',
        deviceLayoutId: '',
        itemVersion: undefined,
        variant: undefined,
      };
      contextService.provideTestValue(initalContext);

      const spy = spyOn(contextService, 'updateContext');

      ngZone.run(() => {
        sut.initialize();
        sut.watchAndSyncAll();
      });
      tick();

      expect(spy).not.toHaveBeenCalled();
      flush();
    }));
  });

  describe('watchAndSyncContextStateToRoute', () => {
    it('should update route when context changes', fakeAsync(() => {
      locationSpy.setInitialPath('');
      ngZone.run(() => {
        sut.initialize();
        sut.watchAndSyncAll();
      });
      tick();

      const spy = jasmine.createSpy();
      router.events
        .pipe(
          filter((ev) => ev instanceof RoutesRecognized),
          map((ev) => (ev as RoutesRecognized).state.root.queryParamMap),
          map((params) => ({
            itemId: normalizeGuid(params.get('sc_itemid') || ''),
            language: params.get('sc_lang') || '',
            siteName: params.get('sc_site') || '',
            deviceLayoutId: params.get('sc_device') || '',
            itemVersion: params.get('sc_version') ? Number(params.get('sc_version')) : undefined,
            variant: undefined,
          })),
        )
        .subscribe(spy);

      const contextUpdate: Context = {
        itemId: 'item',
        itemVersion: 1,
        language: 'catalan',
        siteName: 'ernestrocks.com',
        deviceLayoutId: '',
        variant: undefined,
      };

      ngZone.run(() => contextService.provideTestValue(contextUpdate));
      tick();

      expect(spy).toHaveBeenCalledWith(contextUpdate);
      expect(spy).toHaveBeenCalledTimes(1);
      flush();
    }));

    it('should ignore context changes that already match the router state', fakeAsync(() => {
      const contextUpdate: Context = {
        itemId: 'item',
        itemVersion: 1,
        language: 'catalan',
        siteName: 'ernestrocks.com',
        deviceLayoutId: '',
        variant: undefined,
      };

      locationSpy.setInitialPath(
        `/pages?sc_itemid=${contextUpdate.itemId}&sc_lang=${contextUpdate.language}&sc_site=${contextUpdate.siteName}&sc_version=${contextUpdate.itemVersion}`,
      );
      ngZone.run(() => {
        sut.initialize();
        sut.watchAndSyncAll();
      });
      tick();

      const spy = jasmine.createSpy();
      router.events
        .pipe(
          filter((ev) => ev instanceof RoutesRecognized),
          map((ev) => (ev as RoutesRecognized).state.root.queryParamMap),
          map((params) => ({
            itemId: normalizeGuid(params.get('sc_itemid') || ''),
            language: params.get('sc_lang') || '',
            siteName: params.get('sc_site') || '',
            deviceLayoutId: params.get('sc_device') || '',
            itemVersion: params.get('sc_version') ? Number(params.get('sc_version')) : undefined,
          })),
        )
        .subscribe(spy);

      contextService.provideTestValue(contextUpdate);
      tick();

      expect(spy).not.toHaveBeenCalled();
      flush();
    }));
  });
});
