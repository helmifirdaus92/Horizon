/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';

import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from '@sitecore/ng-spd-lib';
import { VersionsWorkflowService } from 'app/editor/shared/versions-workflow/versions-workflow.service';
import { Context } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { BaseItemDalService, ItemDalService, RawItem } from 'app/shared/graphql/item.dal.service';
import { Item } from 'app/shared/graphql/item.interface';
import { Language, SiteService } from 'app/shared/site-language/site-language.service';
import { StaticConfigurationServiceStubModule } from 'app/testing/static-configuration-stub';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { PageLanguagesComponent } from './page-languages.component';

describe(PageLanguagesComponent.name, () => {
  let sut: PageLanguagesComponent;
  let fixture: ComponentFixture<PageLanguagesComponent>;
  let contextService: ContextServiceTesting;
  let getItemSpy: jasmine.Spy;
  let siteServiceSpy: jasmine.SpyObj<SiteService>;
  let itemDalServiceSpy: jasmine.SpyObj<ItemDalService>;

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

  const testLanguages: Language[] = [
    { displayName: 'English', name: 'en', nativeName: 'English', iso: 'en', englishName: 'English' },
  ];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PageLanguagesComponent],
      imports: [
        TranslateModule,
        TranslateServiceStubModule,
        ContextServiceTestingModule,
        StaticConfigurationServiceStubModule,
        AccordionModule,
      ],
      providers: [
        {
          provide: VersionsWorkflowService,
          useValue: jasmine.createSpyObj<VersionsWorkflowService>(VersionsWorkflowService.name, [
            'watchVersionsAndWorkflow',
          ]),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('SiteService', ['getSiteLanguages']),
        },
        {
          provide: BaseItemDalService,
          useValue: jasmine.createSpyObj<BaseItemDalService>({
            getRawItem: of({
              id: 'id',
              displayName: 'displayName',
              path: '/content/some/path',
              url: '/some/path',
            } as RawItem),
            getItemVersions: of({} as Item),
            getItem: of({} as Item),
            getItemState: of({} as Item),
          }),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    contextService = TestBedInjectSpy(ContextServiceTesting);
    fixture = TestBed.createComponent(PageLanguagesComponent);
    siteServiceSpy = TestBedInjectSpy(SiteService);
    siteServiceSpy.getSiteLanguages.and.returnValue(testLanguages);
    itemDalServiceSpy = TestBedInjectSpy(BaseItemDalService);
    sut = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('pageLanguages', () => {
    beforeEach(() => {
      getItemSpy = spyOn(contextService, 'getItem');
      getItemSpy.and.resolveTo(mockItem);
    });

    it('should fetch language versions for each language', fakeAsync(async () => {
      // Arrange
      const mockLanguages: Language[] = [
        { displayName: 'English', name: 'en', nativeName: 'English', iso: 'en', englishName: 'English' },
        { displayName: 'Danish', name: 'da', nativeName: 'Dansk', iso: 'da', englishName: 'Danish' },
      ];
      const mockContext: Context = {
        siteName: 'testSite',
        itemId: 'item123',
        itemVersion: 1,
        language: 'en',
      };

      siteServiceSpy.getSiteLanguages.and.returnValue(mockLanguages);

      sut.context = mockContext;
      sut.isAccordionOpen = true;

      // Act
      await sut.getItemLangaugeVersions(true);
      tick();

      // Assert
      expect(itemDalServiceSpy.getItemVersions).toHaveBeenCalledTimes(mockLanguages.length);
      expect(itemDalServiceSpy.getItemVersions).toHaveBeenCalledWith('item123', 'en', 'testSite', 1);
      expect(itemDalServiceSpy.getItemVersions).toHaveBeenCalledWith('item123', 'da', 'testSite', 1);
    }));

    it('should render check icon if language has versions', fakeAsync(async () => {
      // Arrange
      const mockLanguages: Language[] = [
        { displayName: 'Polish', name: 'pt-BR', nativeName: 'polish', iso: 'en', englishName: 'Polish' },
      ];
      const mockContext: Context = {
        siteName: 'testSite',
        itemId: 'item123',
        itemVersion: 1,
        language: 'pl',
      };
      siteServiceSpy.getSiteLanguages.and.returnValue(mockLanguages);
      itemDalServiceSpy.getItemVersions.and.returnValue(of({ versions: [{ version: 1 }] } as Item));

      // Act
      sut.context = mockContext;
      sut.isAccordionOpen = true;
      await sut.getItemLangaugeVersions(true);

      tick();
      fixture.detectChanges();

      const accordionHeader = fixture.nativeElement.querySelector('ng-spd-accordion-header');
      accordionHeader.click();
      fixture.detectChanges();
      tick();

      const itemLanguages = fixture.nativeElement.querySelectorAll('.item-language');
      const languageText = itemLanguages[0].querySelector('span').textContent.trim();

      // Assert;
      expect(itemLanguages.length).toEqual(1);
      expect(languageText).toEqual('Polish');
      expect(itemLanguages[0].querySelector('i.mdi-check')).toBeTruthy();
    }));

    it('should render dash icon if language has no versions', fakeAsync(async () => {
      // Arrange
      const mockLanguages: Language[] = [
        { displayName: 'Danish', name: 'da', nativeName: 'Danish', iso: 'da', englishName: 'Danish' },
      ];
      const mockContext: Context = {
        siteName: 'testSite',
        itemId: 'item123',
        itemVersion: 1,
        language: 'da',
      };

      siteServiceSpy.getSiteLanguages.and.returnValue(mockLanguages);
      itemDalServiceSpy.getItemVersions.and.returnValue(of({ versions: [] } as unknown as Item));

      // Act
      sut.context = mockContext;
      sut.isAccordionOpen = true;
      await sut.getItemLangaugeVersions(true);

      tick();
      fixture.detectChanges();

      const accordionHeader = fixture.nativeElement.querySelector('ng-spd-accordion-header');
      accordionHeader.click();
      fixture.detectChanges();
      tick();

      const itemLanguages = fixture.nativeElement.querySelectorAll('.item-language');
      const languageText = itemLanguages[0].querySelector('span').textContent.trim();

      // Assert
      expect(itemLanguages.length).toEqual(1);
      expect(languageText).toEqual('Danish');
      expect(itemLanguages[0].querySelector('i.mdi-minus')).toBeTruthy();
    }));
  });
});
