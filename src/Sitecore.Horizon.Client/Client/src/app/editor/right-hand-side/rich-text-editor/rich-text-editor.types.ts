/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export type AlignOptions = false | 'center' | 'right' | 'justify';
export type TextFormats = 'bold' | 'italic' | 'underline' | 'strike';
export type HeaderOptions = false | 1 | 2 | 3 | 4 | 5 | 6;
export type ListOptions = false | 'bullet' | 'ordered';

export class FormattingOptions {
  constructor(
    public bold?: boolean,
    public italic?: boolean,
    public underline?: boolean,
    public strike?: boolean,
    public list?: ListOptions,
    public align?: AlignOptions,
    public indent?: number,
    public header?: HeaderOptions,
    public link?: RteLink | false,
  ) {}
}

export interface RteLink {
  url: string;
  title: string | null;
  target: string | null;
}

export type EditRteContentResult = { status: 'OK'; value: string } | { status: 'Canceled' };
