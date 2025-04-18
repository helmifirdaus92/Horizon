/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export type DatasourceDialogMode = 'InsertRendering' | 'ChangeDatasource' | 'Personalize' | 'MessagingRpcCall';

export interface RenderingInitializationDetails {
  instanceId: string;
  renderingId: string;
  placeholderKey: string;
  dataSource: string | null;
  parameters: Record<string, string>;
}

export interface RenderingDatasourceSelectionDetails {
  instanceId?: string;
  parameters?: Record<string, string>;
  placeholderKey?: string;
}

export interface RenderingDatasourceDetails {
  renderingId: string;
  dataSource: string | null;
  compatibleTemplateIds: string[];
  renderingDetails?: RenderingDatasourceSelectionDetails;
  pipelineArgs: {
    aborted: boolean;
    mode: DatasourceDialogMode;
    customParameters?: Record<string, string>;
  };
}

export interface RenderingInitializationContext {
  renderingDetails: RenderingInitializationDetails;
  cancelRenderingInsert: boolean;
}

export interface EditorCommands {
  'pages:editor:rendering:insert': RenderingInitializationContext;
}

export interface DatasourceDialogCommands {
  'pages:editor:datasource:dialog:show': RenderingDatasourceDetails;
}
