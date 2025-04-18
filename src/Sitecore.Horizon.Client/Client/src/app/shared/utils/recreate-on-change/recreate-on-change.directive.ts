/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Directive, Input, OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appRecreateOnChange]',
})
// Directive which re-creates the content each time the value is changed. Also exposes the bound value directly to the template.
export class RecreateOnChangeDirective implements OnChanges {
  constructor(
    private _templateRef: TemplateRef<{ $implicit: any }>,
    private _viewContainerRef: ViewContainerRef,
  ) {}

  @Input('appRecreateOnChange') value: any;

  ngOnChanges(): void {
    this._viewContainerRef.clear();
    if (this.value) {
      this._viewContainerRef.createEmbeddedView(this._templateRef, { $implicit: this.value });
    }
  }
}
