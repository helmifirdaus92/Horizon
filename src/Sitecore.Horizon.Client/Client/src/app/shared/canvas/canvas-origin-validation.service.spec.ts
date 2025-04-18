/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { Subject } from 'rxjs';
import { Configuration, ConfigurationService } from '../configuration/configuration.service';
import { LoggingService } from '../logging.service';
import { RenderingHostResolverService } from '../rendering-host/rendering-host-resolver.service';
import { CanvasOriginValidationService } from './canvas-origin-validation.service';

describe('CanvasOriginValidationService', () => {
  let sut: CanvasOriginValidationService;
  let configuration$: Subject<Configuration>;
  let loggerSpy: jasmine.SpyObj<LoggingService>;
  let configurationServiceSpy: jasmine.SpyObj<ConfigurationService>;

  beforeEach(() => {
    configuration$ = new Subject();

    TestBed.configureTestingModule({
      imports: [StaticConfigurationServiceStubModule],
      providers: [
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>('ConfigurationService', [], { configuration$ }),
        },
        {
          provide: LoggingService,
          useValue: jasmine.createSpyObj<LoggingService>({ error: undefined }),
        },
        {
          provide: RenderingHostResolverService,
          useValue: jasmine.createSpyObj<RenderingHostResolverService>(
            {},
            { hostUrl: 'https://renderinghost.localhost?prop1=1&prop2=2' },
          ),
        },
      ],
    });

    ConfigurationService.xmCloudTenant = {
      id: '123',
      name: 'tenant',
      displayName: 'tenant1',
      organizationId: 'test-org',
      url: 'http://primary.com',
      gqlEndpointUrl: 'https://primary.com/graph',
      cdpEmbeddedTenantId: '123',
      customerEnvironmentType: 'prd',
      environmentId: '321',
      environmentName: 'prodev',
      projectId: '12',
      projectName: 'proj',
    };

    sut = TestBed.inject(CanvasOriginValidationService);
    loggerSpy = TestBedInjectSpy(LoggingService);
    configurationServiceSpy = TestBedInjectSpy(ConfigurationService);
  });

  afterEach(() => {
    ConfigurationService.xmCloudTenant = null;
  });

  describe('IGNORE_ATTEMPT', () => {
    it('should return IGNORE_ATTEMPT till configuration is resolved', () => {
      const result = sut.reviewConnectionRequest({ clientId: '', origin: 'http://origin.com' });

      expect(result).toBe('IGNORE_ATTEMPT');
    });
  });

  describe('REJECT', () => {
    it('should REJECT if nothing matches', () => {
      configuration$.next({
        hostVerificationToken: 'platform_token',
        contentRootItemId: 'root-item-id',
        clientLanguage: 'da',
        sessionTimeoutSeconds: 1200,
        integrationVersion: '1.0.0.0',
        jssEditingSecret: 'jss-editing-secret',
        personalizeScope: '',
        globalTagsRepository: '',
        environmentFeatures: [],
      });

      const result = sut.reviewConnectionRequest({
        clientId: 'some-client',
        origin: 'http://unknown.origin',
        extras: {
          [CanvasOriginValidationService.HOST_VERIFICATION_TOKEN_KEY]: 'invalid_token',
        },
      });

      expect(result).toBe('REJECT');
    });

    it('should REJECT if hosts do not match and token is not configured', () => {
      configuration$.next({
        hostVerificationToken: '',
        contentRootItemId: 'root-item-id',
        clientLanguage: 'da',
        sessionTimeoutSeconds: 1200,
        integrationVersion: '1.0.0.0',
        jssEditingSecret: 'jss-editing-secret',
        personalizeScope: '',
        globalTagsRepository: '',
        environmentFeatures: [],
      });

      const result = sut.reviewConnectionRequest({
        clientId: 'some-client',
        origin: 'http://unknown.origin',
        extras: {
          [CanvasOriginValidationService.HOST_VERIFICATION_TOKEN_KEY]: 'token',
        },
      });

      expect(result).toBe('REJECT');
    });

    it('should REJECT if hosts do not match and token is missing', () => {
      configuration$.next({
        hostVerificationToken: 'platform_token',
        contentRootItemId: 'root-item-id',
        clientLanguage: 'da',
        sessionTimeoutSeconds: 1200,
        integrationVersion: '1.0.0.0',
        jssEditingSecret: 'jss-editing-secret',
        personalizeScope: '',
        globalTagsRepository: '',
        environmentFeatures: [],
      });

      const result = sut.reviewConnectionRequest({
        clientId: 'some-client',
        origin: 'http://unknown.origin',
      });

      expect(result).toBe('REJECT');
    });

    it('should REJECT if hosts do not match and token is neither configured nor provided', () => {
      configuration$.next({
        hostVerificationToken: '',
        contentRootItemId: 'root-item-id',
        clientLanguage: 'da',
        sessionTimeoutSeconds: 1200,
        integrationVersion: '1.0.0.0',
        jssEditingSecret: 'jss-editing-secret',
        personalizeScope: '',
        globalTagsRepository: '',
        environmentFeatures: [],
      });

      const result = sut.reviewConnectionRequest({
        clientId: 'some-client',
        origin: 'http://unknown.origin',
      });

      expect(result).toBe('REJECT');
    });

    it('should REJECT if hosts do not match and token is not configured and empty value provided', () => {
      configuration$.next({
        hostVerificationToken: '',
        contentRootItemId: 'root-item-id',
        clientLanguage: 'da',
        sessionTimeoutSeconds: 1200,
        integrationVersion: '1.0.0.0',
        jssEditingSecret: 'jss-editing-secret',
        personalizeScope: '',
        globalTagsRepository: '',
        environmentFeatures: [],
      });

      const result = sut.reviewConnectionRequest({
        clientId: 'some-client',
        origin: 'http://unknown.origin',
        extras: {
          [CanvasOriginValidationService.HOST_VERIFICATION_TOKEN_KEY]: '',
        },
      });

      expect(result).toBe('REJECT');
    });

    ['https://primary.com'].forEach((origin) => {
      it(`[${origin}] should REJECT if schema is different in urls`, () => {
        configuration$.next({
          hostVerificationToken: '',
          contentRootItemId: 'root-item-id',
          clientLanguage: 'da',
          sessionTimeoutSeconds: 1200,
          integrationVersion: '1.0.0.0',
          jssEditingSecret: 'jss-editing-secret',
          personalizeScope: '',
          globalTagsRepository: '',
          environmentFeatures: [],
        });

        const result = sut.reviewConnectionRequest({ clientId: '', origin });

        expect(result).toBe('REJECT');
      });
    });

    ['http://primary.com:8080/', 'http://additional1.com:81/'].forEach((origin) => {
      it(`[${origin}] should REJECT if port is different in urls`, () => {
        configuration$.next({
          hostVerificationToken: '',
          contentRootItemId: 'root-item-id',
          clientLanguage: 'da',
          sessionTimeoutSeconds: 1200,
          integrationVersion: '1.0.0.0',
          jssEditingSecret: 'jss-editing-secret',
          personalizeScope: '',
          globalTagsRepository: '',
          environmentFeatures: [],
        });

        const result = sut.reviewConnectionRequest({ clientId: '', origin });

        expect(result).toBe('REJECT');
      });
    });

    it('should log error when reject with info', () => {
      configuration$.next({
        hostVerificationToken: 'platform_token',
        contentRootItemId: 'root-item-id',
        clientLanguage: 'da',
        sessionTimeoutSeconds: 1200,
        integrationVersion: '1.0.0.0',
        jssEditingSecret: 'jss-editing-secret',
        personalizeScope: '',
        globalTagsRepository: '',
        environmentFeatures: [],
      });

      sut.reviewConnectionRequest({
        clientId: 'some-client',
        origin: 'http://unknown.origin',
        extras: {
          [CanvasOriginValidationService.HOST_VERIFICATION_TOKEN_KEY]: 'invalid_token',
        },
      });

      expect(loggerSpy.error).toHaveBeenCalled();
      const [msg] = loggerSpy.error.calls.mostRecent().args;
      expect(msg).toContain(`ClientId: 'some-client'`);
      expect(msg).toContain(`Origin: 'http://unknown.origin'`);
    });

    it('should not log tokens', () => {
      configuration$.next({
        hostVerificationToken: 'platform_token',
        contentRootItemId: 'root-item-id',
        clientLanguage: 'da',
        sessionTimeoutSeconds: 1200,
        integrationVersion: '1.0.0.0',
        jssEditingSecret: 'jss-editing-secret',
        personalizeScope: '',
        globalTagsRepository: '',
        environmentFeatures: [],
      });

      sut.reviewConnectionRequest({
        clientId: 'some-client',
        origin: 'http://unknown.origin',
        extras: {
          [CanvasOriginValidationService.HOST_VERIFICATION_TOKEN_KEY]: 'invalid_token',
        },
      });

      const [msg] = loggerSpy.error.calls.mostRecent().args;
      expect(msg).not.toContain('invalid_token');
      expect(msg).not.toContain('platform_token');
    });
  });

  describe('ACCEPT', () => {
    ['http://primary.com', 'http://primary.com/', 'http://primary.com:80', 'http://primary.com:80/'].forEach(
      (origin) => {
        it(`[${origin}] should ACCEPT if origin is the same as primaryPlatformUrl`, () => {
          configuration$.next({
            hostVerificationToken: '',
            contentRootItemId: 'root-item-id',
            clientLanguage: 'da',
            sessionTimeoutSeconds: 1200,
            integrationVersion: '1.0.0.0',
            jssEditingSecret: 'jss-editing-secret',
            personalizeScope: '',
            globalTagsRepository: '',
            environmentFeatures: [],
          });

          const result = sut.reviewConnectionRequest({ clientId: '', origin });

          expect(result).toBe('ACCEPT');
        });
      },
    );

    it('should ACCEPT if token is matching', () => {
      configuration$.next({
        hostVerificationToken: 'platform-token',
        contentRootItemId: 'root-item-id',
        clientLanguage: 'da',
        sessionTimeoutSeconds: 1200,
        integrationVersion: '1.0.0.0',
        jssEditingSecret: 'jss-editing-secret',
        personalizeScope: '',
        globalTagsRepository: '',
        environmentFeatures: [],
      });

      const result = sut.reviewConnectionRequest({
        clientId: '',
        origin: 'http://other',
        extras: {
          [CanvasOriginValidationService.HOST_VERIFICATION_TOKEN_KEY]: 'platform-token',
        },
      });

      expect(result).toBe('ACCEPT');
    });

    it('should ACCEPT if origin matches a rendering host', () => {
      configuration$.next({
        hostVerificationToken: 'platform-token',
        contentRootItemId: 'root-item-id',
        clientLanguage: 'da',
        sessionTimeoutSeconds: 1200,
        integrationVersion: '1.0.0.0',
        jssEditingSecret: 'jss-editing-secret',
        personalizeScope: '',
        globalTagsRepository: '',
        environmentFeatures: [],
      });

      const result = sut.reviewConnectionRequest({ clientId: '', origin: 'https://renderinghost.localhost' });
      expect(result).toBe('ACCEPT');
    });
  });
});
