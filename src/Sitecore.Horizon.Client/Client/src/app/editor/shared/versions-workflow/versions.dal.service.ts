/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { inject, Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Item } from 'app/shared/graphql/item.interface';
import { extractGqlErrorCode } from 'app/shared/utils/graphql.utils';
import gql from 'graphql-tag';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const ADD_ITEM_VERSION_MUTATION = gql`
  mutation AddItemVersion($input: AddItemVersionInput!) {
    addItemVersion(input: $input) {
      item {
        id
        displayName
        versionName
        version
      }
      success
    }
  }
`;

export const DELETE_ITEM_VERSION_MUTATION = gql`
  mutation DeleteItemVersion($input: DeleteItemVersionInput!) {
    deleteItemVersion(input: $input) {
      latestPublishableVersion {
        id
        version
      }
      success
    }
  }
`;

export const RENAME_ITEM_VERSION_MUTATION = gql`
  mutation RenameItemVersion($input: RenameItemVersionInput!) {
    renameItemVersion(input: $input) {
      itemVersion {
        id
        versionName
        version
      }
      success
    }
  }
`;

export const SET_PUBLISHING_SETTINGS_MUTATION = gql`
  mutation SetPublishingSettings($input: SetPublishingSettingsInput!) {
    setPublishingSettings(input: $input) {
      item {
        id
        displayName
        versionName
        version
        publishing {
          validFromDate
          validToDate
        }
      }
      success
    }
  }
`;

export const VERSION_PUBLISHING_STATUS_QUERY = gql`
  query GetVersionPublishingStatus($itemId: ID!, $version: Int) {
    item(where: { itemId: $itemId, version: $version }) {
      itemId(format: D)
      field(name: "__Hide version") {
        value
      }
    }
  }
`;
export interface PublishingResponse {
  field: {
    value: string;
  };
}
export interface AddItemVersionInput {
  path: string;
  baseVersionNumber?: number;
  versionName?: string;
  language: string;
  siteName: string;
}

export interface AddItemVersionOutput {
  success: boolean;
  itemVersion?: number;
}

export interface RenameItemVersionInput {
  path: string;
  versionNumber: number;
  newName: string;
  language: string;
  siteName: string;
}

export interface RenameItemVersionOutput {
  success: boolean;
}

export interface DeleteItemVersionInput {
  path: string;
  versionNumber: number;
  language: string;
  siteName: string;
}

export interface DeleteItemVersionOutput {
  success: boolean;
  latestPublishableVersion?: number;
}

export interface SetPublishingSettingsInput {
  path: string;
  versionNumber?: number;
  validFromDate: string;
  validToDate: string;
  language: string;
  siteName: string;
  isAvailableToPublish: boolean;
}

export interface SetPublishingSettingsOutput {
  success: boolean;
}

@Injectable({ providedIn: 'root' })
export abstract class BaseVersionsDalService {
  constructor() {}

  abstract addItemVersion(addItemVersionInput: AddItemVersionInput): Observable<AddItemVersionOutput>;

  abstract deleteItemVersion(deleteItemVersionInput: DeleteItemVersionInput): Observable<DeleteItemVersionOutput>;

  abstract renameItemVersion(renameItemVersionInput: RenameItemVersionInput): Observable<RenameItemVersionOutput>;

  abstract setPublishingSettings(
    setPublishingSettingsInput: SetPublishingSettingsInput,
  ): Observable<SetPublishingSettingsOutput>;
}

@Injectable()
export class VersionsDalService extends BaseVersionsDalService {
  private readonly apollo = inject(Apollo);
  constructor() {
    super();
  }

  addItemVersion(addItemVersionInput: AddItemVersionInput): Observable<AddItemVersionOutput> {
    return this.apollo
      .mutate<{ addItemVersion: { success: boolean; item?: Item } }>({
        mutation: ADD_ITEM_VERSION_MUTATION,
        variables: {
          input: {
            path: addItemVersionInput.path,
            baseVersionNumber: addItemVersionInput.baseVersionNumber,
            versionName: addItemVersionInput.versionName,
            language: addItemVersionInput.language,
            site: addItemVersionInput.siteName,
          },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => ({
          success: data?.addItemVersion.success ? data?.addItemVersion.success : false,
          itemVersion: data?.addItemVersion.item?.version,
        })),
      );
  }

  deleteItemVersion(deleteItemVersionInput: DeleteItemVersionInput): Observable<DeleteItemVersionOutput> {
    return this.apollo
      .mutate<{ deleteItemVersion: { success: boolean; latestPublishableVersion?: Item } }>({
        mutation: DELETE_ITEM_VERSION_MUTATION,
        variables: {
          input: {
            path: deleteItemVersionInput.path,
            versionNumber: deleteItemVersionInput.versionNumber,
            language: deleteItemVersionInput.language,
            site: deleteItemVersionInput.siteName,
          },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => ({
          success: data?.deleteItemVersion.success ? data?.deleteItemVersion.success : false,
          latestPublishableVersion: data?.deleteItemVersion.latestPublishableVersion?.version,
        })),
      );
  }

  renameItemVersion(renameItemVersionInput: RenameItemVersionInput): Observable<RenameItemVersionOutput> {
    return this.apollo
      .mutate<{ renameItemVersion: { success: boolean; item?: Item } }>({
        mutation: RENAME_ITEM_VERSION_MUTATION,
        variables: {
          input: {
            path: renameItemVersionInput.path,
            versionNumber: renameItemVersionInput.versionNumber,
            newName: renameItemVersionInput.newName,
            language: renameItemVersionInput.language,
            site: renameItemVersionInput.siteName,
          },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => ({
          success: data?.renameItemVersion.success ? data?.renameItemVersion.success : false,
        })),
      );
  }

  setPublishingSettings(
    setPublishingSettingsInput: SetPublishingSettingsInput,
  ): Observable<SetPublishingSettingsOutput> {
    return this.apollo
      .mutate<{ setPublishingSettings: { success: boolean; item?: Item } }>({
        mutation: SET_PUBLISHING_SETTINGS_MUTATION,
        variables: {
          input: {
            path: setPublishingSettingsInput.path,
            versionNumber: setPublishingSettingsInput.versionNumber,
            validFromDate: setPublishingSettingsInput.validFromDate,
            validToDate: setPublishingSettingsInput.validToDate,
            isAvailableToPublish: setPublishingSettingsInput.isAvailableToPublish,
            language: setPublishingSettingsInput.language,
            site: setPublishingSettingsInput.siteName,
          },
        },
      })
      .pipe(
        catchError(extractGqlErrorCode),
        map(({ data }) => ({
          success: data?.setPublishingSettings.success ? data?.setPublishingSettings.success : false,
        })),
      );
  }
}
