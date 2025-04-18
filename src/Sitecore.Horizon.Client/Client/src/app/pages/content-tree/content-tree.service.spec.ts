/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { fakeAsync, flush, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { adminPermissions } from 'app/page-design/shared/page-templates-test-data';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { firstValueFrom, of, throwError } from 'rxjs';
import { BaseContentTreeDalService, ContentTreeService } from './content-tree.service';

describe(ContentTreeService.name, () => {
  let controller: ApolloTestingController;
  let baseContentTreeDalServiceSpy: jasmine.SpyObj<BaseContentTreeDalService>;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let sut: ContentTreeService;
  const itemId = 'foo';
  const language = 'bar';

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, ApolloTestingModule],
      providers: [
        {
          provide: BaseContentTreeDalService,
          useValue: jasmine.createSpyObj<BaseContentTreeDalService>('BaseContentTreeDalService', [
            'addFolder',
            'addPage',
            'changeDisplayName',
            'deleteItem',
            'duplicateItem',
            'renamePage',
            'getItemAncestors',
          ]),
        },
        {
          provide: SiteService,

          useValue: jasmine.createSpyObj<SiteService>({
            isRootStartItem: false,
            getSiteByName: {
              name: 'My site',
              startItemId: 'startItemId',
            } as any,
          }),
        },
        ContentTreeService,
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>({
            push: of({}) as any,
            pushNotification: of({}) as any,
          }),
        },
      ],
    });

    controller = TestBed.inject(ApolloTestingController);
    baseContentTreeDalServiceSpy = TestBedInjectSpy(BaseContentTreeDalService);
    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);

    sut = TestBed.inject(ContentTreeService);
  }));

  afterEach(() => {
    controller.verify();
  });

  describe('deleteItem()', () => {
    it('should use the API to delete the item, and update [deleteItem$], using the given id', fakeAsync(() => {
      const site = 'exampleSite';

      baseContentTreeDalServiceSpy.deleteItem.and.returnValue(of(undefined));

      sut.deleteItem(itemId, site, language).subscribe(() => {
        expect(baseContentTreeDalServiceSpy.deleteItem).toHaveBeenCalledWith(itemId, site, language);
      });

      flush();
    }));

    describe('addTempCreatedItem()', () => {
      it('should emit `itemToAdd$` with a new ContentTreeItem using given input', () => {
        const templateId = 'bar';

        sut.itemToAdd$.subscribe((item) => {
          expect(item).toEqual({ templateId, text: 'EDITOR.NEW_PAGE', isFolder: false, parentId: itemId });
        });

        sut.addTempCreatedItem(templateId, 'page', itemId);
      });
    });

    describe('addDuplicatedItem()', () => {
      it('should emit `itemToDuplicate$` using given input', () => {
        const sourceItemId = 'bar';
        const sourceItemName = 'originalPage';
        const parentItemId = 'baz';
        const hasChildren = false;
        const isFolder = false;

        sut.itemToDuplicate$.subscribe((item) => {
          expect(item).toEqual({
            sourceItemId,
            text: 'EDITOR.COPY_OF' + ` ${sourceItemName}`,
            isFolder,
            parentId: parentItemId,
            hasChildren,
          });
        });

        sut.addTempDuplicatedItem(sourceItemId, sourceItemName, isFolder, parentItemId, hasChildren);
      });
    });

    describe('changeDisplayName()', () => {
      it('should use the API to change display name the item using the given id', fakeAsync(() => {
        const site = 'exampleSite';
        const newDisplayName = 'bar';
        const pageId = 'bar';
        baseContentTreeDalServiceSpy.changeDisplayName.and.returnValue(of({ id: pageId, displayName: newDisplayName }));

        sut.changeDisplayName(itemId, newDisplayName, site, language).subscribe(() => {
          expect(baseContentTreeDalServiceSpy.changeDisplayName).toHaveBeenCalledWith(
            itemId,
            newDisplayName,
            site,
            language,
          );
        });
      }));
    });

    describe('getContentTreeData', () => {
      describe('WHEN getItemAncestors fails', () => {
        it('should reset tree to the home item and show error notification', fakeAsync(async () => {
          baseContentTreeDalServiceSpy.getItemAncestors.and.returnValues(
            throwError(() => new Error('some error')),
            of({
              path: '/sitecore/content/Home',
              displayName: 'Home',
              itemId: '{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}',
              name: 'home',
              version: 1,
              hasChildren: true,
              thumbnailUrl: '/~/icon/Office/32x32/home.png',
              hasPresentation: false,
              access: adminPermissions,
              insertOptions: [],
              createdAt: {
                value: '20230428T111641Z',
              },
              updatedAt: {
                value: '20230429T111641Z',
              },
              template: {
                templateId: 'template001',
                name: 'template 001',
                baseTemplates: {
                  nodes: [
                    {
                      templateId: 'a87a00b1-e6db-45ab-8b54-636fec3b5523',
                    },
                  ],
                },
              },
              children: {
                nodes: [
                  {
                    path: '/sitecore/content/Home/Child1',
                    displayName: 'Child1',
                    itemId: '{3F8F699D-75FE-4DCE-A0C0-8C97F9CACE77}',
                    name: 'child1',
                    version: 1,
                    hasChildren: false,
                    thumbnailUrl: '/~/icon/Office/32x32/document_plain.png',
                    hasPresentation: false,
                    access: adminPermissions,
                    insertOptions: [],
                    createdAt: {
                      value: '20230428T111641Z',
                    },
                    updatedAt: {
                      value: '20230429T111641Z',
                    },
                    template: {
                      templateId: 'template001',
                      name: 'template 001',
                      baseTemplates: {
                        nodes: [
                          {
                            templateId: '76036f5e-cbce-46d1-af0a-4143f9b557aa',
                          },
                        ],
                      },
                    },
                    ancestors: [],
                    parent: { itemId: 'child1ParentId' },
                    pageDesignId: {
                      value: 'pageDesignId2',
                    },
                  },
                ],
              },
              ancestors: [],
              parent: { itemId: 'parentId1' },
              pageDesignId: {
                value: 'pageDesignId1',
              },
            } as any),
          );

          await firstValueFrom(sut.getContentTreeData('siteName', 'en', 'itemDoesNotExist'));
          tick();

          const pushNotificationResult = timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args[0];
          expect(pushNotificationResult.text).toContain('ERRORS.APP_RESET_TO_HOME');

          expect(baseContentTreeDalServiceSpy.getItemAncestors.calls.first().args[2]).toBe('itemDoesNotExist');
          expect(baseContentTreeDalServiceSpy.getItemAncestors.calls.mostRecent().args[2]).toBe('startItemId');

          flush();
        }));
      });
    });
  });
});
