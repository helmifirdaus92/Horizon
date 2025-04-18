/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export type PlacementAnchorPosition = 'before' | 'after';

export interface PlacementAnchor<T> {
  readonly target: T;
  readonly position: PlacementAnchorPosition;
}
