/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from '@sitecore/ng-spd-lib';
import { ContextService } from 'app/shared/client-state/context.service';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ItemDalService } from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { PageDetailsComponent } from './page-details.component';

describe(PageDetailsComponent.name, () => {
  let sut: PageDetailsComponent;
  let fixture: ComponentFixture<PageDetailsComponent>;
  let contextService: jasmine.SpyObj<ContextService>;
  let siteServiceSpy: jasmine.SpyObj<SiteService>;
  let itemDalServiceSpy: jasmine.SpyObj<ItemDalService>;

  const mockContext = {
    siteName: 'test-site',
    itemId: 'item123',
    itemVersion: 1,
    language: 'en',
    getItem: jasmine.createSpy('getItem'),
  };

  const mockItem = {
    createdBy: 'test-user',
    creationDate: '2021-10-07T11:18:55Z',
    versions: [
      {
        isLatestPublishableVersion: false,
        publishing: { validFromDate: '2023-10-02T09:24:26Z', validToDate: '9999-12-31T23:59:59.9999999Z' },
        updatedBy: 'user1',
        updatedDate: '2021-09-07T11:18:55Z',
        version: 1,
        versionName: 'versionName1',
        workflow: null,
      },
    ],
  } as Item;

  beforeEach(waitForAsync(() => {
    contextService = jasmine.createSpyObj('ContextService', ['getItem'], {
      siteName: 'test-site',
      language: 'en',
      itemId: '123',
    });

    contextService.getItem.and.resolveTo(mockItem);

    siteServiceSpy = jasmine.createSpyObj('SiteService', ['getSiteLanguages']);
    itemDalServiceSpy = jasmine.createSpyObj('ItemDalService', ['getItemVersions', 'getRawItem']);

    TestBed.configureTestingModule({
      declarations: [PageDetailsComponent],
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        StaticConfigurationServiceStubModule,
        AccordionModule,
      ],
      providers: [
        { provide: ContextService, useValue: contextService },
        { provide: SiteService, useValue: siteServiceSpy },
        { provide: ItemDalService, useValue: itemDalServiceSpy },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageDetailsComponent);
    sut = fixture.componentInstance;
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('ngOnChanges()', () => {
    it('should show item details when accordion is open', async () => {
      // Arrange
      sut.context = mockContext;
      sut.isAccordionOpen = true;
      fixture.detectChanges();
      // Act
      await fixture.whenStable();

      // Assert
      expect(sut.itemDetails?.createdBy).toEqual('test-user');
      expect(sut.itemDetails?.creationDate).toEqual('2021-10-07T11:18:55Z');
      expect(sut.itemDetails?.activeVersion?.updatedBy).toEqual(mockItem.versions[0].updatedBy);
      expect(sut.itemDetails?.activeVersion?.updatedDate).toEqual(mockItem.versions[0].updatedDate);
    });
  });
});
