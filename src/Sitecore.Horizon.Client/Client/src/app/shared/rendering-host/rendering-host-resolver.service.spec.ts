/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ContextService } from '../client-state/context.service';
import { ConfigurationService } from '../configuration/configuration.service';
import { SiteService } from '../site-language/site-language.service';
import { RenderingHostResolverService } from './rendering-host-resolver.service';

describe(RenderingHostResolverService.name, () => {
  let service: RenderingHostResolverService;
  let siteService: jasmine.SpyObj<SiteService>;
  let contextService: jasmine.SpyObj<ContextService>;

  beforeEach(() => {
    const siteServiceSpy = jasmine.createSpyObj({
      getContextSite: { renderingEngineApplicationUrl: 'http://default-url' },
    });
    const contextServiceSpy = jasmine.createSpyObj('ContextService', [], {
      siteName$: new BehaviorSubject<string>('defaultSite'),
    });

    TestBed.configureTestingModule({
      providers: [
        RenderingHostResolverService,
        { provide: SiteService, useValue: siteServiceSpy },
        { provide: ContextService, useValue: contextServiceSpy },
      ],
    });

    service = TestBed.inject(RenderingHostResolverService);
    siteService = TestBed.inject(SiteService) as jasmine.SpyObj<SiteService>;
    contextService = TestBed.inject(ContextService) as jasmine.SpyObj<ContextService>;

    ConfigurationService.xmCloudTenant = { id: 'tenant-id' } as any;
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with correct local host URL', () => {
    spyOn(localStorage, 'getItem').and.returnValue('http://localhost:3000|tenant-id');
    const serviceInstance = new RenderingHostResolverService(siteService, contextService);

    expect(serviceInstance.hostUrl).toBe('http://localhost:3000');
  });

  it('should notify error state', async () => {
    service.notifyErrorState(true);

    const isError = await firstValueFrom(service.errorState$);
    expect(isError).toBeTrue();
  });

  it('should set local rendering host', () => {
    spyOn(localStorage, 'setItem').and.callFake(() => {});

    service.setLocalRenderingHost('http://localhost');

    expect(localStorage.setItem).toHaveBeenCalledWith(service['localRenderingHostUrlKey'], 'http://localhost');
    service.hostUrl$.subscribe((url) => {
      expect(url).toBe('http://localhost');
    });
  });

  it('should remove local rendering host', () => {
    spyOn(localStorage, 'removeItem').and.callFake(() => {});
    service.removeLocalRenderingHost();

    expect(localStorage.removeItem).toHaveBeenCalledWith(service['localRenderingHostUrlKey']);
    service.hostUrl$.subscribe((url) => {
      expect(url).toBe('http://default-url');
    });
  });

  it('should check if local rendering host is selected', () => {
    service.setLocalRenderingHost('http://localhost');
    expect(service.isLocalRenderingHostSelected()).toBeTrue();

    service.removeLocalRenderingHost();
    expect(service.isLocalRenderingHostSelected()).toBeFalse();
  });
});
