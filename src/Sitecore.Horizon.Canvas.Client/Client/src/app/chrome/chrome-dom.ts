/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface ChromeDom {
  readonly root: Element;

  clearSelection(): void;

  elementsFromPoint(x: number, y: number): Element[];

  getGlobalFunction<T>(name: string): T | undefined;
}

export class WindowDom implements ChromeDom {
  get root(): Element {
    return document.body;
  }

  clearSelection(): void {
    const currentSelection = window.getSelection();
    if (currentSelection) {
      currentSelection.removeAllRanges();
    }
  }

  elementsFromPoint(x: number, y: number): Element[] {
    return document.elementsFromPoint(x, y);
  }

  getGlobalFunction<T>(name: string): T | undefined {
    return ((window as unknown) as Record<string, T | undefined>)[name];
  }
}
