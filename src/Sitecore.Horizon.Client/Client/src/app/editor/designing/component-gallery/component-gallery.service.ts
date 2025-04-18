/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ContextService } from 'app/shared/client-state/context.service';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { normalizeGuid } from 'app/shared/utils/utils';
import gql from 'graphql-tag';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { DesigningService } from '../designing.service';

export const GET_ALL_COMPONENTS = gql`
  query getComponents($site: String!) {
    components(site: $site) {
      groups {
        title
        components {
          category
          displayName
          iconUrl
          id
          componentName
        }
      }
      ungrouped {
        category
        displayName
        iconUrl
        id
        componentName
      }
    }
  }
`;

export interface ComponentInfo {
  id: string;
  displayName: string;
  iconUrl: string;
  category: string;
  componentName?: string;
  disabled?: boolean;
}

export interface ComponentGroup {
  title: string;
  components: ComponentInfo[];
}

export interface ComponentsResult {
  ungrouped: ComponentInfo[];
  groups: ComponentGroup[];
}

@Injectable({ providedIn: 'root' })
export class ComponentGalleryService {
  constructor(
    private apollo: Apollo,
    private context: ContextService,
    private designingService: DesigningService,
  ) {}

  watchComponents(): Observable<ComponentsResult> {
    const normalizedAllowedIds = this.designingService.droppableRenderingIds.pipe(
      map((ids) => new Set(ids.map((id) => normalizeGuid(id)))),
    );

    return combineLatest([this.fetchAllComponents(), normalizedAllowedIds]).pipe(
      map(([components, allowedIds]) => {
        return {
          groups: this.filterAllowedComponentGroups(components.groups, allowedIds),
          ungrouped: this.filterAllowedComponents(components.ungrouped, allowedIds),
        };
      }),
      // Components get fetched once per site and then just filtered on every page load,
      // so we expect that the arrays should always have the same structure
      // and we can avoid emitting changes to prevent reloading(blinking) on the client
      distinctUntilChanged((before, after) => {
        // Using try/catch since JSON.stringify may crash execution because of incorrect syntax.
        try {
          return JSON.stringify(before).toString() === JSON.stringify(after).toString();
        } catch {
          return false;
        }
      }),
      shareReplayLatest(),
    );
  }

  getPlaceholderAllowedComponents(placeholderAllowedRenderingIds: readonly string[]): Observable<ComponentsResult> {
    const normalizedAllowedIds = new Set<string>();
    placeholderAllowedRenderingIds.map((id) => normalizedAllowedIds.add(normalizeGuid(id)));

    return this.fetchAllComponents().pipe(
      map((components) => {
        return {
          groups: this.filterAllowedComponentGroups(components.groups, normalizedAllowedIds),
          ungrouped: this.filterAllowedComponents(components.ungrouped, normalizedAllowedIds),
        };
      }),
    );
  }

  getCompatibleComponents(compatibleRenderingIds: readonly string[]): Observable<ComponentsResult> {
    const normalizedAllowedIds = new Set<string>();
    compatibleRenderingIds.map((id) => normalizedAllowedIds.add(normalizeGuid(id)));

    return this.fetchAllComponents().pipe(
      map((components) => {
        return {
          groups: this.filterAllowedComponentGroups(components.groups, normalizedAllowedIds),
          ungrouped: this.filterAllowedComponents(components.ungrouped, normalizedAllowedIds),
        };
      }),
    );
  }

  private filterAllowedComponentGroups(groups: ComponentGroup[], allowedIds: Set<string>) {
    return groups
      .map((group) => {
        return {
          title: group.title,
          components: this.filterAllowedComponents(group.components, allowedIds),
        };
      })
      .filter((group) => group.components.length > 0);
  }

  private filterAllowedComponents(components: ComponentInfo[], allowedIds: Set<string>) {
    return components.filter((component) => allowedIds.has(normalizeGuid(component.id)));
  }

  private fetchAllComponents(): Observable<ComponentsResult> {
    return this.context.siteName$.pipe(
      switchMap((siteName) =>
        this.apollo
          .query<{ components: ComponentsResult }>({
            query: GET_ALL_COMPONENTS,
            variables: { site: siteName },
          })
          .pipe(
            // I choose not to catch errors for now as there is no requirement how to handle it.
            // Better to fail "nosily" than fail silently, so that at least we get some default error logging.
            map(({ data }) => data.components),
          ),
      ),
      shareReplayLatest(),
    );
  }
}
