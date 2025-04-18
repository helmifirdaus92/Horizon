/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture } from '@angular/core/testing';

/**
 * Base class for page objects in component tests
 * Provides utility methods for querying DOM elements
 * @template C - Component type being tested
 */
export class BasePage<C> {
  private element: HTMLElement;

  constructor(protected readonly fixture: ComponentFixture<C>) {
    this.element = fixture.nativeElement;
  }

  // Queries for a single element in the component's DOM
  // First overload: Accepts HTML tag name and returns strongly-type HTML element
  // Second overload: Accepts CSS selector and returns generic Element
  // Implementation: Combines both overloads
  query<T extends keyof HTMLElementTagNameMap>(selector: T): HTMLElementTagNameMap[T];
  query<E extends Element = Element>(selector: string): E | null;
  query<T extends keyof HTMLElementTagNameMap, E extends Element = Element>(
    selector: T,
  ): HTMLElementTagNameMap[T] | E | null {
    return this.element.querySelector<T>(selector);
  }

  // Queries for multiple elements with the same selector in the component's DOM
  // Overload and implementation are similar to the query method
  queryAll<T extends keyof HTMLElementTagNameMap>(selector: T): Array<HTMLElementTagNameMap[T]>;
  queryAll<E extends Element = Element>(selector: string): E[];
  queryAll<T extends keyof HTMLElementTagNameMap, E extends Element = Element>(
    selector: T,
  ): Array<HTMLElementTagNameMap[T]> | E[] {
    return Array.from(this.element.querySelectorAll<T>(selector));
  }
}
