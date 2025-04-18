/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { FeatureFlagsService } from './feature-flags.service';

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[ifFeatureEnabled]',
})
export class FeatureEnabledDirective implements OnInit {
  @Input('ifFeatureEnabled') featureFlagName = '';
  @Input() set ifFeatureEnabledElse(templateRef: TemplateRef<any>) {
    this._elseTemplateRef = templateRef;
  }
  private _elseTemplateRef?: TemplateRef<any>;

  constructor(
    private _templateRef: TemplateRef<any>,
    private _viewContainerRef: ViewContainerRef,
    private readonly featureFlagsService: FeatureFlagsService,
  ) {}

  ngOnInit() {
    if (this.featureFlagsService.isFeatureEnabled(this.featureFlagName)) {
      this._viewContainerRef.createEmbeddedView(this._templateRef);
    } else if (this._elseTemplateRef) {
      this._viewContainerRef.createEmbeddedView(this._elseTemplateRef);
    }
  }
}
