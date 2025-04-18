/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

// eslint-disable-next-line max-classes-per-file
import { Directive, Input, NgModule, TemplateRef, ViewContainerRef } from '@angular/core';

interface LetContext<T = unknown> {
  $implicit: T;
  appLet: T;
}

/**
 * Let directive to evaluate and reference an expression in a template.
 *
 * Inspired by the Angular `*ngIf` directive.
 * https://github.com/angular/angular/blob/master/packages/common/src/directives/ng_if.ts
 */
@Directive({
  selector: '[appLet]',
})
export class LetDirective<T = unknown> {
  private _context: LetContext<T | null> = { $implicit: null, appLet: null };

  constructor(_viewContainer: ViewContainerRef, _templateRef: TemplateRef<LetContext<T>>) {
    _viewContainer.createEmbeddedView(_templateRef, this._context);
  }

  @Input()
  set appLet(value: T) {
    this._context.$implicit = this._context.appLet = value;
  }
}

@NgModule({
  declarations: [LetDirective],
  exports: [LetDirective],
})
export class AppLetModule {}
