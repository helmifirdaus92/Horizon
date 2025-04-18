/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { DesigningOverlay } from './designing-overlay';

describe('DesigningOverlay', () => {
  let sut: DesigningOverlay;
  let element: HTMLElement;
  const dragenterSpy = jasmine.createSpy();
  const dragleaveSpy = jasmine.createSpy();
  const dragoverSpy = jasmine.createSpy();
  const dropSpy = jasmine.createSpy();

  beforeEach(() => {
    sut = new DesigningOverlay(dragenterSpy, dragleaveSpy, dragoverSpy, dropSpy);
    element = sut.htmlElement;
  });

  it('should create', () => {
    expect(sut).toBeDefined();
  });

  it('should create an element with the corresponding class', () => {
    expect(element).toBeDefined();
    expect(element instanceof HTMLElement).toBe(true);
    expect(element.classList[0]).toContain('sc-designing-overlay');
  });

  it('should call drag events handlers', () => {
    element.dispatchEvent(new DragEvent('dragenter'));
    element.dispatchEvent(new DragEvent('dragleave'));
    element.dispatchEvent(new DragEvent('dragover', { clientX: 42, clientY: 42 }));
    element.dispatchEvent(new DragEvent('drop', { clientX: 52, clientY: 52 }));

    expect(dragenterSpy).toHaveBeenCalledTimes(1);
    expect(dragleaveSpy).toHaveBeenCalledTimes(1);

    // dragover
    expect(dragoverSpy).toHaveBeenCalledTimes(1);
    let clientX = dragoverSpy.calls.argsFor(0)[0];
    let clientY = dragoverSpy.calls.argsFor(0)[1];
    expect(clientX).toBe(42);
    expect(clientY).toBe(42);

    // drop
    expect(dropSpy).toHaveBeenCalledTimes(1);
    clientX = dropSpy.calls.argsFor(0)[0];
    clientY = dropSpy.calls.argsFor(0)[1];
    expect(clientX).toBe(52);
    expect(clientY).toBe(52);
  });
});
