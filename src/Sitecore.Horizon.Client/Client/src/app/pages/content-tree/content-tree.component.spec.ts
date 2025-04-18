/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, Directive, EventEmitter, Input, NO_ERRORS_SCHEMA, Output } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import {
  ContentEditableModule,
  LoadingIndicatorComponent,
  LoadingIndicatorModule,
  TreeModule,
} from '@sitecore/ng-spd-lib';
import { VersionActionsDialogService } from 'app/editor/right-hand-side/versions/version-actions-dialog/version-actions-dialog.service';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextServiceTestingModule } from 'app/shared/client-state/context.service.testing';
import { temporaryItemIdPrefix } from 'app/shared/dialogs/datasource-picker/datasource-picker.service';
import { Item } from 'app/shared/graphql/item.interface';
import { AppLetModule } from 'app/shared/utils/let-directive/let.directive';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { TranslateServiceStubModule } from 'app/testing/translate-service-stub.module';
import { of } from 'rxjs';
import { CdpSiteDataService } from '../left-hand-side/personalization/personalization-services/cdp-site-data.service';
import { ContentTreeLocking } from './content-tree-locking';
import { ContentTreeNode } from './content-tree-node';
import { ContentTreePermissions } from './content-tree-permissions';
import { ContentTreeComponent } from './content-tree.component';

@Component({
  selector: 'test-content-tree',
  template:
    '<app-content-tree [contentTreeData]="contentTreeData" [selectedPageId]="selectedPageId" [isCreatingNewItem]= "isCreatingNewItem"></app-content-tree>',
})
class TestComponent {
  contentTreeData: ContentTreeNode[] = [];
  isCreatingNewItem = false;
  selectedPageId = '';
}

@Component({
  selector: 'app-content-tree-context',
  template: '',
})
class TestContextMenuComponent {
  @Input() node: ContentTreeNode | null = null;
  @Output() createVersionChange = new EventEmitter<ContentTreeNode>();

  popoverIsActiveState = false;

  popoverIsActive() {
    return this.popoverIsActiveState;
  }
}

@Directive({
  selector: '[appDraggable]',
  exportAs: 'draggable',
})
class TestDraggableDirective {}

@Directive({
  selector: '[appDrop]',
  exportAs: 'drop',
})
class TestDropDirective {}

function createParentChildTreeData() {
  const parent = new ContentTreeNode({
    id: 'parent',
    item: {} as Item,
    text: 'Parent',
    permissions: ContentTreePermissions.empty(),
    locking: ContentTreeLocking.empty(),
    hasChildren: true,
  });
  const child = new ContentTreeNode({
    id: 'childid',
    item: {} as Item,
    text: 'Child',
    permissions: ContentTreePermissions.empty(),
    locking: ContentTreeLocking.empty(),
    parent,
    enableEdit: true,
  });

  parent.updateChildren([child]);

  return { parent, child };
}

const nodeCssSelector = '.node';

describe('ContentTreeComponent', () => {
  let fixture: ComponentFixture<TestComponent>;
  let debugElement: DebugElement;
  let testComponent: TestComponent;
  let sut: ContentTreeComponent;
  let versionActionsDialogServiceSpy: jasmine.SpyObj<any>;
  let cdpSiteDataServiceSpy: jasmine.SpyObj<CdpSiteDataService>;

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

  const loadingIndicator = () => fixture.debugElement.query(By.css('.loading-indicator'));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        LoadingIndicatorModule,
        TreeModule,
        ContentEditableModule,
        TranslateModule,
        TranslateServiceStubModule,
        AppLetModule,
        ContextServiceTestingModule,
      ],
      declarations: [
        TestComponent,
        TestContextMenuComponent,
        ContentTreeComponent,
        TestDraggableDirective,
        TestDropDirective,
      ],
      providers: [
        {
          provide: VersionActionsDialogService,
          useValue: jasmine.createSpyObj(VersionActionsDialogService, ['showCreateVersionDialog']),
        },
        {
          provide: CdpSiteDataService,
          useValue: jasmine.createSpyObj<CdpSiteDataService>(['watchCdpSiteData']),
        },
        {
          provide: FeatureFlagsService,
          useValue: jasmine.createSpyObj<FeatureFlagsService>(['isFeatureEnabled']),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    versionActionsDialogServiceSpy = TestBedInjectSpy(VersionActionsDialogService);

    cdpSiteDataServiceSpy = TestBedInjectSpy(CdpSiteDataService);
    cdpSiteDataServiceSpy.watchCdpSiteData.and.returnValue(
      of({ hasPagePersonalization: () => true, hasPageWithAbTest: () => true } as any),
    );

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.debugElement.componentInstance;
    debugElement = fixture.debugElement.query(By.directive(ContentTreeComponent));
    sut = debugElement.componentInstance;
  });

  it('should be created', () => {
    expect(testComponent).toBeTruthy();
  });

  describe('given [contentTreeData] is provided items', () => {
    describe('where first item is a page', () => {
      beforeEach(() => {
        testComponent.contentTreeData = [
          new ContentTreeNode({
            id: 'foo',
            item: {} as Item,
            text: 'Foo',
            permissions: allowPermissions,
            locking: itemLocking,
          }),
        ];

        fixture.detectChanges();
      });

      it('should render a page node', () => {
        const pages = debugElement.queryAll(By.css('.mdi-file-outline'));
        expect(pages.length).toBe(1);
      });
    });

    describe('where first item is a folder', () => {
      beforeEach(() => {
        testComponent.contentTreeData = [
          new ContentTreeNode({
            id: 'foo',
            item: {} as Item,
            text: 'Foo',
            permissions: allowPermissions,
            locking: itemLocking,
            isFolder: true,
          }),
        ];
        fixture.detectChanges();
      });

      it('should render a folder node', () => {
        const folders = debugElement.queryAll(By.css('.mdi-folder-outline'));
        expect(folders.length).toBe(1);
      });
    });

    describe('where first item has children', () => {
      beforeEach(() => {
        testComponent.contentTreeData = [
          new ContentTreeNode({
            id: 'foo',
            item: {} as Item,
            text: 'Foo',
            permissions: allowPermissions,
            locking: itemLocking,
            hasChildren: true,
          }),
        ];
        fixture.detectChanges();
      });

      it('should make node expandable', () => {
        const firstItem = testComponent.contentTreeData[0];
        expect(sut.treeControl.isExpandable(firstItem)).toBe(true);
      });

      describe('when user expands node', () => {
        let node: ContentTreeNode | undefined;
        beforeEach(() => {
          const sub = sut.expandChange.subscribe((value: ContentTreeNode) => {
            node = value;
            node.isLoading = true;
          });
          const toggleButton = debugElement.query(By.css('[ngSpdTreeToggleButton]'));
          (toggleButton.nativeElement as HTMLElement).dispatchEvent(new MouseEvent('click'));

          sub.unsubscribe();
          fixture.detectChanges();
        });

        afterEach(() => {
          // component listens children to update when expand is triggered
          // this is done to ensure no subscriptions hang
          if (node) {
            node.updateChildren([]);
          }
        });

        it('should fire an (expandChange) event', () => {
          expect(node).toBeTruthy();
        });

        it('should show progress-indicator, until children are updated', () => {
          let progressIndicator = debugElement.query(By.directive(LoadingIndicatorComponent));
          expect(progressIndicator).toBeTruthy();

          if (node) {
            node.isLoading = false;
            node.resetChildren();
          }
          fixture.detectChanges();

          progressIndicator = debugElement.query(By.directive(LoadingIndicatorComponent));
          expect(progressIndicator).toBeFalsy();
        });

        describe('when user collapse node', () => {
          beforeEach(() => {
            const toggleButton = debugElement.query(By.css('[ngSpdTreeToggleButton]'));
            (toggleButton.nativeElement as HTMLElement).dispatchEvent(new MouseEvent('click'));
            fixture.detectChanges();
          });

          it('node should empty its children as we re-fetch items on each expand', () => {
            expect(node!.children.length).toBe(0);
          });
        });
      });
    });

    describe('where items are selectable (not-a-folder)', () => {
      beforeEach(() => {
        testComponent.contentTreeData = [
          new ContentTreeNode({
            id: 'foo',
            item: {} as Item,
            text: 'Foo',
            permissions: allowPermissions,
            locking: itemLocking,
            hasChildren: true,
            isFolder: false,
          }),
          new ContentTreeNode({
            id: 'bar',
            item: {} as Item,
            text: 'Bar',
            permissions: allowPermissions,
            locking: itemLocking,
            isFolder: false,
          }),
        ];
        fixture.detectChanges();
      });

      describe('when user click on selectable node', () => {
        let node: ContentTreeNode;

        beforeEach(() => {
          const sub = sut.selectChange.subscribe((value: ContentTreeNode) => (node = value));
          const nodeContent = debugElement.query(By.css(nodeCssSelector));
          (nodeContent.nativeElement as HTMLElement).dispatchEvent(new MouseEvent('click'));
          sub.unsubscribe();
          fixture.detectChanges();
        });

        it('(selectChange) should be called', () => {
          expect(node).toBeTruthy();
        });

        it('node should be expanded', () => {
          expect(sut.treeControl.isExpanded(node)).toBe(true);
        });
      });

      describe('when [selectedPageId] is set', () => {
        beforeEach(() => {
          testComponent.selectedPageId = 'bar';
          fixture.detectChanges();
        });

        it('should highlight selectedPageId', () => {
          const selectedElement = debugElement.query(By.css(nodeCssSelector + '.selected'));
          expect(selectedElement.nativeElement.innerText.trim()).toBe('Bar');
        });
      });
    });

    describe('where first item is editable', () => {
      let el: DebugElement;

      beforeEach(fakeAsync(() => {
        testComponent.selectedPageId = 'foo';
        testComponent.contentTreeData = [
          new ContentTreeNode({
            id: testComponent.selectedPageId,
            item: {} as Item,
            text: 'Bar',
            permissions: allowPermissions,
            locking: itemLocking,
            enableEdit: true,
          }),
        ];
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
        el = debugElement.query(By.css('[contenteditable="true"]'));
        flush();
      }));

      it('should render a page node with `contenteditable=true`', () => {
        expect(el).toBeTruthy();
      });
    });
  });

  describe('when a key is pressed', () => {
    describe('and the key is not F2', () => {
      it('should do nothing', () => {
        const spy = spyOn(sut.treeControl, 'getSelected');

        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'A' }));

        expect(spy).not.toHaveBeenCalled();
      });
    });

    describe('and the key is F2', () => {
      it('should do nothing, when there a no permissions to write', () => {
        spyOn(sut.treeControl, 'getSelected').and.returnValue([
          { permissions: { canWrite: false } } as ContentTreeNode,
        ]);
        const spy = spyOnProperty(document, 'activeElement');

        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'F2' }));

        expect(spy).not.toHaveBeenCalled();
      });

      it(`should do nothing, when the 'data-itemId' attribute of activeElement,
      does not match the selected node id`, () => {
        const fakeSelectedNode = {
          enableEdit: false,
          id: 'foo',
          permissions: { canWrite: true },
        } as ContentTreeNode;
        spyOn(sut.treeControl, 'getSelected').and.returnValue([fakeSelectedNode]);
        const getAttributeSpy = jasmine.createSpy('contentTreeComponent getAttribute spy').and.returnValue('bar');
        spyOnProperty(document, 'activeElement').and.returnValue({
          getAttribute: getAttributeSpy,
        } as any);

        document.dispatchEvent(new KeyboardEvent('keyup', { key: 'F2' }));

        expect(fakeSelectedNode.enableEdit).toBe(false);
      });
    });
  });

  describe('onNodeSubmit()', () => {
    it('should update the given node and emit the change', () => {
      const nodeOptions = {
        enableEdit: true,
        id: 'foo',
        item: {} as Item,
        text: 'bar',
        permissions: ContentTreePermissions.empty(),
        locking: ContentTreeLocking.empty(),
      };
      const testNode = new ContentTreeNode(nodeOptions);
      sut.nodeChange.subscribe(({ node, oldName }: { node: ContentTreeNode; oldName: string }) => {
        expect(node.text).toBe('baz');
        expect(oldName).toBe('bar');
      });

      sut.onNodeSubmit(testNode, 'baz');
    });
  });

  describe('onNodeCancel()', () => {
    it('should update the given node and emit the change', () => {
      const nodeOptions = {
        enableEdit: true,
        item: {} as Item,
        id: 'foo',
        text: 'bar',
        permissions: ContentTreePermissions.empty(),
        locking: ContentTreeLocking.empty(),
      };
      const testNode = new ContentTreeNode(nodeOptions);
      sut.nodeChange.subscribe(({ canceled }: { node: ContentTreeNode; canceled: boolean }) => {
        expect(canceled).toBeTruthy();
      });

      sut.onNodeCancel(testNode);
    });
  });

  describe('collapse()', () => {
    it('should collapse the node', () => {
      // arrange
      const { parent } = createParentChildTreeData();
      testComponent.contentTreeData = [parent];
      fixture.detectChanges();

      sut.treeControl.expand(parent);
      fixture.detectChanges();

      const nodesBefore = debugElement.queryAll(By.css(nodeCssSelector));

      // act
      sut.collapse(parent);

      // assert
      expect(nodesBefore.length).toBe(2);
      expect(debugElement.queryAll(By.css(nodeCssSelector)).length).toBe(1);
    });

    it('should not collapse the node while editing', () => {
      // arrange
      const { parent } = createParentChildTreeData();
      testComponent.contentTreeData = [parent];
      fixture.detectChanges();

      sut.treeControl.expand(parent);
      fixture.detectChanges();

      const nodesBefore = debugElement.queryAll(By.css(nodeCssSelector));
      parent.enableEdit = true;

      // act
      sut.collapse(parent);

      // assert
      expect(nodesBefore.length).toBe(2);
      expect(debugElement.queryAll(By.css(nodeCssSelector)).length).toBe(2);
    });
  });

  describe('onNodeDrop', () => {
    it('should emit nodeDrop and expand dropNode', () => {
      // arrange
      const { parent, child } = createParentChildTreeData();

      testComponent.contentTreeData = [parent];
      fixture.detectChanges();
      sut.treeControl.expand(parent);

      const spy = jasmine.createSpy();
      const expandSpy = spyOn(sut.treeControl, 'expand').and.callThrough();
      sut.nodeDrop.subscribe(spy);

      // act
      sut.onNodeDrop({ payload: child.id, offsetBottom: 15, offsetTop: 15 }, parent);

      // assert
      expect(spy).toHaveBeenCalledWith({ nodeId: child.id, dropNode: parent, position: 'INTO' });
      expect(expandSpy).toHaveBeenCalledWith(parent);
    });
  });

  describe('node hover state with context menu', () => {
    it('should have hover state when context menu is active', fakeAsync(() => {
      // arrange
      const rootNode = new ContentTreeNode({
        id: 'foo',
        item: {} as Item,
        text: 'Foo',
        permissions: allowPermissions,
        locking: itemLocking,
      });

      const childNode = new ContentTreeNode({
        id: 'foo2',
        item: {} as Item,
        text: 'Foo2',
        permissions: allowPermissions,
        locking: itemLocking,
        parent: rootNode,
      });

      testComponent.contentTreeData = [rootNode, childNode];
      fixture.detectChanges();
      const menus = fixture.debugElement.queryAll(By.directive(TestContextMenuComponent));

      // act
      menus[0].componentInstance.popoverIsActiveState = true;
      menus[1].componentInstance.popoverIsActiveState = true;
      fixture.detectChanges();
      const nodes = debugElement.queryAll(By.css(nodeCssSelector));

      // assert
      expect((nodes[0].nativeElement as HTMLElement).className).toContain('hovered');
      expect((nodes[1].nativeElement as HTMLElement).className).toContain('hovered');
      flush();
    }));
  });

  describe('isNewItemCreationInProgress', () => {
    it('should show loading indicator when creating new item', () => {
      // arrange
      const testNode = new ContentTreeNode({
        id: temporaryItemIdPrefix + 'foo',
        item: {} as Item,
        text: 'bar',
        permissions: allowPermissions,
        locking: itemLocking,
      });
      testComponent.isCreatingNewItem = true;
      fixture.detectChanges();

      // act
      sut.isNewItemCreationInProgress(testNode);

      // assert
      expect(loadingIndicator()).toBeDefined();
    });

    it('should not show loading indicator when new item is created', () => {
      // arrange
      const testNode = new ContentTreeNode({
        id: 'itemId',
        item: {} as Item,
        text: 'bar',
        permissions: allowPermissions,
        locking: itemLocking,
      });
      testComponent.isCreatingNewItem = false;
      fixture.detectChanges();

      // act
      sut.isNewItemCreationInProgress(testNode);

      // assert
      expect(loadingIndicator()).toBeNull();
    });
  });

  describe('createVersion', () => {
    it('should show version dialog on icon button click from content tree context', () => {
      // arrange
      versionActionsDialogServiceSpy.showCreateVersionDialog.and.returnValue(of(true));
      const testNode = new ContentTreeNode({
        id: 'foo',
        item: {} as Item,
        text: 'bar',
        permissions: allowPermissions,
        locking: itemLocking,
      });
      testComponent.contentTreeData = [testNode];
      fixture.detectChanges();

      // act
      const contentTreeContextComp = fixture.debugElement.queryAll(By.directive(TestContextMenuComponent))[0]
        .componentInstance;
      contentTreeContextComp.createVersionChange.emit(testNode);

      // assert
      expect(versionActionsDialogServiceSpy.showCreateVersionDialog).toHaveBeenCalled();
    });

    it('should add `no-versions` class to the node if node does not have versions', () => {
      // arrange
      const testNode = new ContentTreeNode({
        id: 'foo',
        item: {} as Item,
        text: 'bar',
        permissions: allowPermissions,
        locking: itemLocking,
        isFolder: false,
        hasVersions: false,
      });
      testComponent.contentTreeData = [testNode];
      fixture.detectChanges();

      // act
      const noVersionNode = debugElement.queryAll(By.css('.no-versions'))[0];

      // assert
      expect(noVersionNode).toBeDefined();
    });
  });
});
