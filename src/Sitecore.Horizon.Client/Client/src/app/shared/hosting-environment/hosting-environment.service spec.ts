/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import {
  StaticConfigurationServiceStub,
  StaticConfigurationServiceStubModule,
} from 'app/testing/static-configuration-stub';
import { HostingEnvironmentService } from './hosting-environment.service';

describe(HostingEnvironmentService.name, () => {
  let service: HostingEnvironmentService;
  let staticConfigurationServiceStub: StaticConfigurationServiceStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HostingEnvironmentService, StaticConfigurationServiceStubModule],
    });

    service = TestBed.inject(HostingEnvironmentService);
    staticConfigurationServiceStub = TestBed.inject(StaticConfigurationServiceStub);
  });

  it('should return "&env=staging" when domain includes "staging"', () => {
    staticConfigurationServiceStub.auth0Settings.domain = 'pages-staging';
    expect(service.addEnvironmentInfo()).toBe('&env=staging');
  });

  it('should return "&env=pre-production" when domain includes "beta"', () => {
    staticConfigurationServiceStub.auth0Settings.domain = 'pages-beta';
    expect(service.addEnvironmentInfo()).toBe('&env=pre-production');
  });

  it('should return "&env=pre-production" when domain includes "preprod"', () => {
    staticConfigurationServiceStub.auth0Settings.domain = 'pages-production';
    expect(service.addEnvironmentInfo()).toBe('&env=pre-production');
  });

  it('should return an empty string when domain does not include "staging", "beta", or "preprod"', () => {
    staticConfigurationServiceStub.auth0Settings.domain = 'pages';
    expect(service.addEnvironmentInfo()).toBe('');
  });
});
