/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingContract } from '@sitecore/page-composer-sdk';

export interface EditingCanvasEvents {}

export interface EditingCanvasRpc {
  reload(syncWithContext?: boolean): void;
}

export const EditingCanvasContractName = 'Horizon.Editing.Canvas:Messaging';

export const EditingCanvasContract: MessagingContract<EditingCanvasEvents, EditingCanvasRpc> = {
  name: EditingCanvasContractName,
};

// Drag and drop new rendering to canvas contract
export interface DragAndDropNewRenderingEvents {}

export interface DragAndDropNewRenderingRpc {
  startDragAndDrop(renderingDefinitionId: string): void;
  stopDragAndDrop(): void;
}

export const DragAndDropNewRenderingContractName = 'Horizon.Editing.DragAndDropNewRendering:Messaging';

export const DragAndDropNewRenderingContract: MessagingContract<
  DragAndDropNewRenderingEvents,
  DragAndDropNewRenderingRpc
> = {
  name: DragAndDropNewRenderingContractName,
};
