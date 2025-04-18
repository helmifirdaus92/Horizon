/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { Writable } from 'app/shared/utils/lang.utils';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { of } from 'rxjs';
import { PersonalizationAPIService } from '../personalization-api/personalization.api.service';
import { BXFlowDefinitionBasicInfo } from '../personalization.types';
import { AbTestComponentService } from './ab-test-component.service';
import { cdpSiteData, CdpSiteDataService } from './cdp-site-data.service';

const INITIAL_CONTEXT = {
  itemId: 'foo',
  language: 'en',
  siteName: 'website',
};

const mockFlowDefinitions: BXFlowDefinitionBasicInfo[] = [
  {
    name: 'Component Flow',
    friendlyId: 'component_foo1bar2baz30000aaaabbbbcccc1234_555f788c2b8344e083be08eecd5b699c_en_20240715t090123427z',
    status: 'DRAFT',
  },
  {
    name: 'Embedded Flow',
    friendlyId: 'embedded_foo1bar2baz30000aaaabbbbcccc1234_en',
    status: 'DRAFT',
  },
];

describe(CdpSiteDataService.name, () => {
  let sut: CdpSiteDataService;
  let abTestComponentServiceSpy: jasmine.SpyObj<AbTestComponentService>;
  let contextService: ContextServiceTesting;
  let personalizationAPI: jasmine.SpyObj<PersonalizationAPIService>;
  let cdpSiteData: cdpSiteData;

  beforeEach(() => {
    abTestComponentServiceSpy = jasmine.createSpyObj<AbTestComponentService>('abTestComponentService', [
      'setFlowDefinitions',
    ]);
    (abTestComponentServiceSpy as Writable<AbTestComponentService>).flowDefinition$ = of(mockFlowDefinitions);

    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule],
      providers: [
        CdpSiteDataService,
        { provide: AbTestComponentService, useValue: abTestComponentServiceSpy },
        {
          provide: PersonalizationAPIService,
          useValue: jasmine.createSpyObj<PersonalizationAPIService>({
            getPersonalizationScope: Promise.resolve(''),
          }),
        },
      ],
    });

    abTestComponentServiceSpy = TestBedInjectSpy(AbTestComponentService);
    personalizationAPI = TestBedInjectSpy(PersonalizationAPIService);

    sut = TestBed.inject(CdpSiteDataService);

    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(INITIAL_CONTEXT);
  });

  describe('personalization presence', () => {
    it('should return false if page does not have personalization', fakeAsync(() => {
      sut.watchCdpSiteData().subscribe((result) => (cdpSiteData = result));

      tick();
      const result = cdpSiteData.hasPagePersonalization('not-present');

      expect(result).toBeFalse();
    }));

    it('should return true if page has AB test', fakeAsync(() => {
      sut.watchCdpSiteData().subscribe((result) => (cdpSiteData = result));

      tick();
      const result = cdpSiteData.hasPageWithAbTest('foo1bar2baz30000aaaabbbbcccc1234', false);

      expect(result).toBeTrue();
    }));

    it('should return true if page does not have AB test', fakeAsync(() => {
      sut.watchCdpSiteData().subscribe((result) => (cdpSiteData = result));

      tick();
      const result = cdpSiteData.hasPageWithAbTest('not-present', false);

      expect(result).toBeFalse();
    }));

    it('should return true if component does have AB test', fakeAsync(() => {
      sut.watchCdpSiteData().subscribe((result) => (cdpSiteData = result));

      tick();
      const result = cdpSiteData.hasComponentAbTest(
        'foo1bar2baz30000aaaabbbbcccc1234',
        '555f788c-2b83-44e0-83be-08eecd5b699c',
        false,
      );

      expect(result).toBeTrue();
    }));

    it('should return false if component does not have AB test', fakeAsync(() => {
      sut.watchCdpSiteData().subscribe((result) => (cdpSiteData = result));

      tick();
      const result = cdpSiteData.hasComponentAbTest('foo1bar2baz30000aaaabbbbcccc1234', 'not-present', false);

      expect(result).toBeFalse();
    }));
  });
});
