/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export type LayoutTemplatesKey =
  | '1/1'
  | '1/2-1/2'
  | '1/3-1/3-1/3'
  | '1/4-1/4-1/4-1/4'
  | '2/3-1/3'
  | '1/3-2/3'
  | '1/2-1/4-1/4'
  | '1/4-2/4-1/4'
  | '1/4-1/4-1/2'
  | '1/5-1/5-1/5-1/5-1/5'
  | '1/6-1/6-1/6-1/6-1/6-1/6'
  | 'custom';

export interface LayoutTemplate {
  key: LayoutTemplatesKey;
  columnsCount: number;
  columns: string[];
  columnNames: string[];
  title: string;
}

export const layoutTemplates: LayoutTemplate[] = [
  {
    key: '1/1',
    columnsCount: 1,
    columns: ['basis-full'],
    columnNames: ['¹⁄₁'],
    title: '¹⁄₁',
  },
  {
    key: '1/2-1/2',
    columnsCount: 2,
    columns: ['basis-1-2', 'basis-1-2'],
    columnNames: ['½', '½'],
    title: '½ - ½',
  },
  {
    key: '1/3-1/3-1/3',
    columnsCount: 3,
    columns: ['basis-1-3', 'basis-1-3', 'basis-1-3'],
    columnNames: ['⅓', '⅓', '⅓'],
    title: '⅓ - ⅓ - ⅓',
  },
  {
    key: '1/4-1/4-1/4-1/4',
    columnsCount: 4,
    columns: ['basis-1-4', 'basis-1-4', 'basis-1-4', 'basis-1-4'],
    columnNames: ['¼', '¼', '¼', '¼'],
    title: '¼ - ¼ - ¼ - ¼',
  },
  {
    key: '2/3-1/3',
    columnsCount: 2,
    columns: ['basis-2-3', 'basis-1-3'],
    columnNames: ['⅔', '⅓'],
    title: '⅔ - ⅓',
  },
  {
    key: '1/3-2/3',
    columnsCount: 2,
    columns: ['basis-1-3', 'basis-2-3'],
    columnNames: ['⅓', '⅔'],
    title: '⅓ - ⅔',
  },
  {
    key: '1/2-1/4-1/4',
    columnsCount: 3,
    columns: ['basis-1-2', 'basis-1-4', 'basis-1-4'],
    columnNames: ['½', '¼', '¼'],
    title: '½ - ¼ - ¼',
  },
  {
    key: '1/4-2/4-1/4',
    columnsCount: 3,
    columns: ['basis-1-4', 'basis-2-4', 'basis-1-4'],
    columnNames: ['¼', '½', '¼'],
    title: '¼ - ½ - ¼',
  },
  {
    key: '1/4-1/4-1/2',
    columnsCount: 3,
    columns: ['basis-1-4', 'basis-1-4', 'basis-1-2'],
    columnNames: ['¼', '¼', '½'],
    title: '¼ - ¼ - ½',
  },
  {
    key: '1/5-1/5-1/5-1/5-1/5',
    columnsCount: 5,
    columns: ['basis-1-5', 'basis-1-5', 'basis-1-5', 'basis-1-5', 'basis-1-5'],
    columnNames: ['⅕', '⅕', '⅕', '⅕', '⅕'],
    title: '⅕ - ⅕ - ⅕ - ⅕ - ⅕',
  },
  {
    key: '1/6-1/6-1/6-1/6-1/6-1/6',
    columnsCount: 6,
    columns: ['basis-1-6', 'basis-1-6', 'basis-1-6', 'basis-1-6', 'basis-1-6', 'basis-1-6'],
    columnNames: ['⅙', '⅙', '⅙', '⅙', '⅙', '⅙'],
    title: '⅙ - ⅙ - ⅙ - ⅙ - ⅙ - ⅙',
  },
];
