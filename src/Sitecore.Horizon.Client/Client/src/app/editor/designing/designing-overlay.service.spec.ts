/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DesigningOverlay } from './designing-overlay.service';

describe('DesigningOverlay', () => {
  let sut: DesigningOverlay;
  let element: HTMLElement;

  beforeEach(() => {
    sut = new DesigningOverlay();
    element = sut.element;
  });

  it('should create', () => {
    expect(sut).toBeDefined();
  });

  it('should create an element with the corresponding class', () => {
    expect(element).toBeDefined();
    expect(element instanceof HTMLElement).toBe(true);
    expect(element.classList.contains('designing-page-overlay')).toBe(true);
  });

  it('should proxy drag events', () => {
    const dragenterSpy = jasmine.createSpy('dragenter');
    sut.dragenter$.subscribe(dragenterSpy);

    const dragleaveSpy = jasmine.createSpy('dragleave');
    sut.dragleave$.subscribe(dragleaveSpy);

    const dragoverSpy = jasmine.createSpy('dragover');
    sut.dragover$.subscribe(dragoverSpy);

    const dropSpy = jasmine.createSpy('drop');
    sut.drop$.subscribe(dropSpy);

    element.dispatchEvent(new DragEvent('dragenter'));
    element.dispatchEvent(new DragEvent('dragleave'));
    element.dispatchEvent(new DragEvent('dragover', { clientX: 42, clientY: 42 }));
    element.dispatchEvent(new DragEvent('drop', { clientX: 52, clientY: 52 }));

    expect(dragenterSpy).toHaveBeenCalledTimes(1);
    expect(dragleaveSpy).toHaveBeenCalledTimes(1);

    // dragover
    expect(dragoverSpy).toHaveBeenCalledTimes(1);
    let event = dragoverSpy.calls.argsFor(0)[0];
    expect(event.clientX).toBe(42);
    expect(event.clientY).toBe(42);

    // drop
    expect(dropSpy).toHaveBeenCalledTimes(1);
    event = dropSpy.calls.argsFor(0)[0];
    expect(event.clientX).toBe(52);
    expect(event.clientY).toBe(52);
  });
});
