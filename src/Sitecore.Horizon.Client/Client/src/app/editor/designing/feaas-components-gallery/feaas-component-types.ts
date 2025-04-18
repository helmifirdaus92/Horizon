/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { SafeUrl } from '@angular/platform-browser';

export interface FEaaSComponentsCollection {
  name: string;
  components: Array<FEaaSComponent | FEaaSExternalComponent>;
  isDefault?: boolean;
}

export interface FEaaSComponent {
  id: string;
  name: string;
  datasourceIds: string[] | undefined;
  libraryId: string;
  collectionId: string;
  thumbnail: Promise<FEaaSComponentThumbnail | undefined>;
  published: boolean;
  dataSettings?: string;
  isExternal: boolean;
  canUseXMDatasources: boolean;
}

export interface FEaaSExternalComponent {
  id?: string;
  name: string;
  title?: string;
  thumbnail?: Promise<FEaaSComponentThumbnail | undefined>;
  isExternal: boolean;
}

export interface FEaaSComponentThumbnail {
  url: SafeUrl;
  height?: number;
  width?: number;
}

export interface FEaaSRenderingParameters {
  LibraryId: string;
  ComponentName: string;
  ComponentLabel: string;
  ComponentId: string;
  ComponentVersion: string;
  ComponentRevision: string;
  ComponentHostName: string;
  ComponentInstanceId: string;
  ComponentHTMLOverride: string;
  ComponentDataOverride?: string;
}

export interface FEaaSExternalComponentRenderingParameters {
  ComponentName: string;
  ComponentLabel: string;
  ComponentProps?: string;
}

interface DataSourceItemCollections {
  externalDataSources: DataSourceItemModel[];
  xmCloudDataSources: DataSourceItemModel[];
}

export interface DataSourceItemModel {
  name: string;
  dataSourceId: string;
  isChecked?: boolean;
}

export interface DataSourceItemRoot {
  dataSources: DataSourceItemCollections;
  isExternalRootChecked?: boolean;
  isXmCloudRootChecked?: boolean;
}
