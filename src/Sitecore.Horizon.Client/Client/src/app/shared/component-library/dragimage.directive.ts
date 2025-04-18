/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Directive, ElementRef, Input } from '@angular/core';

/**
 * List of `CSSStyleDeclaration` keys which can be assigned.
 * The list of readonly keys might change in new versions of typescript, update this type if it breaks.
 */
export type ElementStyleKeys = Exclude<
  keyof CSSStyleDeclaration,
  | 'cssText'
  | 'length'
  | 'parentRule'
  | 'getPropertyPriority'
  | 'getPropertyValue'
  | 'item'
  | 'removeProperty'
  | 'setProperty'
  | 'getPropertyCSSValue'
>;

@Directive({
  selector: '[appDragndropDragimage]',
})
export class DragndropDragimageDirective {
  @Input('appDragndropDragimage') styles: Array<[ElementStyleKeys, string]> = [];
  constructor(public readonly element: ElementRef) {}
}
