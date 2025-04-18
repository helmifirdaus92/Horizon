/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DropDirective, DropEvent } from './drop.directive';

@Component({
  selector: 'test-drop',
  template: `
    <div
      id="test"
      (appDrop)="onDrop($event)"
      #directive="drop"
      [canDrop]="canDrop"
      (appDropDragenter)="onDragEnter()"
      (appDropDragleave)="onDragLeave()"
      style="height: 10px; background-color: blue"
    >
      <div id="inner"></div>
    </div>
  `,
})
class TestComponent {
  @ViewChild('directive') directiveRef!: DropDirective;
  canDrop = true;
  onDrop(_event: DropEvent) {}
  onDragEnter() {}
  onDragLeave() {}
}

describe('DropDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let testComponent: TestComponent;
  let dropEL: DebugElement;
  let sut: DropDirective;

  function triggerDragevent(eventName: 'dragenter' | 'dragover' | 'dragleave' | 'drop', event?: DragEvent) {
    event = event || new DragEvent(eventName, { dataTransfer: new DataTransfer() });
    dropEL.triggerEventHandler(eventName, event);
    return event;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DropDirective, TestComponent],
    });

    fixture = TestBed.createComponent(TestComponent);
    testComponent = fixture.componentInstance;
    fixture.detectChanges();

    dropEL = fixture.debugElement.query(By.css('#test'));
    sut = fixture.debugElement.query(By.directive(DropDirective)).injector.get(DropDirective);
    fixture.detectChanges();
  });

  it('should export the directive ref as "drop"', () => {
    expect(testComponent.directiveRef).toBeDefined();
    expect(testComponent.directiveRef instanceof DropDirective).toBeTrue();
  });

  describe('WHEN dragenter', () => {
    it('should set `isDragover` to true', () => {
      expect(sut.isDragover).toBe(false);
      triggerDragevent('dragenter');
      expect(sut.isDragover).toBe(true);
    });
  });

  describe('WHEN dragleave', () => {
    it('should set `isDragover` to false', () => {
      triggerDragevent('dragenter');
      fixture.detectChanges();

      triggerDragevent('dragleave', { target: dropEL.nativeElement } as any);
      fixture.detectChanges();

      expect(sut.isDragover).toBe(false);
    });
  });

  describe('WHEN dragover', () => {
    describe('AND `canDrop`', () => {
      it('should allow dropping', () => {
        triggerDragevent('dragenter');

        const event = new DragEvent('dragover', { dataTransfer: new DataTransfer() });
        const spy = spyOn(event, 'preventDefault');

        triggerDragevent('dragover', event);

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    describe('AND NOT `canDrop`', () => {
      it('should not allow dropping', () => {
        triggerDragevent('dragenter');
        testComponent.canDrop = false;
        fixture.detectChanges();

        const event = new DragEvent('dragover', { dataTransfer: new DataTransfer() });
        const spy = spyOn(event, 'preventDefault');

        triggerDragevent('dragover', event);

        expect(spy).not.toHaveBeenCalled();
      });
    });
  });

  describe('WHEN drop', () => {
    it('should emit `(appDrop)` with the payload', () => {
      const payload = 'foo';

      const event = new DragEvent('drop', { dataTransfer: new DataTransfer() });
      event.dataTransfer?.setData('Text', payload);

      const spy = spyOn(testComponent, 'onDrop');

      triggerDragevent('drop', event);

      const [result] = spy.calls.mostRecent().args;
      expect(result).toEqual({ payload, offsetTop: sut.offsetTop, offsetBottom: sut.offsetBottom });
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
