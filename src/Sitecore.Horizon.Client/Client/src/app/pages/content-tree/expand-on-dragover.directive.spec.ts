/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NestedTreeNodeDirective, TreeControl } from '@sitecore/ng-spd-lib';
import { DraggableDirective } from 'app/shared/component-library/draggable.directive';
import { DropDirective } from 'app/shared/component-library/drop.directive';
import { TestBedInjectSpy } from 'app/testing/test.utils';
import { Subject } from 'rxjs';
import { ExpandOnDragoverDirective } from './expand-on-dragover.directive';

@Component({
  selector: 'test-expand-dragover',
  template: `<div appExpandOnDragover></div>`,
})
class TestComponent {}

const expandDelay = ExpandOnDragoverDirective.expandDelay;

describe('ExpandOnDragoverDirective', () => {
  let sut: ExpandOnDragoverDirective;
  let fixture: ComponentFixture<TestComponent>;

  let drop: { isDragover$: Subject<boolean> };
  let control: jasmine.SpyObj<TreeControl<any>>;
  let nodeData: any;
  let draggable: { isDragging: boolean };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent, ExpandOnDragoverDirective],
      providers: [
        { provide: DraggableDirective, useValue: { isDragging: false } },
        { provide: DropDirective, useValue: { isDragover$: new Subject<boolean>() } },
        { provide: TreeControl, useValue: jasmine.createSpyObj<TreeControl<any>>('tree-control', ['expand']) },
        { provide: NestedTreeNodeDirective, useValue: { data: 'node-data' } },
      ],
    });

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    sut = fixture.debugElement.query(By.directive(ExpandOnDragoverDirective)).componentInstance;
    fixture.detectChanges();

    drop = TestBed.inject(DropDirective) as any;
    control = TestBedInjectSpy(TreeControl);
    nodeData = TestBed.inject(NestedTreeNodeDirective).data;
    draggable = TestBed.inject(DraggableDirective);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  describe('WHEN isDragover emits true', () => {
    it('should expand the node after `expandDelay`', fakeAsync(() => {
      drop.isDragover$.next(true);
      expect(control.expand).not.toHaveBeenCalled();
      tick(expandDelay);
      expect(control.expand).toHaveBeenCalledWith(nodeData);
      flush();
    }));

    // it should not expand when the node is the same one that is dragging
    // because we want the dragging node to be collapsed
    describe('AND the node is dragging', () => {
      it('should not expand the node', fakeAsync(() => {
        draggable.isDragging = true;
        fixture.detectChanges();

        drop.isDragover$.next(true);
        tick(expandDelay);

        expect(control.expand).not.toHaveBeenCalled();
        flush();
      }));
    });

    describe('AND isDragover emits true a second time', () => {
      it('should continue to expand the node after the initial `expandDelay`', fakeAsync(() => {
        const timeToSecondDragover = 100;

        drop.isDragover$.next(true);
        tick(timeToSecondDragover);
        drop.isDragover$.next(true);
        tick(expandDelay - timeToSecondDragover);

        expect(control.expand).toHaveBeenCalledWith(nodeData);
        flush();
      }));
    });
  });

  describe('WHEN isDragover emits false', () => {
    it('should cancel any pending expand', fakeAsync(() => {
      const timeToDragend = 100;

      drop.isDragover$.next(true);
      tick(timeToDragend);
      drop.isDragover$.next(false);
      tick(expandDelay);

      expect(control.expand).not.toHaveBeenCalled();
      flush();
    }));
  });
});
