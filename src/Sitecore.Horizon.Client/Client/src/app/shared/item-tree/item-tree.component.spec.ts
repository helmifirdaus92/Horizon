/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { CommonModule } from '@angular/common';
import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NestedTreeNodeDirective, TreeNodeSelectableComponent } from '@sitecore/ng-spd-lib';
import { DeepPartial } from 'app/shared/utils/lang.utils';
import { ItemTreeComponent, TreeNode } from './item-tree.component';
import { ItemTreeModule } from './item-tree.module';

@Component({
  selector: 'app-test-context-menu',
  template: '<div> context menu test implementation </div>',
})
export class TestContextMenuComponent {
  @Input() node: TreeNode;
}

@Component({
  selector: 'test-item-tree',
  template: `
    <ng-template #testContextMenu let-contextNode="node">
      <app-test-context-menu [node]="contextNode"> </app-test-context-menu>
    </ng-template>
    <app-item-tree
      [data]="data"
      [getChildren]="getChildren"
      [select]="select"
      [contextMenu]="testContextMenu"
      [highlightIncompatibleNodes]="highlightIncompatibleNodes"
      (selectChange)="onSelect($event)"
      (nodeChange)="onNodeChange($event)"
    ></app-item-tree>
  `,
})
class TestComponent {
  data?: TreeNode[];
  select?: string;
  highlightIncompatibleNodes = false;

  onSelect = jasmine.createSpy('select');
  onNodeChange = jasmine.createSpy('nodeChange');

  readonly getChildren = (node: TreeNode): TreeNode[] | undefined => node.children;
}

function findNode(nodes: DebugElement[], id: string) {
  // Use native elemenent instead of node.attributes to make it compatible with Ivy.
  return nodes.find((node) => node.nativeElement.getAttribute('data-itemId') === id);
}

function createTestNode(node: DeepPartial<TreeNode>): TreeNode {
  const defaults = {
    id: '',
    displayName: 'foo',
    isFolder: false,
    isSelectable: true,
    hasChildren: false,
  };

  return {
    ...defaults,
    ...node,
    template: node.template
      ? {
          id: node.template.id ?? '',
          baseTemplateIds: (node.template.baseTemplateIds ?? []).filter((id): id is string => id !== undefined),
        }
      : undefined,
    children: node.children ? node.children.map((child) => createTestNode(child!)) : undefined,
  };
}

function createTestTree(nodes: Array<DeepPartial<TreeNode>>): TreeNode[] {
  return nodes.map((node) => createTestNode(node));
}

describe(ItemTreeComponent.name, () => {
  let component: ItemTreeComponent;
  let componentDe: DebugElement;
  let testComponent: TestComponent;
  let testContextMenu: TestContextMenuComponent;
  let fixture: ComponentFixture<TestComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, ItemTreeModule],
      declarations: [TestComponent, TestContextMenuComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();

    componentDe = fixture.debugElement.query(By.directive(ItemTreeComponent));
    component = componentDe.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('data', () => {
    it('should render the nodes', () => {
      testComponent.data = createTestTree([
        { id: '1', displayName: 'node1', isFolder: true, hasChildren: true },
        { id: '2', displayName: 'node2' },
      ]);
      fixture.detectChanges();

      const nodes = componentDe.queryAll(By.directive(NestedTreeNodeDirective));
      expect(nodes.length).toBe(2);
    });

    it('should expand the first node by default', () => {
      testComponent.data = createTestTree([
        {
          id: '1',
          displayName: 'node1',
          hasChildren: true,
          children: [{ id: '1.1', displayName: 'foo' }],
        },
        {
          id: '2',
          displayName: 'node2',
          hasChildren: true,
          children: [{ id: '2.1', displayName: 'foo' }],
        },
      ]);
      fixture.detectChanges();

      const nodes = componentDe.queryAll(By.directive(TreeNodeSelectableComponent));
      expect(nodes.length).toBe(3);
    });

    it('should NOT select any nodes by default', () => {
      testComponent.data = createTestTree([
        {
          id: '1',
          displayName: 'node1',
          hasChildren: true,
          children: [{ id: '1.1', displayName: 'foo' }],
        },
        {
          id: '2',
          displayName: 'node2',
          hasChildren: true,
          children: [{ id: '2.1', displayName: 'foo' }],
        },
      ]);
      fixture.detectChanges();

      const selectedNode = componentDe.query(By.css('.ng-spd-tree-selected'));
      expect(selectedNode).toBeFalsy();
    });

    it('should highlight incompatible nodes', () => {
      testComponent.highlightIncompatibleNodes = true;
      testComponent.data = createTestTree([
        { id: '1', displayName: 'node1', isCompatible: true },
        { id: '2', displayName: 'node2', isCompatible: false },
      ]);

      const expectedIncompatibleNodeOpacity = '0.6';

      fixture.detectChanges();

      const nodes = componentDe.queryAll(By.directive(NestedTreeNodeDirective));
      const compatibleNodeContent = nodes[0].nativeElement.querySelector('.node-content');
      const incompatibleNodeContent = nodes[1].nativeElement.querySelector('.node-content');

      expect(getComputedStyle(compatibleNodeContent).opacity).toBe('1');
      expect(getComputedStyle(incompatibleNodeContent).opacity).toBe(expectedIncompatibleNodeOpacity);
    });

    describe('AND select is supplied', () => {
      it('should select the corresponding node', () => {
        testComponent.data = createTestTree([
          { id: '1', displayName: 'node1' },
          { id: '2', displayName: 'node2' },
        ]);
        testComponent.select = '2';
        fixture.detectChanges();

        const nodes = componentDe.queryAll(By.directive(TreeNodeSelectableComponent));
        const selectedNode = findNode(nodes, '2')!;
        const notSelectedNode = findNode(nodes, '1')!;

        expect(selectedNode.classes['ng-spd-tree-selected']).toBeTruthy();
        expect(notSelectedNode.classes['ng-spd-tree-selected']).toBeFalsy();
      });

      it('should select the virtual page template node if the selected node is context item', () => {
        testComponent.data = createTestTree([
          {
            id: 'testid',
            displayName: 'page01',
            template: { id: '83754CB5-0447-4022-906D-BB36718AD183', baseTemplateIds: [] },
          },
          { id: '1', displayName: 'node1' },
        ]);
        testComponent.select = 'testid';
        fixture.detectChanges();

        const nodes = componentDe.queryAll(By.directive(TreeNodeSelectableComponent));
        const selectedNode = findNode(nodes, 'testid')!;
        const notSelectedNode = findNode(nodes, '1')!;

        expect(selectedNode.classes['ng-spd-tree-selected']).toBeTruthy();
        expect(notSelectedNode.classes['ng-spd-tree-selected']).toBeFalsy();
      });

      it('should expand all the ancestors of the selected node (including the selected node)', () => {
        testComponent.data = createTestTree([
          {
            id: '1',
            displayName: 'node1',
            hasChildren: true,
            children: [
              {
                id: '1.1',
                displayName: 'foo 1.1',
                hasChildren: true,
                children: [{ id: '1.1.1', displayName: 'foo 1.1.1' }],
              },
              {
                id: '1.2',
                displayName: 'foo 1.2',
                hasChildren: true,
                children: [{ id: '1.2.1', displayName: 'foo 1.2.1' }],
              },
            ],
          },
        ]);

        testComponent.select = '1.1';
        fixture.detectChanges();

        const nodes = componentDe.queryAll(By.directive(TreeNodeSelectableComponent));
        const childOfSelectedNode = findNode(nodes, '1.1.1');
        const childOfOtherBranch = findNode(nodes, '1.2.1');

        expect(nodes.length).toBe(4);
        expect(childOfSelectedNode).toBeDefined();
        expect(childOfOtherBranch).toBeUndefined();
      });
    });
  });

  describe('select a node', () => {
    it('shoud emit select change with the selected node', () => {
      testComponent.data = createTestTree([
        { id: '1', displayName: 'node1' },
        { id: '2', displayName: 'node2' },
      ]);
      fixture.detectChanges();

      const nodes = componentDe.queryAll(By.directive(TreeNodeSelectableComponent));
      const node = findNode(nodes, '2')!;
      node.triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();

      expect(testComponent.onSelect).toHaveBeenCalledTimes(1);
      expect(testComponent.onSelect).toHaveBeenCalledWith({
        id: '2',
        displayName: 'node2',
        isFolder: false,
        isSelectable: true,
        hasChildren: false,
        children: undefined,
        template: undefined,
      });
    });

    it('should expand the node', () => {
      testComponent.data = createTestTree([
        { id: '0', displayName: 'foo' },
        { id: '1', displayName: 'node1', hasChildren: true, children: [{ id: '1.1', displayName: 'foo' }] },
      ]);
      fixture.detectChanges();

      let nodes = componentDe.queryAll(By.directive(TreeNodeSelectableComponent));
      const lengthBefore = nodes.length;
      const node = findNode(nodes, '1')!;
      node.triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();

      nodes = componentDe.queryAll(By.directive(NestedTreeNodeDirective));
      expect(nodes.length).toBe(3);
      expect(lengthBefore).toBe(2);
    });

    it('should not select a non selectable node', () => {
      testComponent.data = createTestTree([
        {
          id: '1',
          displayName: 'node1',
          isSelectable: false,
          hasChildren: true,
          children: [
            {
              id: '1.1',
              displayName: 'foo',
              isSelectable: false,
              hasChildren: true,
              children: [{ id: '1.1.1', displayName: 'foo' }],
            },
          ],
        },
      ]);
      fixture.detectChanges();

      let nodes = componentDe.queryAll(By.css('div.node'));
      const nodeToExpand = findNode(nodes, '1.1')!;
      nodeToExpand.triggerEventHandler('click', new MouseEvent('click'));
      fixture.detectChanges();

      nodes = componentDe.queryAll(By.directive(NestedTreeNodeDirective));
      expect(testComponent.onSelect).not.toHaveBeenCalled();
      expect(nodes.length).toBe(3);
    });
  });

  describe('edit a node', () => {
    describe('WHEN submit editing', () => {
      it('should emit succesful change', () => {
        testComponent.data = createTestTree([
          {
            id: '1',
            displayName: 'node1',
            isSelectable: true,
            hasChildren: false,
            enableEdit: true,
          },
        ]);
        fixture.detectChanges();

        const nodeToEdit = componentDe.queryAll(By.css('span[contenteditable]'))[0];
        nodeToEdit.nativeElement.focus();
        nodeToEdit.nativeElement.innerText = 'new name';
        nodeToEdit.triggerEventHandler('blur', {});
        fixture.detectChanges();

        expect(testComponent.onNodeChange).toHaveBeenCalledWith({
          status: 'OK',
          oldName: 'node1',
          node: {
            id: '1',
            displayName: 'new name',
            isSelectable: true,
            hasChildren: false,
            enableEdit: false,
            isFolder: false,
            children: undefined,
            template: undefined,
          },
        });
      });
    });

    describe('WHEN cancel editing', () => {
      it('should emit unsuccesful change', () => {
        testComponent.data = createTestTree([
          {
            id: '1',
            displayName: 'node1',
            isSelectable: true,
            hasChildren: false,
            enableEdit: true,
          },
        ]);
        fixture.detectChanges();

        const nodeToEdit = componentDe.queryAll(By.css('span[contenteditable]'))[0];
        nodeToEdit.nativeElement.focus();
        nodeToEdit.nativeElement.innerText = 'new name';
        nodeToEdit.triggerEventHandler('keyup.esc', {});
        fixture.detectChanges();

        expect(testComponent.onNodeChange).toHaveBeenCalledWith({
          status: 'Canceled',
        });
      });
    });

    describe('Context Menu', () => {
      it('should render context menu and pass node id', () => {
        testComponent.data = createTestTree([{ id: 'testNodeId', displayName: 'testDisplayName' }]);
        fixture.detectChanges();

        testContextMenu = componentDe.query(By.directive(TestContextMenuComponent)).componentInstance;
        expect(testContextMenu.node.id).toBe('testNodeId');
      });
    });
  });
});
