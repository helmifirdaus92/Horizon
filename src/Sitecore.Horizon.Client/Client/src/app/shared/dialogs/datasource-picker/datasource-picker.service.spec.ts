/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed, waitForAsync } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { BaseContentTreeDalService, CreateItemErrorCode } from 'app/pages/content-tree/content-tree.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { TestBedInjectSpy, createSpyObserver } from 'app/testing/test.utils';
import { EMPTY, of } from 'rxjs';
import { DatasourcePickerService } from './datasource-picker.service';
import { DatasourceDalService, RawItem, RawItemAncestor } from './datasource.dal.service';

describe(DatasourcePickerService.name, () => {
  let sut: DatasourcePickerService;
  let translateService: jasmine.SpyObj<TranslateService>;
  let datasourceDalService: jasmine.SpyObj<DatasourceDalService>;
  let timedNotificationsService: jasmine.SpyObj<TimedNotificationsService>;
  let baseContentTreeDalService: jasmine.SpyObj<BaseContentTreeDalService>;

  const ContextValue: Partial<ContextService> = {
    itemId: 'item',
    language: 'lang',
    siteName: 'site',
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        DatasourcePickerService,
        { provide: ContextService, useValue: ContextValue },
        {
          provide: DatasourceDalService,
          useValue: jasmine.createSpyObj<DatasourceDalService>({
            createRawItem: EMPTY,
            getRenderingDefinition: EMPTY,
            resolveDatasource: EMPTY,
            getAncestorsWithSiblings: EMPTY,
            getChildren: EMPTY,
            resolveDataSourceAndSiblings: EMPTY,
          }),
        },
        { provide: TimedNotificationsService, useValue: jasmine.createSpyObj<TimedNotificationsService>(['push']) },
        {
          provide: TranslateService,
          useValue: jasmine.createSpyObj<TranslateService>({
            get: of('translation'),
          }),
        },
        {
          provide: BaseContentTreeDalService,
          useValue: jasmine.createSpyObj<BaseContentTreeDalService>({
            duplicateItem: of({ id: 'duplicateItemID', path: 'duplicatePath', displayName: 'duplicateItemName' }),
          }),
        },
      ],
    });
  }));

  beforeEach(() => {
    datasourceDalService = TestBedInjectSpy(DatasourceDalService);
    timedNotificationsService = TestBedInjectSpy(TimedNotificationsService);
    translateService = TestBedInjectSpy(TranslateService);
    baseContentTreeDalService = TestBedInjectSpy(BaseContentTreeDalService);

    sut = TestBed.inject(DatasourcePickerService);
  });

  it('should create', () => {
    expect(sut).toBeTruthy();
  });

  describe('createRawItem', () => {
    it('should proxy DAL service createRawItem with context language and site', () => {
      const result = {
        id: 'id',
        displayName: 'name',
        isFolder: true,
      };
      const spy = createSpyObserver();

      datasourceDalService.createRawItem.and.returnValue(of(result));
      sut.createRawItem('parentId', 'itemName', 'templateId').subscribe(spy);

      expect(datasourceDalService.createRawItem).toHaveBeenCalledWith(
        'lang',
        'site',
        'parentId',
        'itemName',
        'templateId',
      );
      expect(spy.next).toHaveBeenCalledWith(result);
    });
  });

  describe('getRenderingDefinition', () => {
    it('should proxy DAL service getRenderingDefinition with context language and site', () => {
      const result = {
        datasourceRootItems: [],
        templates: [],
      };
      const spy = createSpyObserver();

      datasourceDalService.getRenderingDefinition.and.returnValue(of(result));
      sut.getRenderingDefinition('renderingId').subscribe(spy);

      expect(datasourceDalService.getRenderingDefinition).toHaveBeenCalledWith('renderingId', 'item', 'lang', 'site');
      expect(spy.next).toHaveBeenCalledWith(result);
    });
  });

  describe('resolveDatasource', () => {
    it('should proxy DAL service resolveDatasource with context language and site', () => {
      const result = {
        id: 'id',
      };
      const spy = createSpyObserver();

      datasourceDalService.resolveDatasource.and.returnValue(of(result));
      sut.resolveDatasource('datasrc').subscribe(spy);

      expect(datasourceDalService.resolveDatasource).toHaveBeenCalledWith('datasrc', 'item', 'lang', 'site');
      expect(spy.next).toHaveBeenCalledWith(result);
    });
  });

  describe('resolveDatasource', () => {
    it('should proxy DAL service resolveDatasource with context language and site', () => {
      const result = [] as RawItemAncestor[];
      const spy = createSpyObserver();

      datasourceDalService.getAncestorsWithSiblings.and.returnValue(of(result));
      sut.fetchFlatTree('path', ['one'], ['two']).subscribe(spy);

      expect(datasourceDalService.getAncestorsWithSiblings).toHaveBeenCalledWith(
        'path',
        'lang',
        'site',
        ['one'],
        ['two'],
      );
      expect(spy.next).toHaveBeenCalledWith(result);
    });
  });

  describe('mapTreeFromRawItemToTreeNode', () => {
    it('should map RawItem to TreeNode', () => {
      const test: RawItem = {
        id: 'id',
        path: 'path',
        displayName: 'name',
        isFolder: true,
        template: {
          id: 'idTmp',
          isCompatible: false,
          baseTemplateIds: [],
        },
        hasChildren: true,
        children: [
          {
            id: 'id2',
            path: 'path2',
            displayName: 'name2',
            isFolder: false,
            hasChildren: false,
            template: {
              id: 'idTmp2',
              isCompatible: true,
              baseTemplateIds: [],
            },
          },
          {
            id: 'DraftId-3',
            path: 'path3',
            displayName: 'name',
            isFolder: false,
            hasChildren: false,
            template: {
              id: 'idTmp2',
              isCompatible: true,
              baseTemplateIds: [],
            },
          },
        ],
      };

      expect(sut.mapTreeFromRawItemToTreeNode(test)).toEqual({
        id: 'id',
        path: 'path',
        displayName: 'name',
        isFolder: true,
        hasChildren: true,
        isSelectable: false,
        isCompatible: false,
        enableEdit: false,
        children: [
          {
            id: 'id2',
            path: 'path2',
            displayName: 'name2',
            isFolder: false,
            hasChildren: false,
            isSelectable: true,
            isCompatible: true,
            enableEdit: false,
            children: undefined,
            template: { id: 'idTmp2', baseTemplateIds: [] },
          },
          {
            id: 'draftid-3',
            path: 'path3',
            displayName: 'name',
            isFolder: false,
            hasChildren: false,
            isSelectable: true,
            isCompatible: true,
            enableEdit: true,
            children: undefined,
            template: { id: 'idTmp2', baseTemplateIds: [] },
          },
        ],
        template: { id: 'idTmp', baseTemplateIds: [] },
      });
    });
  });

  describe('fetchChildren', () => {
    it('should proxy DAL service fetchChildren with context language and site', () => {
      const result = [] as RawItem[];
      const compatibleTemplates$ = of(['tmpId']);
      const spy = createSpyObserver();

      datasourceDalService.getChildren.and.returnValue(of(result));
      sut.fetchChildren('path', compatibleTemplates$).subscribe(spy);

      expect(datasourceDalService.getChildren).toHaveBeenCalledWith('path', 'lang', 'site', compatibleTemplates$);
      expect(spy.next).toHaveBeenCalledWith(result);
    });
  });

  describe('showNotificationForCreationFailed', () => {
    const codes: Array<[CreateItemErrorCode, string]> = [
      ['DuplicateItemName', 'EDITOR.ITEM_ALREADY_DEFINED_ON_THIS_LEVEL'],
      ['InvalidItemName', 'EDITOR.CREATE_ITEM_NOT_VALID_NAME'],
      ['UnknownError', 'EDITOR.CREATE_ITEM_FAILED'],
    ];
    codes.forEach(([code, expectedTranslationKey]) => {
      it(`[code: '${code}', expectedTranslationKey: '${expectedTranslationKey}'] should get the translation and push an error notification`, async () => {
        // act
        await sut.showNotificationForCreationFailed(code, 'name');

        // assert
        expect(translateService.get).toHaveBeenCalledWith(expectedTranslationKey, { name: 'name' });
        expect(timedNotificationsService.push).toHaveBeenCalledWith(
          'CreateItemFailed-name',
          'translation',
          'error',
          'dialog',
        );
      });
    });
  });

  describe('generateDraftRawItem', () => {
    it('should generate a draft RawItem', async () => {
      translateService.get.and.callFake((str) => of(str));
      const result = await sut.generateDraftRawItem('tempID');

      expect(result).toEqual({
        id: jasmine.any(String),
        path: '/draft/path',
        displayName: 'EDITOR.ITEMS_BROWSER.NEW_CONTENT_ITEM',
        hasChildren: false,
        isFolder: false,
        template: {
          id: 'tempID',
          isCompatible: true,
          baseTemplateIds: [],
        },
      });
      expect(result.id).toContain('DraftId-');
    });
  });

  describe('Duplicate item', () => {
    it('should call dal service', async () => {
      sut.duplicateItem('id', 'name').subscribe();

      expect(baseContentTreeDalService.duplicateItem).toHaveBeenCalledOnceWith('id', 'name', 'lang', 'site');
    });

    it('should set local datasource if original is local', async () => {
      baseContentTreeDalService.duplicateItem.and.returnValue(
        of({ id: 'duplicateItemID', path: '/sitecore/a/b/c/Data/Ds002', displayName: 'dn' }),
      );
      datasourceDalService.resolveDataSourceAndSiblings.and.returnValue(
        of({ id: 'id001', name: 'name001', path: '/sitecore/a/b/c/Data/Ds001', siblings: [] }),
      );

      const result = await sut.duplicateDataSource('local:/Data/Ds001');

      expect(result).toEqual({ itemId: 'duplicateItemID', layoutRecord: 'local:/Data/Ds002' });
    });
  });
});
