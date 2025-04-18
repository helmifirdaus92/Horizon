/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export const colocatedContentPositions = [
  'top-left',
  'top-center',
  'top-right',
  'center-left',
  'center-center',
  'center-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
] as const;

export const distributedContentPositions = ['distributed-start', 'distributed-center', 'distributed-end'] as const;

export type ColocatedContentPosition = typeof colocatedContentPositions[number];
export type DistributedContentPosition = typeof distributedContentPositions[number];
export type ContentPosition = ColocatedContentPosition | DistributedContentPosition;

export const horizontalContentLayoutMap: Array<{ position: ContentPosition; layout: string }> = [
  { position: 'top-left', layout: 'justify-start items-start' },
  { position: 'top-center', layout: 'justify-center items-start' },
  { position: 'top-right', layout: 'justify-end items-start' },
  { position: 'center-left', layout: 'justify-start items-center' },
  { position: 'center-center', layout: 'justify-center items-center' },
  { position: 'center-right', layout: 'justify-end items-center' },
  { position: 'bottom-left', layout: 'justify-start items-end' },
  { position: 'bottom-center', layout: 'justify-center items-end' },
  { position: 'bottom-right', layout: 'justify-end items-end' },
  { position: 'distributed-start', layout: 'justify-distributed items-start' },
  { position: 'distributed-center', layout: 'justify-distributed items-center' },
  { position: 'distributed-end', layout: 'justify-distributed items-end' },
];

export const verticalContentLayoutsMap: Array<{ position: ContentPosition; layout: string }> = [
  { position: 'top-left', layout: 'justify-start items-start' },
  { position: 'top-center', layout: 'justify-start items-center' },
  { position: 'top-right', layout: 'justify-start items-end' },
  { position: 'center-left', layout: 'justify-center items-start' },
  { position: 'center-center', layout: 'justify-center items-center' },
  { position: 'center-right', layout: 'justify-center items-end' },
  { position: 'bottom-left', layout: 'justify-end items-start' },
  { position: 'bottom-center', layout: 'justify-end items-center' },
  { position: 'bottom-right', layout: 'justify-end items-end' },
  { position: 'distributed-start', layout: 'justify-distributed items-start' },
  { position: 'distributed-center', layout: 'justify-distributed items-center' },
  { position: 'distributed-end', layout: 'justify-distributed items-end' },
];

export interface ColumnContentLayout {
  direction: 'horizontal' | 'vertical';
  wrap: boolean;
  position: ContentPosition;
}
