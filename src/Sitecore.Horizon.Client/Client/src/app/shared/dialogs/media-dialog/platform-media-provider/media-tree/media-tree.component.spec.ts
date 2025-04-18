/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TreeModule } from '@sitecore/ng-spd-lib';
import { MediaFolder } from 'app/shared/platform-media/media.interface';
import { MediaTreeComponent } from './media-tree.component';

const grandChild = {
  displayName: 'grandChild',
  hasChildren: false,
  id: '3',
  permissions: {
    canCreate: true,
    canDelete: true,
    canRename: true,
  },
};
const childNode = {
  displayName: 'child',
  hasChildren: true,
  id: '2',
  children: [grandChild],
  permissions: {
    canCreate: true,
    canDelete: true,
    canRename: true,
  },
};
const rootNode = {
  displayName: 'foo',
  hasChildren: true,
  id: '1',
  children: [childNode],
  permissions: {
    canCreate: true,
    canDelete: true,
    canRename: true,
  },
};

const grandChildWithOutPermission = {
  displayName: 'grandChildWithOutPermission',
  hasChildren: false,
  id: '3',
};

const childNodeWithoutPermission = {
  displayName: 'childNodeWithoutPermission',
  hasChildren: true,
  id: '2',
  children: [grandChildWithOutPermission],
};

const rootNodeWithoutPermission = {
  displayName: 'rootNodeWithoutPermission',
  hasChildren: true,
  id: '1',
  children: [childNodeWithoutPermission],
};

@Component({
  template: `
    <app-media-tree [data]="data" [getChildren]="getChildren" (selectChange)="selectChange($event)"></app-media-tree>
  `,
})
class TestComponent {
  data: MediaFolder[] = [rootNode];

  selectChange = jasmine.createSpy('select change spy');

  getChildren(node: MediaFolder) {
    return node.children;
  }
}

describe('MediaTreeComponent', () => {
  let testComponent: TestComponent;
  let component: MediaTreeComponent;
  let componentDe: DebugElement;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TreeModule],
      declarations: [MediaTreeComponent, TestComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    componentDe = fixture.debugElement.query(By.directive(MediaTreeComponent));
    component = componentDe.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('[data]', () => {
    describe('AND select is not set', () => {
      beforeEach(async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
      });

      it('should render the tree with the root node', () => {
        const rootText = componentDe.query(By.css('ng-spd-nested-tree-node .text'));

        expect(rootText).toBeTruthy();
        expect((rootText.nativeElement as HTMLElement).innerText).toBe(rootNode.displayName);
      });

      it('should expand the root by default', () => {
        const nodes = componentDe.queryAll(By.css('ng-spd-nested-tree-node'));

        expect(nodes.length).toBe(component.data!.length + rootNode.children.length);
        expect((nodes[1].nativeElement as HTMLElement).innerText).toBe(childNode.displayName);
      });

      it('should select the root by default', () => {
        const selectableNodes = componentDe.queryAll(By.css('[ngSpdTreeNodeSelectable]'));

        expect(selectableNodes[0].classes['ng-spd-tree-selected']).toBeTruthy();
        for (let i = 1; i < selectableNodes.length; i++) {
          expect(selectableNodes[i].classes['ng-spd-tree-selected']).toBeFalsy();
        }
      });
    });

    describe('AND select is set', () => {
      beforeEach(async () => {
        component.select = childNode.id;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
      });

      it('should expand the selected folder', () => {
        const nodes = componentDe.queryAll(By.css('ng-spd-nested-tree-node'));
        const grandChildDe = nodes[2];

        expect(nodes.length).toBe(3);
        expect((grandChildDe.nativeElement as HTMLElement).innerText.trim()).toBe(grandChild.displayName);
      });

      it('should select the selected folder', () => {
        const selectableNodes = componentDe.queryAll(By.css('[ngSpdTreeNodeSelectable]'));

        expect(selectableNodes[0].classes['ng-spd-tree-selected']).toBeFalsy();
        expect(selectableNodes[1].classes['ng-spd-tree-selected']).toBe(true);
        expect(selectableNodes[2].classes['ng-spd-tree-selected']).toBeFalsy();
      });
    });

    describe('AND select is set BUT selected folder is not found in the data', () => {
      beforeEach(async () => {
        component.select = 'this-id-wont-be-found';
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
      });

      it('should expand the root', () => {
        const nodes = componentDe.queryAll(By.css('ng-spd-nested-tree-node'));

        expect(nodes.length).toBe(component.data!.length + rootNode.children.length);
        expect((nodes[1].nativeElement as HTMLElement).innerText).toBe(childNode.displayName);
      });

      it('should select the root', () => {
        const selectableNodes = componentDe.queryAll(By.css('[ngSpdTreeNodeSelectable]'));

        expect(selectableNodes[0].classes['ng-spd-tree-selected']).toBe(true);
        for (let i = 1; i < selectableNodes.length; i++) {
          expect(selectableNodes[i].classes['ng-spd-tree-selected']).toBeFalsy();
        }
      });
    });
  });

  describe('(selectChange)', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('should emit initial selection', () => {
      expect(testComponent.selectChange).toHaveBeenCalledWith(rootNode);
    });

    it('should emit when selection changes', () => {
      component.treeControl.select(childNode);
      expect(testComponent.selectChange).toHaveBeenCalledWith(childNode);
    });
  });

  describe('[data] without permissions', () => {
    describe('AND select is not set', () => {
      beforeEach(async () => {
        testComponent.data = [rootNodeWithoutPermission];
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
      });

      it('should render the tree with the root node', () => {
        const rootText = componentDe.query(By.css('ng-spd-nested-tree-node .text'));

        expect(rootText).toBeTruthy();
        expect((rootText.nativeElement as HTMLElement).innerText).toBe(rootNodeWithoutPermission.displayName);
      });

      it('should expand the root by default', () => {
        const nodes = componentDe.queryAll(By.css('ng-spd-nested-tree-node'));

        expect(nodes.length).toBe(component.data!.length + rootNodeWithoutPermission.children.length);
        expect((nodes[1].nativeElement as HTMLElement).innerText).toBe(childNodeWithoutPermission.displayName);
      });

      it('should select the root by default', () => {
        const selectableNodes = componentDe.queryAll(By.css('[ngSpdTreeNodeSelectable]'));

        expect(selectableNodes[0].classes['ng-spd-tree-selected']).toBeTruthy();
        for (let i = 1; i < selectableNodes.length; i++) {
          expect(selectableNodes[i].classes['ng-spd-tree-selected']).toBeFalsy();
        }
      });
    });
  });
});
