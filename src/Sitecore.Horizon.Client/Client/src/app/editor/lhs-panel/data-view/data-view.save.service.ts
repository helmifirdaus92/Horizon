/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, OnDestroy } from '@angular/core';
import { ItemFieldType } from 'app/shared/graphql/item.dal.service';
import { EditingMessagingChannel } from 'app/shared/messaging/horizon-canvas.contract.defs';
import { FieldValue } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { MessagingService } from 'app/shared/messaging/messaging.service';
import { Lifetime } from 'app/shared/utils/lifetime';
import { isSameGuid } from 'app/shared/utils/utils';
import { FieldState } from 'sdk/contracts/editing-shell.contract';
import { FieldsTrackerService } from './fields-tracker.service';

export type EditingMode = 'persist' | 'draft' | 'loading';

@Injectable()
export class DataViewSaveService implements OnDestroy {
  private _canvasFields: FieldValue[] = [];
  private readonly lifetime: Lifetime = new Lifetime();
  private readonly editingChannel: EditingMessagingChannel;

  constructor(
    private readonly messagingService: MessagingService,
    private readonly fieldsTrackerService: FieldsTrackerService,
  ) {
    this.editingChannel = this.messagingService.getEditingCanvasChannel();
    this.init();
  }

  async init() {
    this._canvasFields = await this.editingChannel.rpc.getPageFields();

    this.editingChannel.on('page:load', ({ fields }) => {
      this._canvasFields = fields;
    });
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  async save(field: FieldState, fieldType: ItemFieldType) {
    // 1. Normalize html value - use single ckEditor instance
    // 2. Only Canvas has access to field's parent element to check for 'ck_editor' class
    if (field.reset || fieldType !== 'Rich Text') {
      this.fieldsTrackerService.notifyFieldValueChange([field]);
      return;
    }

    const rtCanvasField = this._canvasFields.find(
      (f) =>
        isSameGuid(f.fieldId, field.fieldId) &&
        isSameGuid(f.itemId, field.itemId) &&
        f.itemVersion === field.itemVersion,
    );
    if (rtCanvasField) {
      await this.editingChannel.rpc.updatePageState({ fields: [field] });
    } else {
      this.fieldsTrackerService.notifyFieldValueChange([field]);
    }
  }
}
