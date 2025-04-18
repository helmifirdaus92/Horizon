/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable max-classes-per-file */
import { getElementsInBetween } from '../utils/dom';
import { PlaceholderChrome } from './chrome.placeholder';
import { RenderingChrome } from './chrome.rendering';

export interface ChromeNode {
  getElements: () => Element[];
  remove: () => void;
}

/* eslint-disable max-classes-per-file */
export class RenderingChromeNode implements ChromeNode {
  private elements: Element[];

  constructor(private readonly chrome: RenderingChrome) {
    const startElement = this.chrome.startElement;
    const endElement = this.chrome.endElement;

    this.elements = [startElement, ...getElementsInBetween(startElement, endElement), endElement];
  }

  getElements() {
    return [...this.elements];
  }

  remove() {
    this.elements.forEach((item) => item.remove());
  }

  getHTMLString(): DocumentFragment {
    const html = this.elements.map((item) => item.outerHTML).join('');
    const template = document.createElement('template');
    template.innerHTML = html;

    const result = template.content;

    template.remove();

    return result;
  }
}

export class PlaceholderChromeNode implements ChromeNode {
  private elements: Element[];

  constructor(private readonly chrome: PlaceholderChrome) {
    const startElement = this.chrome.startElement;
    const endElement = this.chrome.endElement;

    this.elements = [startElement, ...getElementsInBetween(startElement, endElement), endElement];
  }

  getElements() {
    return [...this.elements];
  }

  remove() {
    this.elements.forEach((item) => item.remove());
  }

  clearInnerHtml() {
    const startElement = this.chrome.startElement;
    const endElement = this.chrome.endElement;

    const elementsInBetween = getElementsInBetween(startElement, endElement);
    elementsInBetween.forEach((element) => element.remove());

    this.elements = [startElement, endElement];
  }
}
