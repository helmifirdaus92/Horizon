/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, Output, Pipe, PipeTransform, TemplateRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderWithButtonModule } from '@sitecore/ng-spd-lib';
import { BaseContentTreeDalService } from 'app/pages/content-tree/content-tree.service';
import { Context } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { normalizeGuid } from 'app/shared/utils/utils';
import { TestBedInjectSpy, createSpyObserver } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EMPTY, of, throwError } from 'rxjs';
import { ContextMenuState, TreeNode } from '../../../shared/item-tree/item-tree.component';
import { ContextMenuActionInvoke } from './context-menu/datasource-picker-context-menu.component';
import { DataSourcePickerSelect, DatasourcePickerComponent } from './datasource-picker.component';
import { TemplatePickerResult } from './datasource-template-picker/datasource-template-picker.component';
import { DatasourceDalService, RawItemAncestor, RenderingDefinition } from './datasource.dal.service';

function mostRecentCallFirstArg(spy: jasmine.Spy) {
  return spy.calls.mostRecent().args[0];
}

@Component({
  selector: 'app-datasource-picker-context-menu',
  template: '',
})
class TestContextMenuComponent {
  @Input() node: any;
  @Output() invokeAction = new EventEmitter<ContextMenuActionInvoke>();
  emitContextMenuActionInvoke(value: ContextMenuActionInvoke) {
    this.invokeAction.emit(value);
  }
}

@Component({
  selector: 'app-item-tree',
  template: `<ng-container [ngTemplateOutlet]="contextMenu"></ng-container>`,
})
class TestTreeComponent {
  @Input() contextMenu?: TemplateRef<any>;
  @Input() contextMenuState?: ContextMenuState;
  @Input() highlightIncompatibleNodes = false;

  dataSpy = jasmine.createSpy('data');
  @Input() set data(value: TreeNode[]) {
    this.dataSpy(value);
  }

  selectSpy = jasmine.createSpy('select');
  @Input() set select(value: TreeNode[]) {
    this.selectSpy(value);
  }

  getChildrenSpy = jasmine.createSpy('getChildren');
  @Input() set getChildren(value: TreeNode[]) {
    this.getChildrenSpy(value);
  }

  @Output() selectChange = new EventEmitter<DataSourcePickerSelect>();
  emitSelectChange(value: DataSourcePickerSelect) {
    this.selectChange.emit(value);
  }
}

@Pipe({ name: 'normalizeGuid' })
export class NormalizeGuidTestPipe implements PipeTransform {
  transform(value: any) {
    return value;
  }
}

@Component({
  selector: 'app-datasource-template-picker',
  template: '',
})
class TestTemplatePickerComponent {
  @Input() renderingDefinition: RenderingDefinition | undefined = undefined;
  @Input() item: { id: string; template?: { id: string; baseTemplateIds: string[] } } | undefined = undefined;
  @Output() result = new EventEmitter<TemplatePickerResult>();
}

describe(DatasourcePickerComponent.name, () => {
  let sut: DatasourcePickerComponent;
  let fixture: ComponentFixture<DatasourcePickerComponent>;
  let testTree: TestTreeComponent;
  let datasourceSevice: jasmine.SpyObj<DatasourceDalService>;
  let context: ContextServiceTesting;

  const defaultContentRootItemId = 'root-item-id';
  const defaultRootItems = [
    { id: 'root1', template: { id: 'temp1', isPageDataFolder: false } },
    { id: 'root2', template: { id: 'temp2', isPageDataFolder: false } },
  ];

  const defaultRenderingDef: RenderingDefinition = {
    datasourceRootItems: defaultRootItems.map(({ id, template }) => ({ id, template })),
    templates: [
      { id: 'template1', name: 'template1', displayName: 'template1', path: '' },
      { id: 'template2', name: 'template2', displayName: 'template2', path: '' },
    ],
  };

  const testContextMenu = () => fixture.debugElement.query(By.directive(TestContextMenuComponent)).componentInstance;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ContextServiceTestingModule, TranslateModule, TranslateServiceStubModule, HeaderWithButtonModule],
      declarations: [
        DatasourcePickerComponent,
        TestTreeComponent,
        TestContextMenuComponent,
        TestTemplatePickerComponent,
        NormalizeGuidTestPipe,
      ],
      providers: [
        {
          provide: DatasourceDalService,
          useValue: jasmine.createSpyObj<DatasourceDalService>('DatasourceService', {
            getAncestorsWithSiblings: EMPTY,
            getChildren: EMPTY,
            getRenderingDefinition: EMPTY,
            resolveDatasource: EMPTY,
            createRawItem: EMPTY,
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
                environmentFeatures: [],
                globalTagsRepository: '',
                personalizeScope: 'sitecore',
              }),
            },
          ),
        },
        {
          provide: TimedNotificationsService,
          useValue: jasmine.createSpyObj<TimedNotificationsService>(['push']),
        },
        {
          provide: BaseContentTreeDalService,
          useValue: jasmine.createSpyObj<BaseContentTreeDalService>({
            duplicateItem: of({ id: 'duplicateItemID', path: 'duplicateItemPath', displayName: 'duplicateItemName' }),
          }),
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatasourcePickerComponent);
    sut = fixture.componentInstance;
    testTree = fixture.debugElement.query(By.directive(TestTreeComponent)).componentInstance;

    const contextValue: Context = { itemId: 'idontcare', language: 'cat', siteName: 'goodbikes.com' };
    context = TestBed.inject(ContextServiceTesting);
    context.provideTestValue(contextValue);

    datasourceSevice = TestBedInjectSpy(DatasourceDalService);

    datasourceSevice.resolveDatasource.and.callFake((source) => of({ id: source }));

    datasourceSevice.getAncestorsWithSiblings
      .withArgs(
        'invalid',
        context.language,
        context.siteName,
        defaultRenderingDef.templates.map((template) => template.id),
        defaultRootItems.map((root) => root.id),
      )
      .and.returnValue(throwError(() => 'ItemNotFound'))
      .withArgs(
        'itemoutofscope',
        context.language,
        context.siteName,
        defaultRenderingDef.templates.map((template) => template.id),
        defaultRootItems.map((root) => root.id),
      )
      .and.returnValue(throwError(() => 'RootNotReachable'));

    datasourceSevice.getRenderingDefinition
      .withArgs('noroots', context.itemId, context.language, context.siteName)
      .and.returnValue(
        of({
          datasourceRootItems: [],
          templates: defaultRenderingDef.templates,
        }),
      )
      .withArgs('notemplates', context.itemId, context.language, context.siteName)
      .and.returnValue(
        of({
          datasourceRootItems: defaultRenderingDef.datasourceRootItems,
          templates: [],
        }),
      )
      .and.returnValue(of(defaultRenderingDef));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(sut).toBeTruthy();
  });

  it('should forward the datasource to the tree', () => {
    const value = 'abc';
    sut.rawDatasource$ = of('abc');
    fixture.detectChanges();

    expect(testTree.selectSpy).toHaveBeenCalledWith(value);
  });

  describe('fetch tree data', () => {
    const itemId = 'foo';
    const datasource = '123';

    describe('datasource is supplied', () => {
      it('should fetch tree data for supplied datasource', () => {
        sut.renderingId$ = of(itemId);
        sut.rawDatasource$ = of(datasource);
        fixture.detectChanges();

        expect(datasourceSevice.getAncestorsWithSiblings).toHaveBeenCalledWith(
          datasource,
          context.language,
          context.siteName,
          defaultRenderingDef.templates.map((template) => template.id),
          defaultRootItems.map((root) => root.id),
        );
      });

      it('should resolve raw datasource', () => {
        // arrange & act
        sut.renderingId$ = of(itemId);
        sut.rawDatasource$ = of(datasource);
        fixture.detectChanges();

        // assert
        expect(datasourceSevice.resolveDatasource).toHaveBeenCalledWith(
          datasource,
          context.itemId,
          context.language,
          context.siteName,
        );
      });

      it('should not resolve when raw datasource is not supplied', () => {
        // arrange & act
        sut.renderingId$ = of(itemId);
        sut.rawDatasource$ = of('');
        fixture.detectChanges();

        // assert
        expect(datasourceSevice.resolveDatasource).not.toHaveBeenCalled();
      });

      it('should return empty string on InvalidDataSource error while resolving raw datasource', () => {
        // arrange
        const resultObserver = createSpyObserver();
        datasourceSevice.resolveDatasource.and.returnValue(throwError(() => 'InvalidDataSource'));

        // act
        sut.renderingId$ = of(itemId);
        sut.rawDatasource$ = of('invalid');
        fixture.detectChanges();
        sut.datasource$.subscribe(resultObserver);

        // assert
        expect(resultObserver.next).toHaveBeenCalledTimes(1);
        expect(resultObserver.next).toHaveBeenCalledWith('');
      });

      it('should supply the data to the tree', () => {
        const parentNode: RawItemAncestor = {
          displayName: 'dark node',
          id: 'Vader',
          path: 'VaderPath',
          hasChildren: true,
          isFolder: false,
          parentId: '-',
          template: { id: '1', isCompatible: true, baseTemplateIds: [] },
          children: undefined,
        };

        const childNode: RawItemAncestor = {
          displayName: 'dark node',
          id: 'Vaderson',
          path: 'VadersonPath',
          hasChildren: false,
          isFolder: false,
          parentId: 'Vader',
          template: { id: '1', isCompatible: false, baseTemplateIds: [] },
          children: undefined,
        };

        datasourceSevice.getAncestorsWithSiblings.and.returnValue(of([parentNode, childNode]));
        sut.renderingId$ = of(itemId);
        sut.rawDatasource$ = of(datasource);
        fixture.detectChanges();

        const result: TreeNode[] = mostRecentCallFirstArg(testTree.dataSpy);
        // check expect separately because if it doesn't match its easier to spot what failed
        expect(result).toEqual([
          {
            displayName: parentNode.displayName,
            hasChildren: true,
            id: normalizeGuid(parentNode.id),
            path: parentNode.path,
            isSelectable: true,
            isFolder: false,
            children: jasmine.anything(),
            isCompatible: true,
            enableEdit: false,
            isRoot: true,
            template: { id: parentNode.template.id, baseTemplateIds: [] },
          },
        ]);
        expect(result[0].children).toEqual([
          {
            displayName: childNode.displayName,
            hasChildren: false,
            id: normalizeGuid(childNode.id),
            path: childNode.path,
            isSelectable: false,
            isFolder: false,
            children: undefined,
            isCompatible: false,
            enableEdit: false,
            template: { id: childNode.template.id, baseTemplateIds: [] },
          },
        ]);
      });
    });

    describe('datasource is not supplied', () => {
      it('should fetch tree data for the first datasource root', () => {
        sut.renderingId$ = of(itemId);
        sut.rawDatasource$ = of('');
        fixture.detectChanges();

        expect(datasourceSevice.getAncestorsWithSiblings).toHaveBeenCalledWith(
          defaultRootItems[0].id,
          context.language,
          context.siteName,
          defaultRenderingDef.templates.map((template) => template.id),
          defaultRootItems.map((root) => root.id),
        );
      });
    });

    describe('datasource is not valid', () => {
      it('should fetch tree data for the default datasource', () => {
        sut.renderingId$ = of(itemId);
        sut.rawDatasource$ = of('invalid');
        fixture.detectChanges();

        expect(datasourceSevice.getAncestorsWithSiblings).toHaveBeenCalledTimes(2);
        expect(datasourceSevice.getAncestorsWithSiblings).toHaveBeenCalledWith(
          'invalid',
          context.language,
          context.siteName,
          defaultRenderingDef.templates.map((template) => template.id),
          defaultRootItems.map((root) => root.id),
        );
        expect(datasourceSevice.getAncestorsWithSiblings).toHaveBeenCalledWith(
          defaultRootItems[0].id,
          context.language,
          context.siteName,
          defaultRenderingDef.templates.map((template) => template.id),
          defaultRootItems.map((root) => root.id),
        );
      });

      describe('AND datasource is out of roots', () => {
        it('should fetch tree data for the default datasource', () => {
          sut.renderingId$ = of(itemId);
          sut.rawDatasource$ = of('itemoutofscope');
          fixture.detectChanges();

          expect(datasourceSevice.getAncestorsWithSiblings).toHaveBeenCalledTimes(2);
          expect(datasourceSevice.getAncestorsWithSiblings).toHaveBeenCalledWith(
            'itemoutofscope',
            context.language,
            context.siteName,
            defaultRenderingDef.templates.map((template) => template.id),
            defaultRootItems.map((root) => root.id),
          );
          expect(datasourceSevice.getAncestorsWithSiblings).toHaveBeenCalledWith(
            defaultRootItems[0].id,
            context.language,
            context.siteName,
            defaultRenderingDef.templates.map((template) => template.id),
            defaultRootItems.map((root) => root.id),
          );
        });
      });

      describe('AND there are not datasource roots', () => {
        it('should fetch tree data for the default datasource root', () => {
          sut.renderingId$ = of('noroots');
          sut.rawDatasource$ = of('');

          fixture.detectChanges();

          expect(datasourceSevice.getAncestorsWithSiblings).toHaveBeenCalledWith(
            defaultContentRootItemId,
            context.language,
            context.siteName,
            defaultRenderingDef.templates.map((template) => template.id),
            [],
          );
        });
      });
    });
  });

  describe('is node selectable', () => {
    const itemId = 'foo';
    const datasource = '123';

    describe('AND there are compatible templates', () => {
      it('should set isCompatible based on template compatibility returned by the service', () => {
        const parentNode: RawItemAncestor = {
          displayName: 'dark node',
          id: 'Vader',
          path: 'VaderPath',
          hasChildren: true,
          isFolder: false,
          parentId: '-',
          template: { id: '1', isCompatible: true, baseTemplateIds: [] },
          children: undefined,
        };

        const childNode: RawItemAncestor = {
          displayName: 'dark node',
          id: 'Vaderson',
          path: 'VadersonPath',
          hasChildren: false,
          isFolder: false,
          parentId: 'Vader',
          template: { id: '1', isCompatible: false, baseTemplateIds: [] },
          children: undefined,
        };
        datasourceSevice.getAncestorsWithSiblings.and.returnValue(of([parentNode, childNode]));

        sut.renderingId$ = of(itemId);
        sut.rawDatasource$ = of(datasource);
        fixture.detectChanges();

        const result: TreeNode[] = mostRecentCallFirstArg(testTree.dataSpy);
        expect(result[0].isCompatible).toBe(true);
        expect(result[0].children![0].isCompatible).toBe(false);
      });

      it('should take provided compatible templates and ignore template compatibility returned by the service', async () => {
        const compatibleTemplateIds = ['template001', 'template002'];
        sut.datasourcePickerOptions = { compatibleTemplateIds };
        sut.renderingId$ = of(itemId);
        sut.rawDatasource$ = of(datasource);

        fixture.detectChanges();

        const baseTemplateIdsArgument = datasourceSevice.getAncestorsWithSiblings.calls.mostRecent().args[3];
        expect(baseTemplateIdsArgument).toEqual(compatibleTemplateIds);
      });

      it('should take compatible templates from rendering definition when compatible templates are not provided', async () => {
        sut.datasourcePickerOptions = undefined;
        sut.renderingId$ = of(itemId);
        sut.rawDatasource$ = of(datasource);

        fixture.detectChanges();

        const baseTemplateIdsArgument = datasourceSevice.getAncestorsWithSiblings.calls.mostRecent().args[3];
        expect(baseTemplateIdsArgument).toEqual(defaultRenderingDef.templates.map((t) => t.id));
      });
    });

    describe('AND there are no compatible templates', () => {
      it('should make all nodes selectable', () => {
        const parentNode: RawItemAncestor = {
          displayName: 'dark node',
          id: 'Vader',
          path: 'VaderPath',
          hasChildren: true,
          isFolder: true,
          parentId: '-',
          template: { id: '1', isCompatible: false, baseTemplateIds: [] },
          children: undefined,
        };

        const childNode: RawItemAncestor = {
          displayName: 'dark node',
          id: 'Vaderson',
          path: 'VadersonPath',
          hasChildren: false,
          isFolder: false,
          parentId: 'Vader',
          template: { id: '1', isCompatible: false, baseTemplateIds: [] },
          children: undefined,
        };

        datasourceSevice.getAncestorsWithSiblings.and.returnValue(of([parentNode, childNode]));

        sut.renderingId$ = of('notemplates');
        sut.rawDatasource$ = of(datasource);
        fixture.detectChanges();

        const result: TreeNode[] = mostRecentCallFirstArg(testTree.dataSpy);
        expect(result[0].isSelectable).toBe(true);
        expect(result[0].children![0].isSelectable).toBe(true);
      });
    });
  });

  describe('getChildren', () => {
    const node: TreeNode = {
      displayName: '',
      hasChildren: true,
      id: '',
      isFolder: false,
      isSelectable: false,
    };

    describe('AND node already has children', () => {
      it('should return the children of the node', () => {
        const child = { bar: 'foo' };

        expect(sut.getChildren({ ...node, children: [child as any] })).toEqual([child as any]);
      });
    });

    describe('AND node hasChildren but it isnt fetched', () => {
      it('should fetch the node children', () => {
        sut.getChildren(node);

        expect(datasourceSevice.getChildren).toHaveBeenCalledWith(
          node.id,
          context.language,
          context.siteName,
          jasmine.anything(),
        );
      });
    });

    describe('AND node indicates it doesnt have any children', () => {
      it('should return `[]`', () => {
        expect(sut.getChildren({ ...node, hasChildren: false })).toEqual([]);
      });
    });
  });

  describe('the tree emits a selectChange event', () => {
    const value = {
      id: 'order 46',
      isCompatible: true,
      isFolder: true,
      path: 'path',
    };

    it('should forward the event', () => {
      fixture.detectChanges();

      const spy = createSpyObserver();
      sut.selectChange.subscribe(spy);

      testTree.emitSelectChange(value);
      expect(spy.next).toHaveBeenCalledWith({
        id: value.id,
        path: value.path,
        isCompatible: value.isCompatible,
        templateId: undefined,
        parent: undefined,
      });
    });

    it('should update the select property', waitForAsync(() => {
      fixture.detectChanges();

      const result = createSpyObserver();
      sut.select$.subscribe(result);

      testTree.emitSelectChange(value);
      expect(result.next).toHaveBeenCalledWith({
        id: value.id,
        path: value.path,
        isCompatible: value.isCompatible,
        templateId: undefined,
        parent: undefined,
      });
    }));
  });

  describe('create item', () => {
    describe('Select a template', () => {
      describe('WHEN there is a selected item AND click on "Create item" button', () => {
        it('should switch to the template picker', () => {
          sut.rawDatasource$ = of('abc');
          sut.select$.next({
            id: 'testNodeId',
          } as DataSourcePickerSelect);
          fixture.detectChanges();

          testContextMenu().emitContextMenuActionInvoke({
            actionType: 'CreateNew',
            node: { id: 'testParentNodeId', isCompatible: true },
          });
          fixture.detectChanges();

          const templatePickerComp = fixture.debugElement.query(By.css('app-datasource-template-picker'));
          expect(templatePickerComp).toBeTruthy();
        });
      });
    });

    describe('WHEN select a template', () => {
      it('should create a temporary item in tree and set isBusy state', fakeAsync(() => {
        sut.renderingId$ = of('abc');
        sut.rawDatasource$ = of('Vader');
        testTree.emitSelectChange({
          id: 'Vader',
          path: 'VaderPath',
          isCompatible: true,
        });
        sut.templatePickerContext.node = { id: 'Vader' } as TreeNode;
        const parentNode: RawItemAncestor = {
          displayName: 'dark node',
          id: 'Vader',
          path: 'VaderPath',
          hasChildren: false,
          isFolder: false,
          parentId: '-',
          template: { id: '1', isCompatible: true, baseTemplateIds: [] },
          children: undefined,
        };

        datasourceSevice.getAncestorsWithSiblings.and.returnValue(of([parentNode]));
        fixture.detectChanges();
        sut.handleTemplatePickerResult({ kind: 'OK', templateId: '1' });
        tick(1);
        fixture.detectChanges();

        const result: TreeNode[] = mostRecentCallFirstArg(testTree.dataSpy);
        expect(result).toEqual([
          {
            id: 'vader',
            path: 'VaderPath',
            displayName: 'dark node',
            isFolder: false,
            hasChildren: true,
            isSelectable: true,
            isCompatible: true,
            enableEdit: false,
            isRoot: true,
            template: { id: '1', baseTemplateIds: [] },
            children: [
              {
                id: jasmine.any(String),
                path: jasmine.any(String),
                displayName: 'EDITOR.ITEMS_BROWSER.NEW_CONTENT_ITEM',
                isFolder: false,
                hasChildren: false,
                isSelectable: true,
                isCompatible: true,
                children: undefined,
                enableEdit: true,
                template: { id: '1', baseTemplateIds: [] },
              },
            ],
          },
        ]);
        expect(result[0]!.children![0].id).toContain('draftid-');
        expect(sut.isBusy).toBeTrue();
        flush();
      }));

      describe('AND submit editing', () => {
        it('should select new item and set isBusy state', fakeAsync(() => {
          const newNode = {
            id: 'draftid',
            displayName: 'new name',
            isFolder: false,
            isSelectable: true,
            hasChildren: false,
          };
          sut.renderingId$ = of('abc');
          sut.rawDatasource$ = of('Vader');
          sut.templatePickerContext.node = { id: 'previous selection' } as TreeNode;
          sut.handleTemplatePickerResult({
            templateId: '1',
            kind: 'OK',
          });
          tick(1);
          fixture.detectChanges();
          datasourceSevice.createRawItem.and.returnValue(
            of({
              id: 'Final id',
              displayName: newNode.displayName,
              isFolder: false,
            }),
          );

          sut.nodeChange({
            status: 'OK',
            oldName: 'oldName',
            node: newNode,
          });
          fixture.detectChanges();

          expect(sut.isBusy).toBeFalse();
          expect(testTree.selectSpy).toHaveBeenCalledWith('Final id');
          flush();
        }));
      });

      describe('AND cancel editing', () => {
        it('should select new item parent and set isBusy state', fakeAsync(() => {
          sut.renderingId$ = of('abc');
          sut.rawDatasource$ = of('Vader');

          sut.templatePickerContext.node = { id: 'previous selection' } as TreeNode;
          sut.handleTemplatePickerResult({
            templateId: '1',
            kind: 'OK',
          } as TemplatePickerResult);
          tick(1);
          fixture.detectChanges();

          sut.nodeChange({
            status: 'Canceled',
          });
          fixture.detectChanges();

          const result = datasourceSevice.getAncestorsWithSiblings.calls.mostRecent().args;
          expect(sut.isBusy).toBeFalse();
          expect(testTree.selectSpy).toHaveBeenCalledWith('previous selection');
          expect(result[0]).toBe('previous selection');
          flush();
        }));
      });
    });

    describe('WHEN handle context menu action invoke', () => {
      it('should open data-source template picker on Create New action', () => {
        fixture.detectChanges();

        testContextMenu().emitContextMenuActionInvoke({
          actionType: 'CreateNew',
          node: { id: 'testParentNodeId', isCompatible: true },
        });
        fixture.detectChanges();

        const testTemplatePicker = fixture.debugElement.query(By.directive(TestTemplatePickerComponent))
          .componentInstance as TestTemplatePickerComponent;
        expect(testTemplatePicker.item?.id).toBe('testParentNodeId');
      });
    });
  });
});
