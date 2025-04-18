/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export const maxSize = 1048576 * 1024 * 2; // 2GB

export const allowedFileExtensions = ['jpeg', 'jpg', 'gif', 'png', 'svg', 'bmp', 'webp'];
export type FileExtension = 'pdf' | 'doc' | 'docx' | null;

export type MediaUploadResultCode =
  | 'UploadSuccess'
  | 'GenericError'
  | 'FileSizeTooBig'
  | 'InvalidExtension'
  | 'FileNameAlreadyExist'
  | 'UploadInprogress'
  | 'RefreshPage'
  | 'InsufficientPrivileges'
  | 'DestinationFolderNotFound'
  | 'InvalidFile'
  | 'SvgScriptsNotAllowed'
  | null;
export interface MediaQueryResult {
  hasMoreItems: boolean;
  items: MediaItemInfo[];
}

export interface MediaItemInfo {
  id: string;
  displayName: string;
  url: string;
  extension?: string;
}

export interface MediaItem extends MediaItemInfo {
  alt?: string;
  dimensions?: string;
  height?: number;
  parentId: string;
  path: string;
  size?: number;
  width?: number;
  embedUrl: string;
  isImage?: boolean;
  isFile?: boolean;
}

export interface MediaFolder {
  children?: MediaFolder[];
  displayName: string;
  hasChildren: boolean;
  id: string;
  permissions?: {
    canCreate: boolean;
    canDelete: boolean;
    canRename: boolean;
  };
}

export interface MediaFolderFlat {
  displayName: string;
  hasChildren: boolean;
  id: string;
  parentId: string;
  permissions?: {
    canCreate: boolean;
    canDelete: boolean;
    canRename: boolean;
  };
}
export interface MediaBlob {
  fileName: string;
  extension: string;
  blob: string;
}

export interface MediaUploadResult {
  mediaItem: MediaItem;
  success: boolean;
}
