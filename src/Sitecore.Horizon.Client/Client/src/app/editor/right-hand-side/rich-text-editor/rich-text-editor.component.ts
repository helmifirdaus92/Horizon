/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MessagingP2PChannel, MessagingP2PChannelDefFromChannel } from '@sitecore/horizon-messaging';
import { MediaDialogService } from 'app/shared/dialogs/media-dialog/media-dialog.service';
import { Lifetime } from 'app/shared/utils/lifetime';
import { RhsEditorMessaging } from '../rhs-editor-messaging';
import { panelAnimations } from '../rhs-slide-in-panel.animations';
import { EditSourceCodeService } from './edit-source-code.service';
import {
  AlignOptions,
  FormattingOptions,
  HeaderOptions,
  ListOptions,
  RteLink,
  TextFormats,
} from './rich-text-editor.types';

export type CanvasChannel = MessagingP2PChannel<
  // Inbound events
  {
    'selection:change': {
      format: FormattingOptions;
      hasSelection: boolean;
    };
  },
  // Outbound events
  {},
  // Remote RPC services
  {
    getSelection(): {
      format: FormattingOptions;
      hasSelection: boolean;
    };
    setFormatting(options: FormattingOptions): void;
    clearFormatting(): void;
    insertHtmlAtCaretPos(html: string): void;
    getValue(): string;
    setValue(rawValue: string): void;
  },
  // Provided RPC services
  {}
>;

export const CanvasChannelDef: MessagingP2PChannelDefFromChannel<CanvasChannel> = {
  name: 'general',
};

@Component({
  selector: 'app-rich-text-editor',
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  animations: panelAnimations,
})
export class RichTextEditorComponent implements OnInit, OnDestroy {
  private readonly lifetime = new Lifetime();

  formatting: FormattingOptions = new FormattingOptions();
  hasSelection = false;
  isEditingLink = false;
  headers = [undefined, 1, 2, 3, 4, 5, 6];
  keepLinkOpen = false;
  link: RteLink | null = null;
  show = false;
  showLink = false;

  @Input() rhsMessaging?: RhsEditorMessaging;
  private messaging!: CanvasChannel;

  constructor(
    private readonly mediaDialogService: MediaDialogService,
    private readonly editSourceCodeService: EditSourceCodeService,
  ) {}

  ngOnInit() {
    if (!this.rhsMessaging) {
      throw Error('Messaging is not assigned, please check markup.');
    }
    this.messaging = this.rhsMessaging.getChannel(CanvasChannelDef);

    this.rhsMessaging.onReconnect(async () => {
      const selection = await this.messaging.rpc.getSelection();
      this.onSelectionChange(selection.format, selection.hasSelection);
    }, this.lifetime);

    this.lifetime.registerCallbacks(
      this.messaging.on('selection:change', ({ format, hasSelection }) => this.onSelectionChange(format, hasSelection)),
    );
  }

  ngOnDestroy() {
    this.lifetime.dispose();
  }

  align(value: AlignOptions) {
    this.postFormatChange({ align: value });
  }

  format(prop: TextFormats, selected: boolean) {
    this.formatting[prop] = selected;

    const { bold, italic, underline, strike } = this.formatting;

    this.postFormatChange({ bold, italic, underline, strike });
  }

  header(header: HeaderOptions | undefined) {
    if (header === undefined) {
      header = false;
    }

    this.postFormatChange({ header });
  }

  indent(value: number) {
    const indent = (this.formatting.indent ?? 0) + value;

    if (indent >= 0 && indent <= 8) {
      this.formatting.indent = indent;
      this.postFormatChange({ indent });
    }
  }

  isSelected(prop: 'list' | 'align', value: ListOptions | AlignOptions) {
    return this.formatting[prop] === value;
  }

  list(value: ListOptions) {
    this.postFormatChange({ list: this.formatting.list === value ? false : value });
  }

  reset() {
    this.formatting = new FormattingOptions();
    this.messaging.rpc.clearFormatting();
  }

  postFormatChange(formats: FormattingOptions) {
    Object.assign(this.formatting, formats);
    this.messaging.rpc.setFormatting(this.formatting);
  }

  onLinkPanelFocusChange() {
    this.keepLinkOpen = true;
  }

  setLink(link: RteLink | null) {
    this.postFormatChange({ link: link ?? false });
  }

  selectFromMediaDialog() {
    this.mediaDialogService
      .show({
        currentValue: null,
        sources: [],
      })
      .subscribe((result) => {
        this.messaging.rpc.insertHtmlAtCaretPos(result.embeddedHtml!);
      });
  }

  async editSourceCode() {
    const currentValue = await this.messaging.rpc.getValue();
    const dialogResult = await this.editSourceCodeService.promptEditSourceCode(currentValue);

    if (dialogResult.status !== 'OK') {
      return;
    }

    await this.messaging.rpc.setValue(dialogResult.value);
  }

  private onSelectionChange(format: FormattingOptions, hasSelection: boolean) {
    const fieldInfoLink = format.link;

    this.isEditingLink = !!fieldInfoLink;
    this.hasSelection = hasSelection;
    this.formatting = Object.assign(new FormattingOptions(), format);

    this.link = fieldInfoLink !== undefined && fieldInfoLink !== false && !!fieldInfoLink.url ? fieldInfoLink : null;

    if (this.keepLinkOpen) {
      this.keepLinkOpen = false;
    } else {
      this.showLink = false;
    }
  }
}
