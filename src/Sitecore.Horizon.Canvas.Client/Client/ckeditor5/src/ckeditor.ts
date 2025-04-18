/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import { InlineEditor as InlineEditorBase } from '@ckeditor/ckeditor5-editor-inline';

import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { Autoformat } from '@ckeditor/ckeditor5-autoformat';
import { Bold, Italic, Strikethrough, Subscript, Superscript, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { Font } from '@ckeditor/ckeditor5-font';
import { Heading, HeadingOption } from '@ckeditor/ckeditor5-heading';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import { DataFilter, DataSchema, GeneralHtmlSupport, HtmlComment } from '@ckeditor/ckeditor5-html-support';
import { AutoImage, Image, ImageCaption, ImageInsert, ImageResize, ImageStyle, ImageToolbar } from '@ckeditor/ckeditor5-image';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { AutoLink, Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { List, ListProperties } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { PasteFromOffice } from '@ckeditor/ckeditor5-paste-from-office';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { StandardEditingMode } from '@ckeditor/ckeditor5-restricted-editing';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { Style } from '@ckeditor/ckeditor5-style';
import { Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar } from '@ckeditor/ckeditor5-table';
import AddPhone from './add-phone';
import { EditSourceCode } from './edit-source-code';
import { GotoParent } from './go-to-parent';
import InternalLink from './internal-link';
import { ResetFieldValue } from './reset-value';
import { SelectMedia } from './select-media';

const getPlugins = () => [
  Alignment,
  AutoImage,
  AutoLink,
  Bold,
  BlockQuote,
  DataFilter,
  DataSchema,
  Essentials,
  FindAndReplace,
  GeneralHtmlSupport,
  Heading,
  HorizontalLine,
  HtmlComment,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  Paragraph,
  RemoveFormat,
  SourceEditing,
  StandardEditingMode,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  Underline,
  GotoParent,
  SelectMedia,
  EditSourceCode,
  ResetFieldValue,
  PasteFromOffice,
  AddPhone,
  InternalLink,
  Autoformat,
  Font,
];

const getDefaultConfig = (): typeof InlineEditorBase.defaultConfig => ({
  toolbar: {
    items: [
      'horizonGoToParent',
      '|',
      'bold',
      'italic',
      'underline',
      'blockQuote',
      {
        label: 'Formatting',
        icon: 'text',
        items: ['strikethrough', 'subscript', 'superscript', '|', 'removeFormat'],
      },
      'fontColor',
      'fontBackgroundColor',
      '|',
      'heading',
      '|',
      'alignment',
      'bulletedList',
      'numberedList',
      '|',
      'outdent',
      'indent',
      '|',
      'link',
      'internalLink',
      'phoneLink',
      '|',
      {
        label: 'Insert',
        withText: false,
        icon: 'plus',
        items: ['horizonSelectMedia', 'insertTable', 'HorizontalLine'],
      },
      '|',
      'horizonEditSourceCode',
      '|',
      'horizonResetFieldValue',
    ],
    shouldNotGroupWhenFull: true,
  },
  alignment: {
    options: ['left', 'right', 'center', 'justify'],
  },
  heading: {
    options: [
      { model: 'paragraph', title: 'P', class: 'ck-heading_paragraph' },
      { model: 'heading1', view: 'h1', title: 'H1', class: 'ck-heading_heading1' },
      { model: 'heading2', view: 'h2', title: 'H2', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: 'H3', class: 'ck-heading_heading3' },
      { model: 'heading4', view: 'h4', title: 'H4', class: 'ck-heading_heading4' },
      { model: 'heading5', view: 'h5', title: 'H5', class: 'ck-heading_heading5' },
      { model: 'heading6', view: 'h6', title: 'H6', class: 'ck-heading_heading6' },
    ] as HeadingOption[],
  },
  ui: {
    poweredBy: {
      position: 'inside',
      side: 'right',
      label: '',
      horizontalOffset: 5,
      verticalOffset: 5,
    },
  },
  // Allow most HTML tags for rich text editing, excluding XSS-prone tags like <script>, <iframe>, <input type="file">
  htmlSupport: {
    allow: [
      {
        name: /.*/,
        attributes: true,
        classes: true,
        styles: true,
      },
    ],
    disallow: [
      { name: /^(script|frame|object|embed|form|meta|base|xml)$/ },
      {
        name: 'input',
        attributes: {
          type: 'file',
        },
      },
    ],
  },
  image: {
    toolbar: [
      'imageTextAlternative',
      'toggleImageCaption',
      '|',
      'imageStyle:inline',
      'imageStyle:wrapText',
      'imageStyle:breakText',
      '|',
      'linkImage',
    ],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableCellProperties', 'tableProperties'],
  },
  language: 'en',
  list: {
    properties: {
      styles: true,
      startIndex: true,
      reversed: true,
    },
  },
});

export class CKEditorInline extends InlineEditorBase {
  public static override builtinPlugins = getPlugins();
  public static override defaultConfig = getDefaultConfig();
}

export default { CKEditorInline };
