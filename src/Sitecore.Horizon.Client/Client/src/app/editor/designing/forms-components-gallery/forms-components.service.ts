/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { BYOC_RENDERING_ID } from 'app/editor/right-hand-side/feaas-rhs-region/feaas-extension-filter';
import { Observable } from 'rxjs';
import { EditorCommands } from 'sdk';
import { RenderingInitializationContext } from 'sdk/contracts/commands.contract';
import { FORM_WRAPPER_RENDERING_ID } from './form-wrapper-filter';
import { FormsEntity } from './forms-components.dal.service';
@Injectable({
  providedIn: 'root',
})
export class FormsComponentsService {
  private lastInsertedForm?: FormsEntity;
  isLoading$: Observable<boolean>;

  constructor() {
    this.setupSetRenderingParametersHook();
  }

  startInsertComponent(formComponent: FormsEntity) {
    this.lastInsertedForm = formComponent;
  }

  private async setupSetRenderingParametersHook() {
    if (window.FED_UI) {
      const cm = window.FED_UI?.getCommandManager<EditorCommands>();
      cm?.register('pages:editor:rendering:insert', (context) => this.populateRenderingDetails(context));
    }
  }

  async populateRenderingDetails(context: RenderingInitializationContext): Promise<RenderingInitializationContext> {
    if (
      (context.renderingDetails.renderingId !== FORM_WRAPPER_RENDERING_ID &&
        context.renderingDetails.renderingId !== BYOC_RENDERING_ID) ||
      !this.lastInsertedForm
    ) {
      return Promise.resolve(context);
    }

    const isByocRendering = context.renderingDetails.renderingId === BYOC_RENDERING_ID;
    const renderingParameters = isByocRendering
      ? {
          ComponentName: `SitecoreForm?formId=${this.lastInsertedForm.id}`,
          ComponentLabel: this.lastInsertedForm.name,
        }
      : {
          FormId: this.lastInsertedForm.id,
        };

    Object.assign(context.renderingDetails.parameters, renderingParameters);

    this.lastInsertedForm = undefined;

    return context;
  }
}
