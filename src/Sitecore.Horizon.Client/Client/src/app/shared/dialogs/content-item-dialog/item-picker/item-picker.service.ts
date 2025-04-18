/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ItemPickerDalService, RawItem, RawItemAncestor } from './item-picker.dal.service';

@Injectable({ providedIn: 'root' })
export class ItemPickerService {
  constructor(private readonly itemPickerDalService: ItemPickerDalService) {}

  getChildren(path: string, language: string, site: string): Observable<RawItem[]> {
    return this.itemPickerDalService.getChildren(path, language, site);
  }

  getAncestorsWithSiblings(
    path: string,
    language: string,
    site: string,
    roots?: readonly string[],
  ): Observable<RawItemAncestor[]> {
    return this.itemPickerDalService.getAncestorsWithSiblings(path, language, site, roots);
  }
}
