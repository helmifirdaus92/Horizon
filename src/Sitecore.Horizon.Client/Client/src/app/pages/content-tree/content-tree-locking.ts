/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */



import { ItemLocking } from 'app/shared/graphql/item.interface';

export class ContentTreeLocking {
  readonly lockedByCurrentUser: boolean;
  readonly isLocked: boolean;

  constructor(values: { lockedByCurrentUser: boolean; isLocked: boolean }) {
    this.lockedByCurrentUser = values.lockedByCurrentUser;
    this.isLocked = values.isLocked;
  }

  static empty() {
    return new ContentTreeLocking({ lockedByCurrentUser: false, isLocked: false });
  }

  static fromItem(itemLocking: ItemLocking) {
    return new ContentTreeLocking({
      lockedByCurrentUser: itemLocking.lockedByCurrentUser,
      isLocked: itemLocking.isLocked,
    });
  }
}
