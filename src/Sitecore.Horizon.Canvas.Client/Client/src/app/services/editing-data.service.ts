/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { EditingData, EditingDataContext } from '../messaging/horizon-canvas.contract.parts';
import { MessagingService } from '../messaging/messaging-service';
import { ConfigurationService } from './configuration.service';

export class EditingDataService {
  // Have a static cache to survive app shutdown
  private static deferredEditingData: Promise<EditingData> | null;

  constructor(
    private readonly messagingService: MessagingService,
    resetCache?: boolean,
  ) {
    if (resetCache) {
      EditingDataService.deferredEditingData = null;
    }
  }

  startLoadingEditingData(editingDataContext: EditingDataContext): void {
    // In Rendering Host Flip canvas has no info on current variant
    // Use a value from pages messaging
    editingDataContext.variant = ConfigurationService.activeVariant;

    // If data is pre-cached, do not load it again
    if (EditingDataService.deferredEditingData) {
      return;
    }

    EditingDataService.deferredEditingData = this.messagingService.editingMetadataMessagingChannel.rpc.getEditingMetadata({
      ...editingDataContext,
    });
  }

  async getEditingData(): Promise<EditingData> {
    if (!EditingDataService.deferredEditingData) {
      throw new Error(`Editing data loading wasn't initiated`);
    }

    return await EditingDataService.deferredEditingData;
  }

  patchEditingData(editingData: EditingData) {
    EditingDataService.deferredEditingData = Promise.resolve(editingData);
  }
}
