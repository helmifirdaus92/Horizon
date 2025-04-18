/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { ContentTreeNode } from 'app/pages/content-tree/content-tree-node';
import { ContentTreePermissions } from 'app/pages/content-tree/content-tree-permissions';
import { NodeChangeEvent } from 'app/pages/content-tree/content-tree.component';
import {
  ContentTreeItem,
  ContentTreeService,
  DuplicateItemParameters,
} from 'app/pages/content-tree/content-tree.service';
import { ContextNavigationService } from 'app/shared/client-state/context-navigation.sevice';
import { Context } from 'app/shared/client-state/context.service';
import { ContextServiceTesting, ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { ItemChange, ItemChangeService } from 'app/shared/client-state/item-change-service';
import { ConfigurationDalService } from 'app/shared/configuration/configuration.dal.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { Item } from 'app/shared/graphql/item.interface';
import { LoggingService } from 'app/shared/logging.service';
import { Writable } from 'app/shared/utils/lang.utils';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { EMPTY, Subject, of, throwError } from 'rxjs';
import { ContentTreeLocking } from '../content-tree/content-tree-locking';
import { LHSNavigationService } from '../left-hand-side/lhs-navigation.service';
import { ContentTreeContainerComponent } from './content-tree-container.component';
import { ContentTreeContainerService } from './content-tree-container.service';

class ConfigurationServiceMock implements Partial<ConfigurationService> {
  get contentRootItemId(): string {
    return this._contentRootItemId;
  }
  _contentRootItemId = '';
}

const INITIAL_CONTEXT: Context = {
  itemId: 'foo',
  language: 'en',
  siteName: 'website',
};

@Component({
  selector: 'app-content-tree',
  template: '<ng-content></ng-content>',
})
class ContentTreeTestComponent {
  @Input() contentTreeData: any;
  @Input() selectedPageId: any;
}

function singleArgumentForLastCall(spy: jasmine.Spy) {
  return spy.calls.mostRecent().args[0];
}

function createNode(
  init?: {
    id?: string;
    text?: string;
    children?: ContentTreeNode[];
  },
  parent?: ContentTreeNode | undefined,
): ContentTreeNode {
  const node = new ContentTreeNode({
    id: 'test-node',
    item: {} as Item,
    text: 'test-node-name',
    parent,
    permissions: ContentTreePermissions.empty(),
    locking: ContentTreeLocking.empty(),
    ...init,
  });

  if (init?.children) {
    node.updateChildren(init.children);
    init.children.forEach((child) => (child.parent = node));
  }

  return node;
}

/**
 * Expect tree structure and node ids to match.
 */
function expectEqualtree(a: readonly ContentTreeNode[], b: readonly ContentTreeNode[]) {
  expect(a.length === b.length);

  for (let i = 0; i < a.length; i++) {
    const nodea = a[i];
    const nodeb = b[i];
    expect(nodea.id).toBe(nodeb.id);
    expectEqualtree(nodea.children, nodeb.children);
  }
}

describe(ContentTreeContainerComponent.name, () => {
  let sut: ContentTreeContainerComponent;
  let fixture: ComponentFixture<ContentTreeContainerComponent>;
  let contentTreeServiceSpy: jasmine.SpyObj<ContentTreeService>;
  let contextService: ContextServiceTesting;
  let lhsService: jasmine.SpyObj<ContentTreeContainerService>;
  let lhsNavService: jasmine.SpyObj<LHSNavigationService>;
  let configurationServiceMock: ConfigurationServiceMock;
  let itemChangeServiceSpy: jasmine.SpyObj<ItemChangeService>;
  let itemChanges$: Subject<ItemChange>;

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
  const defaultContentRootItemId = 'root-item-id';
  const startItemId = 'bar';

  beforeEach(waitForAsync(() => {
    const contentTreeService = jasmine.createSpyObj<ContentTreeService>('ContentTreeService', {
      addPage: EMPTY,
      addFolder: EMPTY,
      addTempCreatedItem: undefined,
      changeDisplayName: EMPTY,
      deleteItem: EMPTY,
      getContentTreeData: EMPTY,
      getChildeNodes: of([]),
    });

    contentTreeService.deleteItem$ = new Subject();
    contentTreeService.itemToAdd$ = new Subject();
    contentTreeService.itemToDuplicate$ = new Subject();

    TestBed.configureTestingModule({
      imports: [TranslateModule, TranslateServiceStubModule, ContextServiceTestingModule, NoopAnimationsModule],
      declarations: [ContentTreeContainerComponent, ContentTreeTestComponent],
      providers: [
        {
          provide: ContentTreeContainerService,
          useValue: jasmine.createSpyObj<ContentTreeContainerService>('lhs-service', {
            moveItem: of({ success: true }),
            showNotificationForCreationFailed: Promise.resolve(),
            showNotificationCreationEmptyName: Promise.resolve(),
            showNotificationForRenameError: Promise.resolve(),
            showNodeMoveSuccessNotification: Promise.resolve(),
            showNodeMoveErrorNotification: Promise.resolve(),
            showEmptyTreeErrorNotification: Promise.resolve(),
            getContentRootItemId: of(defaultContentRootItemId),
            getStartItemId: of(startItemId),
          }),
        },
        { provide: ContentTreeService, useValue: contentTreeService },
        {
          provide: LoggingService,
          useValue: jasmine.createSpyObj<LoggingService>({ info: undefined, warn: undefined, error: undefined }),
        },
        {
          provide: ItemChangeService,
          useValue: jasmine.createSpyObj<ItemChangeService>(['notifyChange', 'watchForChanges']),
        },
        ConfigurationDalService,
        {
          provide: ConfigurationService,
          useClass: ConfigurationServiceMock,
        },
        {
          provide: ContextNavigationService,
          useValue: jasmine.createSpyObj<ContextNavigationService>({}, { mostInnerRouteSegment$: of('editor') }),
        },
        {
          provide: LHSNavigationService,
          useValue: jasmine.createSpyObj<LHSNavigationService>(['watchRouteSegment']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentTreeContainerComponent);
    sut = fixture.componentInstance;

    itemChangeServiceSpy = TestBedInjectSpy(ItemChangeService);
    itemChanges$ = new Subject<ItemChange>();
    itemChangeServiceSpy.watchForChanges.and.returnValue(itemChanges$);

    contentTreeServiceSpy = TestBedInjectSpy(ContentTreeService);
    contextService = TestBed.inject(ContextServiceTesting);
    contextService.provideTestValue(INITIAL_CONTEXT);
    lhsService = TestBedInjectSpy(ContentTreeContainerService);
    lhsNavService = TestBedInjectSpy(LHSNavigationService);
    configurationServiceMock = TestBed.inject(ConfigurationService) as any;
    configurationServiceMock._contentRootItemId = defaultContentRootItemId;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(sut).toBeTruthy();
  });

  describe('onNodeDrop() INTO another node', () => {
    const dragNodeData = {
      id: '1.1',
      text: 'child1',
    };
    const dropNodeData = {
      id: '1.2',
      text: 'child2',
    };

    /**
     * Content tree with a root node and two children.
     */
    function createSimpleDragndropTreeNodes() {
      const dragNode = createNode(dragNodeData);
      const dropNode = createNode(dropNodeData);

      const root = createNode(
        {
          id: '1',
          text: 'root',
          children: [dropNode, dragNode],
        },
        createNode({
          id: defaultContentRootItemId,
          text: 'root-item-id',
        }),
      );

      return { root, dragNode, dropNode };
    }

    it('should reparent the node on UI', fakeAsync(() => {
      // arrange
      const { dragNode, dropNode, root } = createSimpleDragndropTreeNodes();
      sut.contentTreeData = [root];

      // act
      sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'INTO' });
      tick();

      // assert
      const expectedRootChildren = [
        createNode({
          id: dropNode.id,
          text: dropNode.text,
          children: [
            createNode({
              id: dragNode.id,
              text: dragNode.text,
            }),
          ],
        }),
      ];

      expectEqualtree(sut.contentTreeData[0].children, expectedRootChildren);
      expect(sut.selectedPageId).toBe(dragNode.id);
    }));

    describe('AND the dragged node is a root node', () => {
      it('should reparent the node on UI', fakeAsync(() => {
        const dragNode = createNode(dragNodeData);
        const dropNode = createNode(dropNodeData);
        sut.contentTreeData = [dragNode, dropNode];

        sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'INTO' });
        tick();

        const result = [createNode({ ...dropNodeData, children: [createNode(dragNodeData)] })];
        expectEqualtree(sut.contentTreeData, result);
      }));

      it('should reparent the node on UI when child of content root item', fakeAsync(() => {
        const parent = createNode({
          id: defaultContentRootItemId,
          text: 'root-item-id',
        });
        const dragNode = createNode(dragNodeData);
        const dropNode = createNode(dropNodeData, parent);
        sut.contentTreeData = [dragNode, dropNode];

        sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'INTO' });
        tick();

        const result = [createNode({ ...dropNodeData, children: [createNode(dragNodeData)] })];
        expectEqualtree(sut.contentTreeData, result);
      }));

      it('should reparent the node on UI when drop node is root but its parent is not content root', fakeAsync(() => {
        const parent = createNode({
          id: 'some-id',
          text: 'root-item-id',
        });
        const dragNode = createNode(dragNodeData, createNode({ id: 'some-id' }));
        sut.contentTreeData = [dragNode, parent];

        sut.onNodeDrop({ nodeId: dragNode.id, dropNode: parent, position: 'AFTER' });
        tick();

        const result = [createNode({ ...parent }), createNode({ ...dragNodeData })];
        expectEqualtree(sut.contentTreeData, result);
      }));
    });

    it('should call moveItem on item service', fakeAsync(() => {
      // arrange
      const { dragNode, dropNode, root } = createSimpleDragndropTreeNodes();
      sut.contentTreeData = [root];
      const position = 'INTO';

      // act
      sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position });
      tick();

      // assert
      expect(lhsService.moveItem).toHaveBeenCalledWith(INITIAL_CONTEXT.siteName, dragNode, dropNode, position);
    }));

    describe('WHEN moveItem completes', () => {
      describe('AND the moved node is selected', () => {
        it('should update the children of the new parent', fakeAsync(() => {
          // arrange
          lhsService.moveItem.and.returnValue(of({ success: true }));
          const { dragNode, dropNode, root } = createSimpleDragndropTreeNodes();

          sut.contentTreeData = [root];
          contextService.setTestItemId(dragNode.id);
          fixture.detectChanges();

          // act
          sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'INTO' });
          tick();

          // assert
          expect(contentTreeServiceSpy.getChildeNodes).toHaveBeenCalledWith(
            INITIAL_CONTEXT.siteName,
            INITIAL_CONTEXT.language,
            dropNode.id,
            dropNode,
          );
        }));
      });

      // a tree branch is independent from the selected node when that branch doesn't contain the node.
      describe('AND the new parent branch is independent from the selected node', () => {
        it('should update the children of the new parent', fakeAsync(() => {
          // arrange
          lhsService.moveItem.and.returnValue(of({ success: true }));
          const { dragNode, dropNode, root } = createSimpleDragndropTreeNodes();

          const selectedNode = createNode({ id: '1.3.1', text: 'selected node' });
          const independentBranch = createNode({
            id: '1.3',
            text: 'independent',
            children: [selectedNode],
          });

          root.updateChildren([...root.children, independentBranch]);
          independentBranch.parent = root;

          sut.contentTreeData = [root];
          contextService.setTestItemId(selectedNode.id);
          fixture.detectChanges();

          // act
          sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'INTO' });
          tick();

          // assert
          expect(contentTreeServiceSpy.getChildeNodes).toHaveBeenCalledWith(
            INITIAL_CONTEXT.siteName,
            INITIAL_CONTEXT.language,
            dropNode.id,
            dropNode,
          );
        }));
      });

      describe('AND the new parent branch contains the selected node', () => {
        it('should reload the tree', fakeAsync(() => {
          // arrange
          lhsService.moveItem.and.returnValue(of({ success: true }));
          const { dragNode, dropNode, root } = createSimpleDragndropTreeNodes();

          const selectedNode = createNode({ id: '1.3.1', text: 'selected node' });
          const selectedNodeBranch = createNode({
            id: '1.3',
            text: 'independent',
            children: [selectedNode],
          });

          dropNode.updateChildren([selectedNodeBranch]);
          selectedNodeBranch.parent = root;

          sut.contentTreeData = [root];
          contextService.setTestItemId(selectedNode.id);
          fixture.detectChanges();

          // act
          sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'INTO' });
          tick();

          // assert
          expect(contentTreeServiceSpy.getContentTreeData).toHaveBeenCalledWith(
            INITIAL_CONTEXT.siteName,
            INITIAL_CONTEXT.language,
            selectedNode.id,
          );
        }));
      });

      describe('show success notification with undo button', () => {
        it('should show success notification', fakeAsync(() => {
          // arrange
          lhsService.moveItem.and.returnValue(of({ success: true }));
          const { dragNode, dropNode, root } = createSimpleDragndropTreeNodes();
          sut.contentTreeData = [root];

          // act
          sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'INTO' });
          tick();

          // assert
          const [nodeId, movedItemName, targetItemName, position, actionRunFunc] =
            lhsService.showNodeMoveSuccessNotification.calls.mostRecent().args;

          expect(nodeId).toBe(dragNode.id);
          expect(movedItemName).toBe(dragNode.text);
          expect(targetItemName).toBe(dropNode.text);
          expect(position).toBe('INTO');
          expect(actionRunFunc).toEqual(jasmine.any(Function));
        }));

        describe('WHEN click UNDO', () => {
          it('should undo moving', fakeAsync(async () => {
            // arrange
            lhsService.moveItem.and.returnValue(of({ success: true }));
            contentTreeServiceSpy.getChildeNodes.and.callFake((_siteName, _language, itemid, _node) => {
              if (itemid === '1.2') {
                return of([dragNode]);
              }

              return of([]);
            });
            const { dragNode, dropNode, root } = createSimpleDragndropTreeNodes();

            sut.contentTreeData = [root];

            sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'INTO' });
            tick();

            // act
            const actionRunFunc = lhsService.showNodeMoveSuccessNotification.calls.mostRecent().args[4];
            actionRunFunc();
            tick();

            // assert
            const expectedRootChildren = [
              createNode({
                id: dropNode.id,
                text: dropNode.text,
              }),
              createNode({
                id: dragNode.id,
                text: dragNode.text,
              }),
            ];

            expectEqualtree(sut.contentTreeData[0].children, expectedRootChildren);
            expect(sut.selectedPageId).toBe(dragNode.id);
          }));
        });
      });
    });

    describe('WHEN moveItem has `success: false`', () => {
      it('should reparent the node back to its original parent', fakeAsync(() => {
        // arrange
        lhsService.moveItem.and.returnValue(throwError(() => ({ success: false })));
        const { dragNode, dropNode, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];

        // act
        sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'INTO' });
        tick();

        // assert
        expectEqualtree(sut.contentTreeData, [createSimpleDragndropTreeNodes().root]);
      }));

      it('should show an error message accordingly', fakeAsync(() => {
        // arrange
        lhsService.moveItem.and.returnValue(throwError(() => ({ success: false })));
        const { dragNode, dropNode, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];
        sut.selectedPageId = dragNode.id;

        // act
        sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'INTO' });
        tick();

        // assert
        const [nodeId, nodeText] = lhsService.showNodeMoveErrorNotification.calls.mostRecent().args;

        expect(nodeId).toContain(dragNode.id);
        expect(nodeText).toBe(dragNode.text);
        expect(sut.selectedPageId).toBe(dragNode.id);
      }));
    });

    describe('WHEN moveItem errors', () => {
      it('should reparent the node back to its original parent', fakeAsync(() => {
        // arrange
        lhsService.moveItem.and.returnValue(throwError(() => 'error'));
        const { dragNode, dropNode, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];
        sut.selectedPageId = dragNode.id;

        // act
        sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'INTO' });
        tick();

        // assert
        expectEqualtree(sut.contentTreeData, [createSimpleDragndropTreeNodes().root]);
        expect(sut.selectedPageId).toBe(dragNode.id);
      }));

      it('should show an error message accordingly', fakeAsync(() => {
        // arrange
        lhsService.moveItem.and.returnValue(throwError(() => 'error'));
        const { dragNode, dropNode, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];
        sut.selectedPageId = dragNode.id;

        // act
        sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'INTO' });
        tick();

        // assert
        const [nodeId, nodeText] = lhsService.showNodeMoveErrorNotification.calls.mostRecent().args;

        expect(nodeId).toContain(dragNode.id);
        expect(nodeText).toBe(dragNode.text);
      }));
    });
  });

  describe('onNodeDrop() within the same parent', () => {
    const node1Data = {
      id: '1.1',
      text: 'child1',
    };
    const node2Data = {
      id: '1.2',
      text: 'child2',
    };
    const node3Data = {
      id: '1.3',
      text: 'child3',
    };

    /**
     * Content tree with a root node and two children.
     */
    function createSimpleDragndropTreeNodes() {
      const node1 = createNode(node1Data);
      const node2 = createNode(node2Data);
      const node3 = createNode(node3Data);

      const root = createNode({
        id: '1',
        text: 'root',
        children: [node1, node2, node3],
      });

      return { root, node1, node2, node3 };
    }

    it('should reorder the node on UI - case 1', fakeAsync(() => {
      // arrange
      const { node2, node3, root } = createSimpleDragndropTreeNodes();
      sut.contentTreeData = [root];
      sut.selectedPageId = node2.id;

      // act
      sut.onNodeDrop({ nodeId: node2.id, dropNode: node3, position: 'AFTER' });
      tick();

      // assert
      const expectedRootChildren = [createNode(node1Data), createNode(node3Data), createNode(node2Data)];

      expectEqualtree(sut.contentTreeData[0].children, expectedRootChildren);
      expect(sut.selectedPageId).toBe(node2.id);
    }));

    it('should reorder the node on UI case - case 2', fakeAsync(() => {
      // arrange
      const { node1, node2, root } = createSimpleDragndropTreeNodes();
      sut.contentTreeData = [root];
      sut.selectedPageId = node2.id;

      // act
      sut.onNodeDrop({ nodeId: node1.id, dropNode: node2, position: 'AFTER' });
      tick();

      // assert
      const expectedRootChildren = [createNode(node2Data), createNode(node1Data), createNode(node3Data)];

      expectEqualtree(sut.contentTreeData[0].children, expectedRootChildren);
    }));

    it('should reorder the node on UI - case 3', fakeAsync(() => {
      // arrange
      const { node1, node2, node3, root } = createSimpleDragndropTreeNodes();
      sut.contentTreeData = [root];
      sut.selectedPageId = node2.id;

      // act
      sut.onNodeDrop({ nodeId: node1.id, dropNode: node3, position: 'BEFORE' });
      tick();

      // assert
      const expectedRootChildren = [createNode(node2Data), createNode(node1Data), createNode(node3Data)];

      expectEqualtree(sut.contentTreeData[0].children, expectedRootChildren);
    }));

    it('should reorder the node on UI - case 4', fakeAsync(() => {
      // arrange
      const { node2, node3, root } = createSimpleDragndropTreeNodes();
      sut.contentTreeData = [root];
      sut.selectedPageId = node2.id;

      // act
      sut.onNodeDrop({ nodeId: node3.id, dropNode: node2, position: 'BEFORE' });
      tick();

      // assert
      const expectedRootChildren = [createNode(node1Data), createNode(node3Data), createNode(node2Data)];

      expectEqualtree(sut.contentTreeData[0].children, expectedRootChildren);
    }));

    it('should reorder the node on UI - case 5', fakeAsync(() => {
      // arrange
      const { node1, node2, node3, root } = createSimpleDragndropTreeNodes();
      sut.contentTreeData = [root];
      sut.selectedPageId = node2.id;

      // act
      sut.onNodeDrop({ nodeId: node3.id, dropNode: node1, position: 'BEFORE' });
      tick();

      // assert
      const expectedRootChildren = [createNode(node3Data), createNode(node1Data), createNode(node2Data)];

      expectEqualtree(sut.contentTreeData[0].children, expectedRootChildren);
    }));
  });

  describe('onNodeDrop() BEFORE another node', () => {
    const node1Data = {
      id: '1.1',
      text: 'child1',
    };
    const node2Data = {
      id: '1.2',
      text: 'child2',
    };
    const node3Data = {
      id: '1.3',
      text: 'child3',
    };

    /**
     * Content tree with a root node and two children.
     */
    function createSimpleDragndropTreeNodes() {
      const node1 = createNode(node1Data);
      const node2 = createNode(node2Data);
      const node3 = createNode(node3Data);

      const root = createNode(
        {
          id: '1',
          text: 'root',
          children: [node1, node2, node3],
        },
        createNode({
          id: defaultContentRootItemId,
          text: 'root-item-id',
        }),
      );

      return { root, node1, node2, node3 };
    }

    describe('AND the node is moved before the root', () => {
      it('should reparent the node on UI in the corresponding position', fakeAsync(() => {
        // arrange
        const { node1, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];

        // act
        sut.onNodeDrop({ nodeId: node1.id, dropNode: root, position: 'BEFORE' });
        tick();

        // assert
        const expectTree = [
          createNode(node1Data),
          createNode({
            id: '1',
            text: 'root',
            children: [createNode(node2Data), createNode(node3Data)],
          }),
        ];
        expectEqualtree(sut.contentTreeData, expectTree);
        expect(sut.selectedPageId).toBe(node1.id);
      }));
    });

    describe('AND the node is dropped on a different parent', () => {
      it('should reparent the node on UI in the corresponding position', fakeAsync(() => {
        const dragNode = createNode({
          id: '1.2',
          text: 'move-me',
        });

        const dropNode = createNode({
          id: '1.1.2',
          text: 'dropbeforeme',
        });

        const root = createNode({
          id: '1',
          text: 'root',
          children: [
            createNode({
              id: '1.1',
              text: 'child1',
              children: [
                createNode({
                  id: '1.1.1',
                  text: 'grand1',
                }),
                dropNode,
              ],
            }),
            dragNode,
          ],
        });

        sut.contentTreeData = [root];

        // act
        sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'BEFORE' });
        tick();

        // assert
        const movedChildren = [
          createNode({
            id: '1.1.1',
            text: 'grand1',
          }),
          // node is moved
          createNode({
            id: '1.2',
            text: 'move-me',
          }),
          createNode({
            id: '1.1.2',
            text: 'dropbeforeme',
          }),
        ];

        const expectedTree = [
          createNode({
            id: '1',
            text: 'root',
            children: [
              createNode({
                id: '1.1',
                text: 'child1',
                children: movedChildren,
              }),
            ],
          }),
        ];

        expectEqualtree(sut.contentTreeData, expectedTree);
        expect(sut.selectedPageId).toBe(dragNode.id);
      }));
    });

    it('should call moveItem on item service', fakeAsync(() => {
      // arrange
      const { node1, node2, root } = createSimpleDragndropTreeNodes();
      sut.contentTreeData = [root];
      const position = 'BEFORE';

      // act
      sut.onNodeDrop({ nodeId: node2.id, dropNode: node1, position });
      tick();

      // assert
      expect(lhsService.moveItem).toHaveBeenCalledWith(INITIAL_CONTEXT.siteName, node2, node1, position);
    }));

    describe('WHEN moveItem completes', () => {
      describe('AND the moved node is selected', () => {
        it('should update the children of the new parent', fakeAsync(() => {
          // arrange
          lhsService.moveItem.and.returnValue(of({ success: true }));
          const { node1, node3, root } = createSimpleDragndropTreeNodes();

          sut.contentTreeData = [root];
          contextService.setTestItemId(node1.id);
          fixture.detectChanges();

          // act
          sut.onNodeDrop({ nodeId: node1.id, dropNode: node3, position: 'BEFORE' });
          tick();

          // assert
          expect(contentTreeServiceSpy.getChildeNodes).toHaveBeenCalledWith(
            INITIAL_CONTEXT.siteName,
            INITIAL_CONTEXT.language,
            root.id,
            root,
          );
          expect(sut.selectedPageId).toBe(node1.id);
        }));
      });

      describe('show success notification with undo button', () => {
        it('should show success notification', fakeAsync(() => {
          // arrange
          lhsService.moveItem.and.returnValue(of({ success: true }));
          const { node1, node2, root } = createSimpleDragndropTreeNodes();
          sut.contentTreeData = [root];

          // act
          sut.onNodeDrop({ nodeId: node1.id, dropNode: node2, position: 'BEFORE' });
          tick();

          // assert
          const [nodeId, movedItemName, targetItemName, position, actionRunFunc] =
            lhsService.showNodeMoveSuccessNotification.calls.mostRecent().args;

          expect(nodeId).toBe(node1.id);
          expect(movedItemName).toBe(node1.text);
          expect(targetItemName).toBe(node2.text);
          expect(position).toBe('BEFORE');
          expect(actionRunFunc).toEqual(jasmine.any(Function));
        }));

        describe('WHEN click UNDO', () => {
          it('should undo moving', fakeAsync(() => {
            // arrange
            lhsService.moveItem.and.returnValue(of({ success: true }));
            const { root, node1, node2, node3 } = createSimpleDragndropTreeNodes();
            sut.contentTreeData = [root];
            sut.selectedPageId = node2.id;
            contentTreeServiceSpy.getChildeNodes.and.callFake((_siteName, _language, itemid, _node) => {
              if (itemid === root.id) {
                return of(root.children);
              }

              return of([]);
            });

            // act
            sut.onNodeDrop({ nodeId: node3.id, dropNode: node1, position: 'BEFORE' });
            tick();

            const actionRunFunc = lhsService.showNodeMoveSuccessNotification.calls.mostRecent().args[4];
            actionRunFunc();
            tick();

            // assert
            const _moveItemArgs = lhsService.moveItem.calls.mostRecent().args;
            const undoDragNodeId = _moveItemArgs[1].id;
            const undoDropNodeId = _moveItemArgs[2].id;
            const undoPosition = _moveItemArgs[3];

            expect(undoDragNodeId).toBe(node3.id);
            expect(undoDropNodeId).toBe(node2.id);
            expect(undoPosition).toBe('AFTER');
            expectEqualtree(sut.contentTreeData, [createSimpleDragndropTreeNodes().root]);
            expect(sut.selectedPageId).toBe(node3.id);
          }));
        });
      });
    });

    describe('WHEN moveItem has `succes: false`', () => {
      it('should reparent the node back to its original parent', fakeAsync(() => {
        // arrange
        lhsService.moveItem.and.returnValue(throwError(() => ({ success: false })));
        const { node2, node1, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];
        sut.selectedPageId = node2.id;

        // act
        sut.onNodeDrop({ nodeId: node2.id, dropNode: node1, position: 'BEFORE' });
        tick();

        // assert
        expectEqualtree(sut.contentTreeData, [createSimpleDragndropTreeNodes().root]);
        expect(sut.selectedPageId).toBe(node2.id);
      }));

      it('should show an error message accordingly', fakeAsync(() => {
        // arrange
        lhsService.moveItem.and.returnValue(throwError(() => ({ success: false })));
        const { node2, node1, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];

        // act
        sut.onNodeDrop({ nodeId: node2.id, dropNode: node1, position: 'BEFORE' });
        tick();

        // assert
        const [nodeId, nodeText] = lhsService.showNodeMoveErrorNotification.calls.mostRecent().args;

        expect(nodeId).toContain(node2.id);
        expect(nodeText).toBe(node2.text);
      }));
    });

    describe('WHEN moveItem errors', () => {
      it('should reparent the node back to its original parent', fakeAsync(() => {
        // arrange
        lhsService.moveItem.and.returnValue(throwError(() => 'error'));
        const { node2, node1, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];
        sut.selectedPageId = node2.id;

        // act
        sut.onNodeDrop({ nodeId: node2.id, dropNode: node1, position: 'BEFORE' });
        tick();

        // assert
        expectEqualtree(sut.contentTreeData, [createSimpleDragndropTreeNodes().root]);
        expect(sut.selectedPageId).toBe(node2.id);
      }));

      it('should show an error message accordingly', fakeAsync(() => {
        // arrange
        lhsService.moveItem.and.returnValue(throwError(() => 'error'));
        const { node2, node1, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];

        // act
        sut.onNodeDrop({ nodeId: node2.id, dropNode: node1, position: 'BEFORE' });
        tick();

        // assert
        const [nodeId, nodeText] = lhsService.showNodeMoveErrorNotification.calls.mostRecent().args;

        expect(nodeId).toContain(node2.id);
        expect(nodeText).toBe(node2.text);
      }));
    });
  });

  describe('onNodeDrop() AFTER another node', () => {
    const node1Data = {
      id: '1.1',
      text: 'child1',
    };
    const node2Data = {
      id: '1.2',
      text: 'child2',
    };
    const node3Data = {
      id: '1.3',
      text: 'child3',
    };

    /**
     * Content tree with a root node and two children.
     */
    function createSimpleDragndropTreeNodes() {
      const node1 = createNode(node1Data);
      const node2 = createNode(node2Data);
      const node3 = createNode(node3Data);

      const root = createNode({
        id: '1',
        text: 'root',
        children: [node1, node2, node3],
      });

      return { root, node1, node2, node3 };
    }

    describe('AND the node is moved after the root', () => {
      it('should reparent the node on UI in the corresponding position', fakeAsync(() => {
        // arrange
        const { node1, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];
        sut.selectedPageId = node1.id;

        // act
        sut.onNodeDrop({ nodeId: node1.id, dropNode: root, position: 'AFTER' });
        tick();

        // assert
        const expectTree = [
          createNode({
            id: '1',
            text: 'root',
            children: [createNode(node2Data), createNode(node3Data)],
          }),
          createNode(node1Data),
        ];
        expectEqualtree(sut.contentTreeData, expectTree);
        expect(sut.selectedPageId).toBe(node1.id);
      }));
    });

    describe('AND the node is dropped on a different parent', () => {
      it('should reparent the node on UI in the corresponding position', fakeAsync(() => {
        const dragNode = createNode({
          id: '1.2',
          text: 'move-me',
        });

        const dropNode = createNode({
          id: '1.1.1',
          text: 'dropafterme',
        });

        const root = createNode({
          id: '1',
          text: 'root',
          children: [
            createNode({
              id: '1.1',
              text: 'child1',
              children: [
                dropNode,
                createNode({
                  id: '1.1.2',
                  text: 'grand2',
                }),
              ],
            }),
            dragNode,
          ],
        });

        sut.contentTreeData = [root];
        sut.selectedPageId = dragNode.id;

        // act
        sut.onNodeDrop({ nodeId: dragNode.id, dropNode, position: 'AFTER' });
        tick();

        // assert
        const movedChildren = [
          createNode({
            id: '1.1.1',
            text: 'dropafterme',
          }),
          // node is moved
          createNode({
            id: '1.2',
            text: 'move-me',
          }),
          createNode({
            id: '1.1.2',
            text: 'grand2',
          }),
        ];

        const expectedTree = [
          createNode({
            id: '1',
            text: 'root',
            children: [
              createNode({
                id: '1.1',
                text: 'child1',
                children: movedChildren,
              }),
            ],
          }),
        ];

        expectEqualtree(sut.contentTreeData, expectedTree);
        expect(sut.selectedPageId).toBe(dragNode.id);
      }));
    });

    it('should call moveItem on item service', fakeAsync(() => {
      // arrange
      const { node1, node2, root } = createSimpleDragndropTreeNodes();
      sut.contentTreeData = [root];
      const position = 'AFTER';

      // act
      sut.onNodeDrop({ nodeId: node1.id, dropNode: node2, position });
      tick();

      // assert
      expect(lhsService.moveItem).toHaveBeenCalledWith(INITIAL_CONTEXT.siteName, node1, node2, position);
    }));

    describe('WHEN moveItem completes', () => {
      describe('AND the moved node is selected', () => {
        it('should update the children of the new parent', fakeAsync(() => {
          // arrange
          lhsService.moveItem.and.returnValue(of({ success: true }));
          const { node1, node3, root } = createSimpleDragndropTreeNodes();

          sut.contentTreeData = [root];
          contextService.setTestItemId(node1.id);
          fixture.detectChanges();

          // act
          sut.onNodeDrop({ nodeId: node1.id, dropNode: node3, position: 'AFTER' });
          tick();

          // assert
          expect(contentTreeServiceSpy.getChildeNodes).toHaveBeenCalledWith(
            INITIAL_CONTEXT.siteName,
            INITIAL_CONTEXT.language,
            root.id,
            root,
          );
          expect(sut.selectedPageId).toBe(node1.id);
        }));
      });

      describe('show success notification with undo button', () => {
        it('should show success notification', fakeAsync(() => {
          // arrange
          lhsService.moveItem.and.returnValue(of({ success: true }));
          const { node1, node2, root } = createSimpleDragndropTreeNodes();
          sut.contentTreeData = [root];

          // act
          sut.onNodeDrop({ nodeId: node1.id, dropNode: node2, position: 'AFTER' });
          tick();

          // assert
          const [nodeId, movedItemName, targetItemName, position, actionRunFunc] =
            lhsService.showNodeMoveSuccessNotification.calls.mostRecent().args;

          expect(nodeId).toBe(node1.id);
          expect(movedItemName).toBe(node1.text);
          expect(targetItemName).toBe(node2.text);
          expect(position).toBe('AFTER');
          expect(actionRunFunc).toEqual(jasmine.any(Function));
        }));

        describe('WHEN click UNDO', () => {
          it('should undo moving', fakeAsync(() => {
            // arrange
            lhsService.moveItem.and.returnValue(of({ success: true }));
            const { root, node1, node2, node3 } = createSimpleDragndropTreeNodes();
            sut.contentTreeData = [root];
            sut.selectedPageId = node2.id;
            contentTreeServiceSpy.getChildeNodes.and.callFake((_siteName, _language, itemid, _node) => {
              if (itemid === root.id) {
                return of(root.children);
              }

              return of([]);
            });

            // act
            sut.onNodeDrop({ nodeId: node2.id, dropNode: node3, position: 'AFTER' });
            tick();

            const actionRunFunc = lhsService.showNodeMoveSuccessNotification.calls.mostRecent().args[4];
            actionRunFunc();
            tick();

            // assert
            const _moveItemArgs = lhsService.moveItem.calls.mostRecent().args;
            const undoDragNodeId = _moveItemArgs[1].id;
            const undoDropNodeId = _moveItemArgs[2].id;
            const undoPosition = _moveItemArgs[3];

            expect(undoDragNodeId).toBe(node2.id);
            expect(undoDropNodeId).toBe(node1.id);
            expect(undoPosition).toBe('AFTER');
            expectEqualtree(sut.contentTreeData, [createSimpleDragndropTreeNodes().root]);
            expect(sut.selectedPageId).toBe(node2.id);
          }));
        });
      });
    });

    describe('WHEN moveItem has `succes: false`', () => {
      it('should reparent the node back to its original parent', fakeAsync(() => {
        // arrange
        lhsService.moveItem.and.returnValue(throwError(() => ({ success: false })));
        const { node2, node3, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];
        sut.selectedPageId = node2.id;

        // act
        sut.onNodeDrop({ nodeId: node2.id, dropNode: node3, position: 'AFTER' });
        tick();

        // assert
        expectEqualtree(sut.contentTreeData, [createSimpleDragndropTreeNodes().root]);
        expect(sut.selectedPageId).toBe(node2.id);
      }));

      it('should show an error message accordingly', fakeAsync(() => {
        // arrange
        lhsService.moveItem.and.returnValue(throwError(() => ({ success: false })));
        const { node2, node3, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];

        // act
        sut.onNodeDrop({ nodeId: node2.id, dropNode: node3, position: 'AFTER' });
        tick();

        // assert
        const [nodeId, nodeText] = lhsService.showNodeMoveErrorNotification.calls.mostRecent().args;

        expect(nodeId).toContain(node2.id);
        expect(nodeText).toBe(node2.text);
      }));
    });

    describe('WHEN moveItem errors', () => {
      it('should reparent the node back to its original parent', fakeAsync(() => {
        // arrange
        lhsService.moveItem.and.returnValue(throwError(() => 'error'));
        const { node2, node3, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];
        sut.selectedPageId = node2.id;

        // act
        sut.onNodeDrop({ nodeId: node2.id, dropNode: node3, position: 'AFTER' });
        tick();

        // assert
        expectEqualtree(sut.contentTreeData, [createSimpleDragndropTreeNodes().root]);
        expect(sut.selectedPageId).toBe(node2.id);
      }));

      it('should show an error message accordingly', fakeAsync(() => {
        // arrange
        lhsService.moveItem.and.returnValue(throwError(() => 'error'));
        const { node2, node3, root } = createSimpleDragndropTreeNodes();
        sut.contentTreeData = [root];

        // act
        sut.onNodeDrop({ nodeId: node2.id, dropNode: node3, position: 'AFTER' });
        tick();

        // assert
        const [nodeId, nodeText] = lhsService.showNodeMoveErrorNotification.calls.mostRecent().args;

        expect(nodeId).toContain(node2.id);
        expect(nodeText).toBe(node2.text);
      }));
    });
  });

  describe('Given context itemId is "foo", language is "en" and siteName is "website"', () => {
    it('should update [selectedPageId] to be "foo"', () => {
      fixture.detectChanges();
      expect(sut.selectedPageId).toBe('foo');
    });

    it('should ask to load content tree data once', () => {
      fixture.detectChanges();
      expect(contentTreeServiceSpy.getContentTreeData).toHaveBeenCalledTimes(1);
    });

    it('should ask to reload all data if language changes', () => {
      fixture.detectChanges();

      contextService.setTestLang('da');

      expect(contentTreeServiceSpy.getContentTreeData).toHaveBeenCalledTimes(2);
    });

    it('should ask to reload all data if website changes', () => {
      fixture.detectChanges();

      contextService.setTestSite('website2');

      expect(contentTreeServiceSpy.getContentTreeData).toHaveBeenCalledTimes(2);
    });

    it('should ask to reload all data if itemId changes', () => {
      fixture.detectChanges();

      contextService.setTestItemId('bar');

      expect(contentTreeServiceSpy.getContentTreeData).toHaveBeenCalledTimes(2);
    });

    describe('and context item does not belong current site', () => {
      beforeEach(() => {
        contentTreeServiceSpy.getContentTreeData.and.returnValue(of([]));
        lhsNavService.watchRouteSegment.and.returnValue(of('editor'));
      });

      it('should show notification', fakeAsync(() => {
        fixture.detectChanges();
        tick();

        expect(lhsService.showEmptyTreeErrorNotification).toHaveBeenCalled();
      }));

      it('WHEN route is not Editor, should not show notification', fakeAsync(() => {
        lhsNavService.watchRouteSegment.and.returnValue(of('not-editor'));

        fixture.detectChanges();
        tick();

        expect(lhsService.showEmptyTreeErrorNotification).not.toHaveBeenCalled();
      }));

      it('WHEN context site is not defined, should not show notification', fakeAsync(() => {
        contextService.setTestSite(undefined as any);

        fixture.detectChanges();
        tick();

        expect(lhsService.showEmptyTreeErrorNotification).not.toHaveBeenCalled();
      }));

      it('WHEN context item is not defined, should not show notification', fakeAsync(() => {
        contextService.setTestItemId(undefined as any);

        fixture.detectChanges();
        tick();

        expect(lhsService.showEmptyTreeErrorNotification).not.toHaveBeenCalled();
      }));
    });

    describe('and data is already loaded with root items', () => {
      beforeEach(() => {
        contentTreeServiceSpy.getContentTreeData.and.returnValue(
          of([
            new ContentTreeNode({
              id: 'foo',
              item: {} as Item,
              text: 'Foo',
              permissions: allowPermissions,
              locking: itemLocking,
              hasChildren: true,
            }),
            new ContentTreeNode({
              id: 'bar',
              item: {} as Item,
              text: 'Bar',
              permissions: allowPermissions,
              locking: itemLocking,
            }),
          ]),
        );
      });

      it('should update [contentTreeData]', () => {
        fixture.detectChanges();

        expect(sut.contentTreeData.length).toBe(2);
      });

      it('should ask to reload all data if itemId changes to a value not already loaded', () => {
        fixture.detectChanges();

        contextService.setTestItemId('qux');

        expect(contentTreeServiceSpy.getContentTreeData).toHaveBeenCalledTimes(2);
      });

      it('should not reload anything if itemId changes to a value already loaded', () => {
        fixture.detectChanges();

        contextService.setTestItemId('bar');

        expect(contentTreeServiceSpy.getContentTreeData).toHaveBeenCalledTimes(1);
      });

      describe('where selected item "foo" is deleted', () => {
        const contentTreeData = [
          new ContentTreeNode({
            id: startItemId,
            item: {} as Item,
            text: 'Bar',
            permissions: allowPermissions,
            locking: itemLocking,
            hasChildren: true,
            parent: new ContentTreeNode({
              id: defaultContentRootItemId,
              item: {} as Item,
              text: 'root-item-id',
              permissions: allowPermissions,
              locking: itemLocking,
              hasChildren: true,
            }),
          }),
          new ContentTreeNode({
            id: 'foo',
            item: {} as Item,
            text: 'Foo',
            permissions: allowPermissions,
            locking: itemLocking,
          }),
        ];

        it('should remove deleted item from the list of items', fakeAsync(() => {
          contentTreeServiceSpy.getContentTreeData.and.returnValue(of(contentTreeData));
          fixture.detectChanges();

          contentTreeServiceSpy.deleteItem$.next('foo');
          tick();

          expect(sut.contentTreeData.length).toBe(1);
        }));

        it('should ask to select start item', fakeAsync(() => {
          contentTreeServiceSpy.getContentTreeData.and.returnValue(of(contentTreeData));
          const selectItemSpy = spyOn(contextService, 'updateContext');
          fixture.detectChanges();

          contentTreeServiceSpy.deleteItem$.next('foo');
          tick();

          expect(singleArgumentForLastCall(selectItemSpy)['itemId']).toBe(startItemId);
        }));
      });

      describe('where non-selected item "bar" is deleted', () => {
        it('should remove deleted item from the list of items', fakeAsync(() => {
          fixture.detectChanges();

          contentTreeServiceSpy.deleteItem$.next('bar');
          tick();

          expect(sut.contentTreeData.length).toBe(1);
        }));

        it('item with id "foo" should remain in the list', fakeAsync(() => {
          fixture.detectChanges();

          contentTreeServiceSpy.deleteItem$.next('bar');
          tick();

          expect(sut.contentTreeData[0].id).toBe('foo');
        }));
      });

      describe('when user selects an item "bar" in the tree', async () => {
        it('should ask service to select itemId "bar"', () => {
          const selectItemSpy = spyOn(contextService, 'updateContext');
          fixture.detectChanges();

          sut.onTreeSelect(sut.contentTreeData[1]);

          expect(singleArgumentForLastCall(selectItemSpy)['itemId']).toBe('bar');
        });
      });

      describe('when user expands item "foo" in the tree', () => {
        it('should ask service to get child items for expanded node', () => {
          fixture.detectChanges();
          const fooNode = sut.contentTreeData[0];

          sut.onTreeExpand(fooNode);

          expect(contentTreeServiceSpy.getChildeNodes).toHaveBeenCalledWith('website', 'en', 'foo', fooNode);
        });

        describe('when children fetched', () => {
          const itemChildren = [
            new ContentTreeNode({
              id: 'baz',
              item: {} as Item,
              text: 'Baz',
              permissions: allowPermissions,
              locking: itemLocking,
            }),
            new ContentTreeNode({
              id: 'qux',
              item: {} as Item,
              text: 'Qux',
              permissions: allowPermissions,
              locking: itemLocking,
            }),
          ];

          it('should update item "startItem" children with mapped content when children fetched', () => {
            contentTreeServiceSpy.getChildeNodes.and.returnValue(of(itemChildren));
            fixture.detectChanges();

            let fooNode = sut.contentTreeData[0];
            sut.onTreeExpand(fooNode);
            fooNode = sut.contentTreeData[0];

            expect(fooNode.children.length).toBe(2);
          });

          describe('and user selects sub item "qux"', () => {
            it('should ask service to select itemId', () => {
              const selectItemSpy = spyOn(contextService, 'updateContext');
              contentTreeServiceSpy.getChildeNodes.and.returnValue(of(itemChildren));
              fixture.detectChanges();

              const quaxNode = itemChildren[1];
              sut.onTreeSelect(quaxNode);

              expect(singleArgumentForLastCall(selectItemSpy)['itemId']).toBe('qux');
            });
          });

          describe('where selected item "qux" is deleted', () => {
            it('should ask to select start item "foo"', fakeAsync(() => {
              const selectItemSpy = spyOn(contextService, 'updateContext');
              contentTreeServiceSpy.getChildeNodes.and.returnValue(of(itemChildren));
              fixture.detectChanges();

              const fooNode = sut.contentTreeData[0];
              sut.onTreeExpand(fooNode);
              sut.selectedPageId = 'qux';
              fixture.detectChanges();

              contentTreeServiceSpy.deleteItem$.next('qux');
              tick();

              expect(singleArgumentForLastCall(selectItemSpy)['itemId']).toBe(startItemId);
            }));
          });

          describe('when parent of selected item is deleted', () => {
            it('should select start item', fakeAsync(() => {
              const selectItemSpy = spyOn(contextService, 'updateContext');
              contentTreeServiceSpy.getChildeNodes.and.returnValue(of(itemChildren));
              fixture.detectChanges();

              const fooNode = sut.contentTreeData[0];
              sut.onTreeExpand(fooNode);
              sut.selectedPageId = 'qux';
              fixture.detectChanges();

              contentTreeServiceSpy.deleteItem$.next('foo');
              tick();

              expect(singleArgumentForLastCall(selectItemSpy)['itemId']).toBe(startItemId);
            }));
          });
        });
      });
    });

    describe('add new tree node scenario ', () => {
      let nodeText = 'baz';
      let createContentTreeItem: ContentTreeItem;
      let duplicateItemParameters: DuplicateItemParameters;
      const itemToAddEmitAction = () => {
        contentTreeServiceSpy.itemToAdd$.next(createContentTreeItem);
      };
      const itemToDuplicateEmitAction = () => contentTreeServiceSpy.itemToDuplicate$.next(duplicateItemParameters);

      beforeEach(() => {
        createContentTreeItem = {
          templateId: 'foo',
          text: nodeText,
          isFolder: false,
          parentId: 'bar',
        };

        duplicateItemParameters = {
          hasChildren: false,
          text: nodeText,
          isFolder: false,
          parentId: 'duplicateParentId',
          sourceItemId: 'duplicateSourceId',
        };
      });

      [itemToAddEmitAction, itemToDuplicateEmitAction].forEach((addTreeNodeEventEmit) =>
        describe(`and contentTreeService emits '${addTreeNodeEventEmit}'`, () => {
          describe('and the item parent is not found in `contentTreeData`', () => {
            it('should add item to the end of `contentTreeData`', () => {
              fixture.detectChanges();
              sut.selectedPageId = '';
              sut.contentTreeData = [ContentTreeNode.createEmpty()];

              addTreeNodeEventEmit();

              expect(sut.contentTreeData.length).toBe(2);
              expect(sut.contentTreeData[0].id).toBe('');
              expect(sut.contentTreeData[1].text).toBe(nodeText);
            });

            it('should set `prevSelectedPageId`', () => {
              fixture.detectChanges();
              sut.selectedPageId = '';
              sut.contentTreeData = [ContentTreeNode.createEmpty()];

              addTreeNodeEventEmit();

              expect(sut.currentCreationTransaction).toBeTruthy();
            });

            it('should set `selectedPageId`', () => {
              fixture.detectChanges();
              sut.selectedPageId = 'prev';
              sut.contentTreeData = [ContentTreeNode.createEmpty()];

              addTreeNodeEventEmit();

              expect(sut.selectedPageId).not.toBe('prev');
            });
          });

          [true, false].forEach((isFolder) =>
            describe(`[isFolder=${isFolder}] and the item parentId is 'foo' and 'contentTreeData' has a parent with id 'foo'`, () => {
              nodeText = 'bar';
              const originalPageId = 'foo';

              beforeEach(() => {
                createContentTreeItem = { templateId: 'bar', text: nodeText, isFolder, parentId: 'foo' };
                duplicateItemParameters = {
                  hasChildren: false,
                  isFolder,
                  parentId: 'foo',
                  sourceItemId: 'duplicateSourceId',
                  text: nodeText,
                };
              });

              it('should add item to the children of parent', () => {
                fixture.detectChanges();
                sut.contentTreeData = [
                  new ContentTreeNode({
                    id: originalPageId,
                    item: {} as Item,
                    text: originalPageId,
                    permissions: allowPermissions,
                    locking: itemLocking,
                    hasChildren: true,
                  }),
                ];
                sut.selectedPageId = originalPageId;
                contentTreeServiceSpy.getChildeNodes.and.returnValue(of([ContentTreeNode.createEmpty()]));

                addTreeNodeEventEmit();

                const children = sut.contentTreeData[0].children;
                expect(children.length).toBe(2);
                expect(children[0].text === nodeText).toBeTruthy();
                expect(children[0].isFolder === isFolder).toBeTruthy();
              });

              it('should set `prevSelectedPageId` to `selectedPageId`', () => {
                fixture.detectChanges();
                sut.contentTreeData = [
                  new ContentTreeNode({
                    id: originalPageId,
                    item: {} as Item,
                    text: originalPageId,
                    permissions: allowPermissions,
                    locking: itemLocking,
                    hasChildren: true,
                  }),
                ];
                sut.selectedPageId = originalPageId;
                contentTreeServiceSpy.getChildeNodes.and.returnValue(of([ContentTreeNode.createEmpty()]));

                addTreeNodeEventEmit();

                expect(sut.currentCreationTransaction!.previousPageId).toBe(originalPageId);
              });

              it('should set `selectedPageId` to a `DraftId-` string', () => {
                fixture.detectChanges();
                sut.contentTreeData = [
                  new ContentTreeNode({
                    id: originalPageId,
                    item: {} as Item,
                    text: originalPageId,
                    permissions: allowPermissions,
                    locking: itemLocking,
                    hasChildren: true,
                  }),
                ];
                sut.selectedPageId = originalPageId;
                contentTreeServiceSpy.getChildeNodes.and.returnValue(of([ContentTreeNode.createEmpty()]));

                addTreeNodeEventEmit();

                expect(sut.selectedPageId.indexOf('DraftId-') === -1).toBeFalsy();
              });

              it('should not re-fetch children if parent is already expanded', () => {
                fixture.detectChanges();
                sut.contentTreeData = [
                  new ContentTreeNode({
                    id: originalPageId,
                    item: {} as Item,
                    text: originalPageId,
                    permissions: allowPermissions,
                    locking: itemLocking,
                    hasChildren: true,
                  }),
                ];
                sut.contentTreeData[0].updateChildren([ContentTreeNode.createEmpty()]);

                addTreeNodeEventEmit();

                expect(contentTreeServiceSpy.getChildeNodes).not.toHaveBeenCalled();
              });
            }),
          );
        }),
      );
    });

    describe('onNodeChange()', () => {
      [true, false].forEach((isFolder) =>
        describe('when the temporaryNode matches given nodes, and the NodeChangeEvent `canceled` is `true`', () => {
          let node: ContentTreeNode;
          let nodeChangeEvent: NodeChangeEvent;
          const selectedPageId = 'foo';
          const prevSelectedPageId = 'bar';

          beforeEach(() => {
            node = new ContentTreeNode({
              id: 'node',
              item: {} as Item,
              text: 'node-txt',
              permissions: ContentTreePermissions.empty(),
              locking: ContentTreeLocking.empty(),
              isFolder,
            });

            nodeChangeEvent = {
              canceled: true,
              node,
            };

            sut.selectedPageId = selectedPageId;
            sut.currentCreationTransaction = {
              mode: 'createNewItem',
              tempNode: node,
              previousPageId: prevSelectedPageId,
              sourceId: '',
              parentId: '',
            };
          });

          it('should set `selectedPageId` to `prevSelectedPageId`', () => {
            fixture.detectChanges();
            sut.onNodeChange(nodeChangeEvent);

            expect(sut.selectedPageId).toBe(prevSelectedPageId);
          });

          it('should unset `prevSelectedPageId`', () => {
            fixture.detectChanges();
            sut.onNodeChange(nodeChangeEvent);

            expect(sut.currentCreationTransaction).toBeUndefined();
          });

          describe('and the node has a parent', () => {
            it('should remove given node from children of parent', () => {
              const parent = new ContentTreeNode({
                id: 'foo',
                item: {} as Item,
                text: 'foobar',
                permissions: allowPermissions,
                locking: itemLocking,
              });
              const child = new ContentTreeNode({
                id: 'bar',
                item: {} as Item,
                text: 'barbar',
                parent,
                permissions: allowPermissions,
                locking: itemLocking,
                hasChildren: true,
              });
              const child2 = new ContentTreeNode({
                id: 'baz',
                item: {} as Item,
                text: 'bazbar',
                parent,
                permissions: allowPermissions,
                locking: itemLocking,
                hasChildren: true,
              });

              parent.updateChildren([child, child2]);
              sut.currentCreationTransaction = {
                mode: 'createNewItem',
                tempNode: child2,
                previousPageId: '',
                sourceId: '',
                parentId: '',
              };
              nodeChangeEvent.node = child2;

              fixture.detectChanges();

              sut.onNodeChange(nodeChangeEvent);

              const children = parent.children;
              expect(children.length).toBe(1);
              expect(children.indexOf(child2) === -1).toBeTruthy();
            });
          });

          describe('and the node doesnt have a parent', () => {
            it('should remove given node from contentTreeData', () => {
              const node1 = new ContentTreeNode({
                id: 'foo',
                item: {} as Item,
                text: 'foobar',
                permissions: allowPermissions,
                locking: itemLocking,
              });
              const node2 = new ContentTreeNode({
                id: 'bar',
                item: {} as Item,
                text: 'barbar',
                permissions: allowPermissions,
                locking: itemLocking,
              });
              sut.contentTreeData = [node1, node2];
              nodeChangeEvent.node = node1;
              sut.currentCreationTransaction = {
                mode: 'createNewItem',
                tempNode: node1,
                previousPageId: '',
                sourceId: '',
                parentId: '',
              };

              fixture.detectChanges();

              sut.onNodeChange(nodeChangeEvent);

              expect(sut.contentTreeData.length).toBe(1);
              expect(sut.contentTreeData.indexOf(node1) === -1).toBeTruthy();
            });
          });
        }),
      );

      describe('when the temporaryNode matches given nodes, and the NodeChangeEvent `canceled` is `false`', () => {
        let nodeChangeEvent: NodeChangeEvent;

        beforeEach(() => {
          const node = new ContentTreeNode({
            id: 'foo',
            item: {} as Item,
            text: 'bar',
            permissions: allowPermissions,
            locking: itemLocking,
            enableEdit: true,
          });

          nodeChangeEvent = {
            canceled: false,
            node,
          };

          fixture.detectChanges();
          sut.currentCreationTransaction = {
            mode: 'createNewItem',
            tempNode: node,
            sourceId: 'fooTemplate',
            parentId: 'fooParent',
            previousPageId: 'fooPreviousPageId',
          };
        });

        it(`should call contentTreeService.addItem() with node,
        where 'enableEdit' is 'false', selected template id, language and site`, fakeAsync(() => {
          sut.onNodeChange(nodeChangeEvent);
          tick();

          expect(contentTreeServiceSpy.addPage).toHaveBeenCalledWith(
            'bar',
            'fooTemplate',
            'fooParent',
            INITIAL_CONTEXT.language,
            INITIAL_CONTEXT.siteName,
          );
        }));

        it(`should show the corresponding notification, when node text is empty string
          and remove the temporary node`, fakeAsync(() => {
          const node1 = new ContentTreeNode({
            id: 'foo',
            item: {} as Item,
            text: '',
            permissions: allowPermissions,
            locking: itemLocking,
          });
          const node2 = new ContentTreeNode({
            id: 'bar',
            item: {} as Item,
            text: '',
            permissions: allowPermissions,
            locking: itemLocking,
          });
          sut.contentTreeData = [node1, node2];
          nodeChangeEvent.node = node1;
          sut.currentCreationTransaction = {
            mode: 'createNewItem',
            tempNode: node1,
            sourceId: '',
            parentId: '',
            previousPageId: '',
          };

          sut.onNodeChange(nodeChangeEvent);
          tick();

          expect(lhsService.showNotificationCreationEmptyName).toHaveBeenCalledWith(node1);
          expect(sut.contentTreeData.length).toBe(1);
          expect(sut.contentTreeData.indexOf(node1) === -1).toBeTruthy();
        }));

        describe('when addPage/addFolder returns result', () => {
          beforeEach(() => {
            contentTreeServiceSpy.addPage.and.returnValue(of({ id: 'newPageId', displayName: 'newPageName' }));
            contentTreeServiceSpy.addFolder.and.returnValue(of({ id: 'newFolderId', displayName: 'newFolderName' }));
          });

          it('should keep siblings expanded descendants in the tree', fakeAsync(() => {
            const siblingsDescendant = createNode({ id: 'siblingsDescendant' });
            const sibling = createNode({ id: 'sibling', children: [siblingsDescendant] });
            const parent = createNode({ id: 'parent', children: [sibling] });
            sut.contentTreeData = [parent];
            nodeChangeEvent.node.parent = parent;

            contentTreeServiceSpy.getChildeNodes.and.returnValue(
              of([createNode({ id: nodeChangeEvent.node.id }), createNode({ id: 'sibling' })]),
            );

            sut.onNodeChange(nodeChangeEvent);
            tick();

            expect(parent.children.length).toBe(2);
            expect(parent.children[1].children[0]).toBe(siblingsDescendant);
          }));

          it('should not select newly created page if context page has changed while item is being created', fakeAsync(() => {
            const selectItemSpy = spyOn(contextService, 'updateContext');
            const parent = createNode({ id: 'parent' });
            nodeChangeEvent.node.parent = parent;
            contentTreeServiceSpy.addPage.and.returnValue(of({ id: nodeChangeEvent.node.id, displayName: 'new node' }));
            contentTreeServiceSpy.getChildeNodes.and.returnValue(of([nodeChangeEvent.node]));

            contextService.setTestItemId('contextPagesChangedId');
            sut.onNodeChange(nodeChangeEvent);
            tick();

            expect(selectItemSpy).not.toHaveBeenCalled();
          }));

          it('should select newly created page if context page has not changed while item is being created', fakeAsync(() => {
            const selectItemSpy = spyOn(contextService, 'updateContext');
            const parent = createNode({ id: 'parent' });
            nodeChangeEvent.node.parent = parent;
            contentTreeServiceSpy.addPage.and.returnValue(of({ id: nodeChangeEvent.node.id, displayName: 'new node' }));
            contentTreeServiceSpy.getChildeNodes.and.returnValue(of([nodeChangeEvent.node]));

            contextService.setTestItemId(sut.currentCreationTransaction!.previousPageId);
            sut.onNodeChange(nodeChangeEvent);
            tick();

            expect(selectItemSpy).toHaveBeenCalledOnceWith(
              jasmine.objectContaining({ itemId: nodeChangeEvent.node.id }),
            );
          }));

          [true, false].forEach((isFolder) => {
            it(`[isFolder=${isFolder}] should set reset pending transaction`, () => {
              sut.onNodeChange(nodeChangeEvent);

              expect(sut.currentCreationTransaction).toBeUndefined();
            });
          });

          describe('when node is folder', () => {
            beforeEach(() => {
              (nodeChangeEvent.node as Writable<ContentTreeNode>).isFolder = true;
            });

            it('should set selection to previous one', fakeAsync(() => {
              sut.onNodeChange(nodeChangeEvent);
              tick();

              expect(sut.selectedPageId).toBe('fooPreviousPageId');
            }));
          });
        });
      });
    });
  });
});
