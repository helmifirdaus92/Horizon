/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SiteResponse {
  id: string;
  name: string;
  description: string;
  displayName: string;
  thumbnailUrl: string | null;
  thumbnailsRootPath: string | null;
  thumbnail: Thumbnail;
  collectionId: string;
  collectionName: string | null;
  created: string;
  createdBy: string;
  sortOrder: number;
  access: Permissions;
  languages: string[];
  hosts: Host[];
  supportedLanguages: string[];
  settings: { [key: string]: any };
  properties: { [key: string]: any };
  brandKitId: string | null;
}

export interface SiteCollectionsResponse {
  id: string;
  name: string;
  description: string;
  displayName: string;
  created: string;
  createdBy: string;
  sortOrder: number;
  permissions: Permissions;
  settings: { [key: string]: any };
}

export interface Host {
  id: string;
  name: string;
  hostnames: string[];
  targetHostname: string;
  homePageId: string;
  renderingHost: RenderingHost;
  permissions: Permissions;
  settings: { [key: string]: any };
  properties: { [key: string]: any };
  analyticsIdentifiers: Record<string, string>;
  languageSettings: LanguageSettings;
  created: string | null;
  createdBy: string | null;
}

export interface LanguageSettings {
  defaultLanguage: string;
  languageEmbedding: boolean;
  itemLanguageFallback: boolean;
  fieldLanguageFallback: boolean;
}

export interface Thumbnail {
  url: string;
  rootPath: string;
  autogenerated: boolean;
}

export interface Permissions {
  canAdmin: boolean;
  canWrite: boolean;
  canCreate: boolean;
  canDelete: boolean;
  canRename: boolean;
  canRead: boolean;
  canPublish: boolean;
  canDuplicate: boolean;
}

export interface Settings {
  linkProvider: string;
  isSiteThumbnailSource: string;
  sxaLinkable: string;
}

export interface RenderingHost {
  id: string;
  name: string;
  appName: string;
  layoutServiceConfiguration: string;
  serverSideRenderingEngineEndpointUrl: string;
  serverSideRenderingEngineApplicationUrl: string;
}

export interface Thumbnail {
  url: string;
  rootPath: string;
  autogenerated: boolean;
  base64: string | null;
}
