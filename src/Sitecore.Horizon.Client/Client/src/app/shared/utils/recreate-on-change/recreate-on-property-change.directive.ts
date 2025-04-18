/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Directive, Input, OnChanges, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appRecreateOnPropertyChange]',
})
// Directive which re-creates the content each time the value is changed. Also exposes the bound value directly to the template.
export class RecreateOnPropertyChangeDirective implements OnChanges {
  constructor(
    private _templateRef: TemplateRef<{ $implicit: any }>,
    private _viewContainerRef: ViewContainerRef,
  ) {}

  private previousValue: any = undefined;
  @Input('appRecreateOnPropertyChange') value: any;

  ngOnChanges(): void {
    if (this.value !== undefined && this.value !== this.previousValue) {
      this._viewContainerRef.clear();
      this._viewContainerRef.createEmbeddedView(this._templateRef, { $implicit: this.value });
    }

    if (this.value === undefined) {
      this._viewContainerRef.clear();
    }

    this.previousValue = this.value;
  }
}
