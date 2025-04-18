/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExtensionFilterPredicate, ExtensionManifest } from '@sitecore/page-composer-sdk';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-region-editor-workspace',
  template: `
    <app-sitecore-region
      name="EditingShell.Workspace.Content"
      [filterFn]="filterBound"
      [input]="input$ | async"
    ></app-sitecore-region>
  `,
})
export class RegionEditorWorkspaceComponent {
  input$: Observable<string>;

  readonly filterBound: ExtensionFilterPredicate<unknown> = (extensionContext: ExtensionManifest, input: unknown) => {
    return extensionContext.parameters.state === input;
  };

  constructor(route: ActivatedRoute) {
    this.input$ = route.data.pipe(map((data) => data.state));
  }
}
