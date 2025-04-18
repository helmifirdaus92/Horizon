/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { SplitPaneComponent } from './split-pane.component';

@Component({
  template: '<ng-spd-split-pane [width]="width" [isStatic]="isStatic"></ng-spd-split-pane>',
})
class TestSplitPaneComponent {
  width?: number;
  isStatic = false;
}

describe(SplitPaneComponent.name, () => {
  let component: SplitPaneComponent;
  let fixture: ComponentFixture<SplitPaneComponent>;
  let de: DebugElement;

  let componentTestSplitPaneComponent: TestSplitPaneComponent;
  let sut: SplitPaneComponent;
  let fixtureTestSplitPaneComponent: ComponentFixture<TestSplitPaneComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [SplitPaneComponent, TestSplitPaneComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitPaneComponent);
    de = fixture.debugElement;
    component = fixture.componentInstance;
    fixture.detectChanges();

    fixtureTestSplitPaneComponent = TestBed.createComponent(TestSplitPaneComponent);
    componentTestSplitPaneComponent = fixtureTestSplitPaneComponent.componentInstance;
    fixtureTestSplitPaneComponent.detectChanges();
    sut = fixtureTestSplitPaneComponent.debugElement.query(By.directive(SplitPaneComponent)).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(componentTestSplitPaneComponent).toBeTruthy();
  });

  describe('width', () => {
    it('should set default width property if value is not provided', () => {
      expect(sut.width).toBe(SplitPaneComponent.minWidth);
    });

    it('should set provided width property', () => {
      componentTestSplitPaneComponent.width = 50;
      fixtureTestSplitPaneComponent.detectChanges();

      expect(sut.width).toBe(50);
    });
  });

  describe('isStatic', () => {
    it('should set provided value', () => {
      componentTestSplitPaneComponent.isStatic = true;
      fixtureTestSplitPaneComponent.detectChanges();

      expect(sut.isStatic).toBe(true);
    });
  });

  describe('startDragging()', () => {
    it('should create listeners for mouse and touch events', () => {
      const dragEventSpy = spyOn(component, 'dragEvent');
      const stopDraggingSpy = spyOn(component, 'stopDragging');

      component.startDragging(new MouseEvent(''));

      document.dispatchEvent(new Event('touchmove'));
      document.dispatchEvent(new Event('mousemove'));
      document.dispatchEvent(new Event('mouseup'));
      document.dispatchEvent(new Event('touchend'));
      document.dispatchEvent(new Event('touchcancel'));

      expect(dragEventSpy).toHaveBeenCalledTimes(2);
      expect(stopDraggingSpy).toHaveBeenCalledTimes(3);
    });

    it('should use mouseEvent.clientX as input for dragEvent, when startEvent is of type MouseEvent', () => {
      const dragEventSpy = spyOn(component, 'dragEvent');
      const startEvent = new MouseEvent('', { clientX: 1000 });
      const mouseMoveEvent = new Event('mousemove');

      component.startDragging(startEvent);

      document.dispatchEvent(mouseMoveEvent);

      expect(dragEventSpy).toHaveBeenCalledWith(mouseMoveEvent as any, startEvent.clientX, component.width);
    });

    it('should use touchEvent.touches[0].clientX as input for dragEvent, when startEvent is of type TouchEvent', () => {
      const dragEventSpy = spyOn(component, 'dragEvent');
      const touchInit = { identifier: 1, target: de.nativeElement, clientX: 2000 } as TouchInit;
      const startEvent = new TouchEvent('foo', { touches: [new Touch(touchInit)] });
      const touchMoveEvent = new Event('touchmove');

      component.startDragging(startEvent);

      document.dispatchEvent(touchMoveEvent);

      expect(dragEventSpy).toHaveBeenCalledWith(touchMoveEvent as any, startEvent.touches[0].clientX, component.width);
    });
  });

  describe('stopDragging()', () => {
    it('should not emit dragging, when [isDragging] is false', () => {
      const spy = jasmine.createSpy('SplitPane stopDragging() isDragging false spy');
      component.dragging.subscribe(spy);

      component.stopDragging();

      expect(spy).not.toHaveBeenCalled();
    });

    describe('when [isDragging] is true', () => {
      beforeEach(() => {
        component.isDragging = true;
      });

      it('should remove all drag listeners', () => {
        const dragEventSpy = spyOn(component, 'dragEvent').and.callThrough();
        const stopDraggingSpy = spyOn(component, 'stopDragging').and.callThrough();

        component.startDragging(new MouseEvent(''));
        component.stopDragging();

        document.dispatchEvent(new Event('touchmove'));
        document.dispatchEvent(new Event('mousemove'));
        document.dispatchEvent(new Event('mouseup'));
        document.dispatchEvent(new Event('touchend'));
        document.dispatchEvent(new Event('touchcancel'));

        expect(dragEventSpy).toHaveBeenCalledTimes(0);
        expect(stopDraggingSpy).toHaveBeenCalledTimes(1);
      });

      it('should set [isDragging] to `false`', () => {
        component.stopDragging();

        expect(component.isDragging).toBeFalsy();
      });

      it('should emit dragging has ended', () => {
        const spy = jasmine.createSpy('SplitPane stopDragging() isDragging false spy');
        component.dragging.subscribe(spy);

        component.stopDragging();

        expect(spy).toHaveBeenCalled();
      });
    });
  });

  describe('dragEvent()', () => {
    it('should emit dragging with event.clientX, when event is type MouseEvent', () => {
      const spy = jasmine.createSpy('SplitPane dragEvent MouseEvent');
      const event = new MouseEvent('foo', { clientX: 1000 });

      component.dragging.subscribe(spy);

      component.dragEvent(event, 2, 2);

      expect(spy).toHaveBeenCalledWith({ phase: 'move', width: event.clientX });
    });

    it('should emit dragging with event.touches[0].clientX, when event is type TouchEvent', () => {
      const spy = jasmine.createSpy('SplitPane dragEvent TouchEvent');
      const touchInit = { identifier: 1, target: de.nativeElement, clientX: 2000 } as TouchInit;
      const event = new TouchEvent('foo', { touches: [new Touch(touchInit)] });

      component.dragging.subscribe(spy);

      component.dragEvent(event, 2, 2);

      expect(spy).toHaveBeenCalledWith({ phase: 'move', width: event.touches[0].clientX });
    });

    it('should emit dragging with the width 300, when input calculation goes below 300', () => {
      const spy = jasmine.createSpy('SplitPane dragEvent width');
      const event = new MouseEvent('foo', { clientX: 300 });

      component.dragging.subscribe(spy);

      component.dragEvent(event, 100, 50);

      expect(spy).toHaveBeenCalledWith({ phase: 'move', width: 300 });
    });
  });
});
