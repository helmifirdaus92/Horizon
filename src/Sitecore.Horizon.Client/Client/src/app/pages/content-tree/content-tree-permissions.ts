/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ItemPermissions } from 'app/shared/graphql/item.interface';

export class ContentTreePermissions {
  readonly canWrite: boolean;
  readonly canDelete: boolean;
  readonly canRename: boolean;
  readonly canCreate: boolean;

  constructor(values: { canWrite: boolean; canDelete: boolean; canRename: boolean; canCreate: boolean }) {
    this.canWrite = values.canWrite;
    this.canDelete = values.canDelete;
    this.canRename = values.canRename;
    this.canCreate = values.canCreate;
  }

  static empty() {
    return new ContentTreePermissions({ canWrite: false, canDelete: false, canRename: false, canCreate: false });
  }

  static fromItem(itemPermissions: ItemPermissions) {
    return new ContentTreePermissions({
      canWrite: itemPermissions.canWrite,
      canDelete: itemPermissions.canDelete,
      canRename: itemPermissions.canRename,
      canCreate: itemPermissions.canCreate,
    });
  }
}
