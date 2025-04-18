/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ContentTreeNode } from 'app/pages/content-tree/content-tree-node';
import { ContentTreePermissions } from 'app/pages/content-tree/content-tree-permissions';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { Item } from 'app/shared/graphql/item.interface';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EMPTY, of } from 'rxjs';
import { ContentTreeLocking } from '../content-tree/content-tree-locking';
import { BaseContentTreeDalService } from '../content-tree/content-tree.service';
import { ContentTreeContainerService } from './content-tree-container.service';

const allowPermissions = new ContentTreePermissions({
  canWrite: true,
  canDelete: true,
  canRename: true,
  canCreate: true,
});

const itemLocking = new ContentTreeLocking({
  lockedByCurrentUser: false,
  isLocked: false,
});

const testNode = new ContentTreeNode({
  id: 'foo',
  item: {} as Item,
  text: 'Foo',
  permissions: allowPermissions,
  locking: itemLocking,
  hasChildren: false,
});
const testDropNode = new ContentTreeNode({
  id: 'foo-drop',
  item: {} as Item,
  text: 'FooDrop',
  permissions: allowPermissions,
  locking: itemLocking,
  hasChildren: false,
});

const siteName = 'website';
const language = 'en';
const nodeId = 'foo';
const movedItemName = 'FOO';
const targetItemName = 'Target';
const defaultContentRootItemId = 'root-item-id';
const startItem = { id: 'bar', version: 1 };

describe('ContentTreeContainerService', () => {
  let sut: ContentTreeContainerService;
  let timedNotificationsServiceSpy: jasmine.SpyObj<TimedNotificationsService>;
  let contentTreeDalService: jasmine.SpyObj<BaseContentTreeDalService>;
  let siteService: jasmine.SpyObj<SiteService>;
  let configurationService: jasmine.SpyObj<ConfigurationService>;

  beforeEach(waitForAsync(() => {
    const timedNotificationService = jasmine.createSpyObj<TimedNotificationsService>('TimedNotificationsService', [
      'push',
      'pushNotification',
    ]);

    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule],
      declarations: [],
      providers: [
        ContentTreeContainerService,
        {
          provide: TimedNotificationsService,
          useValue: timedNotificationService,
        },
        {
          provide: BaseContentTreeDalService,
          useValue: jasmine.createSpyObj<BaseContentTreeDalService>('content-tree-dal-service', {
            moveItem: EMPTY,
          }),
        },
        {
          provide: SiteService,
          useValue: jasmine.createSpyObj<SiteService>('SiteService', {
            getStartItem: EMPTY,
          }),
        },
        {
          provide: ConfigurationService,
          useValue: jasmine.createSpyObj<ConfigurationService>(
            {},
            {
              configuration$: of({
                primaryPlatformUrl: 'http://primary.com',
                additionalPlatformUrls: [],
                hostVerificationToken: '',
                contentRootItemId: defaultContentRootItemId,
                clientLanguage: 'da',
                sessionTimeoutSeconds: 1200,
                layoutServiceApiKey: '',
                jssEditingSecret: '',
                integrationVersion: '1.0.0.0',
                personalizeScope: '',
                globalTagsRepository: '',
                environmentFeatures: [],
              }),
            },
          ),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    timedNotificationsServiceSpy = TestBedInjectSpy(TimedNotificationsService);
    contentTreeDalService = TestBedInjectSpy(BaseContentTreeDalService);
    siteService = TestBedInjectSpy(SiteService);
    configurationService = TestBedInjectSpy(ConfigurationService);

    sut = new ContentTreeContainerService(
      TestBed.inject(TranslateService),
      contentTreeDalService,
      timedNotificationsServiceSpy,
      siteService,
      configurationService,
    );
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('moveItem', () => {
    it('should call ItemDal service', () => {
      contentTreeDalService.moveItem.and.returnValue(of({ success: true }));

      sut.moveItem(siteName, testNode, testDropNode, 'INTO').subscribe();
      const [itemId, targetId, site, position] = contentTreeDalService.moveItem.calls.mostRecent().args;

      expect(itemId).toBe(testNode.id);
      expect(targetId).toBe(testDropNode.id);
      expect(site).toBe(siteName);
      expect(position).toBe('INTO');
    });

    describe('AND ItemDal service returns success: true', () => {
      it('should return successful observer', () => {
        contentTreeDalService.moveItem.and.returnValue(of({ success: true }));
        const observerSpy = jasmine.createSpy();

        sut.moveItem(siteName, testNode, testDropNode, 'INTO').subscribe((value) => observerSpy(value));

        expect(observerSpy).toHaveBeenCalledWith({ success: true });
      });
    });

    describe('AND ItemDal service returns success: false', () => {
      it('should throw an error', () => {
        contentTreeDalService.moveItem.and.returnValue(of({ success: false }));
        const observerSpy = jasmine.createSpy();

        sut.moveItem(siteName, testNode, testDropNode, 'INTO').subscribe({
          next: () => {},
          error: (error) => observerSpy(error),
        });

        expect(observerSpy).toHaveBeenCalledWith({ success: false });
      });
    });
  });

  describe('showNotificationForCreationFailed', () => {
    describe('WHEN error code is "DuplicateItemName"', () => {
      it('should show appropriate error notification', async () => {
        await sut.showNotificationForCreationFailed('DuplicateItemName', testNode);

        const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;

        expect(id).toBe('CreatePageFailed-' + testNode.id);
        expect(text).toBe(`EDITOR.ITEM_ALREADY_DEFINED_ON_THIS_LEVEL {"name":"${testNode.text}"}`);
        expect(severity).toBe('error');
      });
    });

    describe('WHEN error code is "InvalidItemName"', () => {
      it('should show appropriate error notification', async () => {
        await sut.showNotificationForCreationFailed('InvalidItemName', testNode);

        const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;

        expect(id).toBe('CreatePageFailed-' + testNode.id);
        expect(text).toBe(`EDITOR.CREATE_ITEM_NOT_VALID_NAME {"name":"${testNode.text}"}`);
        expect(severity).toBe('error');
      });
    });

    describe('WHEN error code is not specific AND node is a Folder', () => {
      it('should show appropriate error notification', async () => {
        const node = new ContentTreeNode({
          id: 'foo',
          item: {} as Item,
          text: 'Foo',
          permissions: allowPermissions,
          locking: itemLocking,
          hasChildren: false,
          isFolder: true,
        });

        await sut.showNotificationForCreationFailed('UnknownError', node);

        const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;

        expect(id).toBe('CreatePageFailed-' + node.id);
        expect(text).toBe(`EDITOR.CREATE_FOLDER_FAILED {"name":"${node.text}"}`);
        expect(severity).toBe('error');
      });
    });

    describe('WHEN error code is not specific AND node is a Page', () => {
      it('should show appropriate error notification', async () => {
        const node = new ContentTreeNode({
          id: 'foo',
          item: {} as Item,
          text: 'Foo',
          permissions: allowPermissions,
          locking: itemLocking,
          hasChildren: false,
          isFolder: false,
        });

        await sut.showNotificationForCreationFailed('UnknownError', node);

        const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;

        expect(id).toBe('CreatePageFailed-' + node.id);
        expect(text).toBe(`EDITOR.CREATE_PAGE_FAILED {"name":"${node.text}"}`);
        expect(severity).toBe('error');
      });
    });
  });

  describe('showNotificationCreationEmptyName', () => {
    describe('WHEN node is a Folder', () => {
      it('should show appropriate error notification', async () => {
        const node = new ContentTreeNode({
          id: 'foo',
          item: {} as Item,
          text: 'Foo',
          permissions: allowPermissions,
          locking: itemLocking,
          hasChildren: false,
          isFolder: true,
        });

        await sut.showNotificationCreationEmptyName(node);

        const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;

        expect(id).toBe('CreatePageFailed-empty');
        expect(text).toBe(`EDITOR.CREATE_FOLDER_EMPTY_NAME`);
        expect(severity).toBe('error');
      });
    });

    describe('WHEN node is a Page', () => {
      it('should show appropriate error notification', async () => {
        const node = new ContentTreeNode({
          id: 'foo',
          item: {} as Item,
          text: 'Foo',
          permissions: allowPermissions,
          locking: itemLocking,
          hasChildren: false,
          isFolder: false,
        });

        await sut.showNotificationCreationEmptyName(node);

        const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;

        expect(id).toBe('CreatePageFailed-empty');
        expect(text).toBe(`EDITOR.CREATE_PAGE_EMPTY_NAME`);
        expect(severity).toBe('error');
      });
    });
  });

  describe('showNotificationForRenameError', () => {
    describe('WHEN error code is "ItemNotFound"', () => {
      it('should show appropriate error notification', async () => {
        await sut.showNotificationForRenameError('ItemNotFound');

        const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;

        expect(id).toBe('RenameError-ItemNotFound');
        expect(text).toBe(`ERRORS.ITEM_NOT_FOUND`);
        expect(severity).toBe('error');
      });
    });

    describe('WHEN error code is "ItemIsLocked"', () => {
      it('should show appropriate error notification', async () => {
        await sut.showNotificationForRenameError('ItemIsLocked');

        const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;

        expect(id).toBe('RenameError-ItemIsLocked');
        expect(text).toBe('EDITOR.CHANGE_DISPLAY_NAME.ERRORS.ITEM_IS_LOCKED');
        expect(severity).toBe('error');
      });
    });

    describe('WHEN error code is "ItemIsReadOnly"', () => {
      it('should show appropriate error notification', async () => {
        await sut.showNotificationForRenameError('ItemIsReadOnly');

        const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;

        expect(id).toBe('RenameError-ItemIsReadOnly');
        expect(text).toBe('EDITOR.CHANGE_DISPLAY_NAME.ERRORS.INSUFFICIENT_PRIVILEGES');
        expect(severity).toBe('error');
      });
    });

    describe('WHEN error code is "InsufficientLanguagePrivileges"', () => {
      it('should show appropriate error notification', async () => {
        await sut.showNotificationForRenameError('InsufficientLanguagePrivileges');

        const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;

        expect(id).toBe('RenameError-InsufficientLanguagePrivileges');
        expect(text).toBe('EDITOR.CHANGE_DISPLAY_NAME.ERRORS.INSUFFICIENT_PRIVILEGES');
        expect(severity).toBe('error');
      });
    });

    describe('WHEN error code is "ItemIsFallback"', () => {
      it('should show appropriate error notification', async () => {
        await sut.showNotificationForRenameError('ItemIsFallback');

        const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;

        expect(id).toBe('RenameError-ItemIsFallback');
        expect(text).toBe('EDITOR.CHANGE_DISPLAY_NAME.ERRORS.ITEM_IS_FALLBACK');
        expect(severity).toBe('error');
      });
    });
  });

  describe('showNodeMoveSuccessNotification', () => {
    describe('WHEN position is "INTO"', () => {
      it('should show appropriate success notification', async () => {
        const actionRunFunc = jasmine.createSpy('actionRunFunc');

        await sut.showNodeMoveSuccessNotification(nodeId, movedItemName, targetItemName, 'INTO', actionRunFunc);
        const [{ id, text, severity, action, persistent }] =
          timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args;
        action!.run();

        expect(id).toBe(`MoveItemSuccess-${nodeId}-1`);
        expect(text).toBe(
          `EDITOR.CONTENT_TREE.MOVE_ITEM_INTO_SUCCESS {"movedItemName":"${movedItemName}","targetItemName":"${targetItemName}"}`,
        );
        expect(severity).toBe('success');
        expect(action).toEqual({
          title: `NAV.UNDO {"movedItemName":"${movedItemName}","targetItemName":"${targetItemName}"}`,
          run: jasmine.any(Function),
        });
        expect(actionRunFunc).toHaveBeenCalledTimes(1);
        expect(persistent).toBe(false);
      });
    });

    describe('WHEN position is "AFTER"', () => {
      it('should show appropriate success notification', async () => {
        const actionRunFunc = jasmine.createSpy('actionRunFunc');

        await sut.showNodeMoveSuccessNotification(nodeId, movedItemName, targetItemName, 'AFTER', actionRunFunc);
        const [{ id, text, severity, action, persistent }] =
          timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args;
        action!.run();

        expect(id).toBe(`MoveItemSuccess-${nodeId}-1`);
        expect(text).toBe(
          `EDITOR.CONTENT_TREE.MOVE_ITEM_AFTER_SUCCESS {"movedItemName":"${movedItemName}","targetItemName":"${targetItemName}"}`,
        );
        expect(severity).toBe('success');
        expect(action).toEqual({
          title: `NAV.UNDO {"movedItemName":"${movedItemName}","targetItemName":"${targetItemName}"}`,
          run: jasmine.any(Function),
        });
        expect(actionRunFunc).toHaveBeenCalledTimes(1);
        expect(persistent).toBe(false);
      });
    });

    describe('WHEN position is "BEFORE"', () => {
      it('should show appropriate success notification', async () => {
        const actionRunFunc = jasmine.createSpy('actionRunFunc');

        await sut.showNodeMoveSuccessNotification(nodeId, movedItemName, targetItemName, 'BEFORE', actionRunFunc);
        const [{ id, text, severity, action, persistent }] =
          timedNotificationsServiceSpy.pushNotification.calls.mostRecent().args;
        action!.run();

        expect(id).toBe(`MoveItemSuccess-${nodeId}-1`);
        expect(text).toBe(
          `EDITOR.CONTENT_TREE.MOVE_ITEM_BEFORE_SUCCESS {"movedItemName":"${movedItemName}","targetItemName":"${targetItemName}"}`,
        );
        expect(severity).toBe('success');
        expect(action).toEqual({
          title: `NAV.UNDO {"movedItemName":"${movedItemName}","targetItemName":"${targetItemName}"}`,
          run: jasmine.any(Function),
        });
        expect(actionRunFunc).toHaveBeenCalledTimes(1);
        expect(persistent).toBe(false);
      });
    });
  });

  describe('showNodeMoveErrorNotification', () => {
    it('should show appropriate error notification', async () => {
      await sut.showNodeMoveErrorNotification(testNode.id, testNode.text);

      const [id, text, severity] = timedNotificationsServiceSpy.push.calls.mostRecent().args;

      expect(id).toBe(`MoveItemError-${testNode.id}`);
      expect(text).toBe(`EDITOR.CONTENT_TREE.MOVE_ITEM_ERROR {"name":"${testNode.text}"}`);
      expect(severity).toBe('error');
    });
  });

  describe('getStartItemId', () => {
    it('should call site Dal Service', () => {
      siteService.getStartItem.and.returnValue(of(startItem));

      sut.getStartItemId(siteName, language).subscribe();
      const [site, itemLanguage] = siteService.getStartItem.calls.mostRecent().args;

      expect(site).toBe(siteName);
      expect(itemLanguage).toBe(language);
    });

    describe('AND siteDal service return startItemId', () => {
      it('should return startItemId observable', () => {
        siteService.getStartItem.and.returnValue(of(startItem));
        const observerSpy = jasmine.createSpy();

        sut.getStartItemId(siteName, language).subscribe((value) => observerSpy(value));

        expect(observerSpy).toHaveBeenCalledWith(startItem.id);
      });
    });
  });

  describe('getContentRootItemId', () => {
    it('should return defaultContentRootItemId observable', () => {
      const observerSpy = jasmine.createSpy();
      sut.getContentRootItemId().subscribe((value) => observerSpy(value));

      sut.getContentRootItemId();

      expect(observerSpy).toHaveBeenCalledWith(defaultContentRootItemId);
    });
  });
});
