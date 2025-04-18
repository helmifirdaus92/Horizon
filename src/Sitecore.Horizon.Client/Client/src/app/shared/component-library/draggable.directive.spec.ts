/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DraggableDirective } from './draggable.directive';

const payload = 'foo';

@Component({
  selector: 'test-draggable',
  template: `<div
    id="test-draggable"
    [appDraggable]="data"
    (draggableDragstart)="onDragStarted()"
    #directive="draggable"
    style="height: 10px; background-color: blue"
  ></div>`,
})
class DraggableTestComponent {
  @ViewChild('directive') directiveRef!: DraggableDirective;
  data = payload;
  onDragStarted() {}
}

describe('DraggableDirective', () => {
  let fixture: ComponentFixture<DraggableTestComponent>;
  let testComponent: DraggableTestComponent;
  let dragEl: DebugElement;
  let sut: DraggableDirective;

  function triggerDragStart() {
    const event = new DragEvent('dragstart', { dataTransfer: new DataTransfer() });
    dragEl.triggerEventHandler('dragstart', event);
    return event;
  }

  function triggerDragEnd() {
    dragEl.triggerEventHandler('dragend', new DragEvent('dragend', { dataTransfer: new DataTransfer() }));
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DraggableDirective, DraggableTestComponent],
    });

    fixture = TestBed.createComponent(DraggableTestComponent);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();

    dragEl = fixture.debugElement.query(By.css('#test-draggable'));
    sut = fixture.debugElement.query(By.directive(DraggableDirective)).injector.get(DraggableDirective);
    fixture.detectChanges();
  });

  it('should export the directive ref as "draggable"', () => {
    expect(testComponent.directiveRef).toBeDefined();
    expect(testComponent.directiveRef instanceof DraggableDirective).toBeTrue();
  });

  describe('WHEN the element is dragged', () => {
    it('should emit dragStarted', () => {
      const spy = spyOn(testComponent, 'onDragStarted');

      triggerDragStart();

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should set isDragging to true', () => {
      expect(sut.isDragging).toBe(false);

      triggerDragStart();
      fixture.detectChanges();

      expect(sut.isDragging).toBe(true);
    });

    it('should assign the payload to the dataTransfer', () => {
      const event = triggerDragStart();

      expect(event.dataTransfer?.getData('Text')).toBe(payload);
    });
  });

  describe('WHEN drag ends', () => {
    it('should set isDragging to false', () => {
      triggerDragStart();
      fixture.detectChanges();
      triggerDragEnd();
      fixture.detectChanges();

      expect(sut.isDragging).toBe(false);
    });
  });
});
