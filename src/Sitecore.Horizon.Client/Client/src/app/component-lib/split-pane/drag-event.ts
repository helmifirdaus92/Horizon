/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface DragEvent {
  phase: 'began' | 'move' | 'ended';
  width: number;
}
