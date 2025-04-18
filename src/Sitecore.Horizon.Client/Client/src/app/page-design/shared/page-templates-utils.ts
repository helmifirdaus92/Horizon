/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { NavigationExtras } from '@angular/router';
import { ItemWithSite, SiteType } from '../page-templates.types';

export function combineChildren(roots: ItemWithSite[], contextSite: string, siteType: SiteType): ItemWithSite[] {
  const filteredRoots = roots.filter((root) =>
    siteType === 'current' ? root.siteName === contextSite : root.siteName !== contextSite,
  );

  const combinedChildren: ItemWithSite[] = [];
  filteredRoots.forEach((item: ItemWithSite) => {
    if (item?.children) {
      combinedChildren.push(
        // eslint-disable-next-line no-unsafe-optional-chaining
        ...item?.children.map((child) => {
          return { ...child, siteName: item.siteName };
        }),
      );
    }
  });

  return combinedChildren;
}

export function createNavigationExtras(folderId: string | null, siteType: string | null): NavigationExtras {
  return {
    queryParams: { folder_id: folderId, site_type: siteType },
    queryParamsHandling: 'merge',
  };
}
