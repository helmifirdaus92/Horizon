/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable, NgZone } from '@angular/core';
import { AddPhoneNumberService } from 'app/editor/right-hand-side/rich-text-editor/add-phone-number.service';
import { MediaPickerService } from 'app/editor/right-hand-side/rich-text-editor/media-picker.service';
import { ContentItemDialogService } from 'app/shared/dialogs/content-item-dialog/content-item-dialog.service';
import { normalizeIdWithoutDash } from 'app/shared/utils/utils';
import { ClassicEditor } from 'ckeditor5';
import { firstValueFrom } from 'rxjs';
import { convertXmcUrlsToAbsolute } from '../rich-text-field.component';

const CK_EDITOR_CONTENT_CLASS_NAME = 'ck-content';

@Injectable({
  providedIn: 'root',
})
export class CkeditorHandlerService {
  constructor(
    private readonly addPhoneNumberService: AddPhoneNumberService,
    private readonly mediaPickerService: MediaPickerService,
    private readonly contentItemDialogService: ContentItemDialogService,
    private readonly ngZone: NgZone,
  ) {}

  registerCustomPluginEvents(editor: ClassicEditor): void {
    // Add phone number
    editor.on('horizon-add-phone', async () => {
      this.ngZone.run(async () => {
        const result = await this.addPhoneNumberService.promptAddPhoneNumber();
        if (result.status === 'OK') {
          editor.execute('phoneLink', result.value);
        }
      });
    });

    // Select media item
    editor.on('horizon-media-selection', async () => {
      this.ngZone.run(async () => {
        const result = await this.mediaPickerService.promptSelectMedia();
        if (result.status === 'OK') {
          const html = convertXmcUrlsToAbsolute(result.selectedValue.embeddedHtml ?? '');

          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const element = doc.body.firstElementChild;
          if (element instanceof HTMLAnchorElement) {
            editor.execute('internalLink', element.href, element.text);
          } else if (element instanceof HTMLImageElement) {
            editor.execute('imageInsert', {
              source: [
                {
                  src: result.selectedValue.src,
                  alt: result.selectedValue.alt,
                },
              ],
            });
          } else {
            const viewFragment = editor.data.processor.toView(html);
            const modelFragment = editor.data.toModel(viewFragment);
            editor.model.insertContent(modelFragment);
          }
        }
      });
    });

    // Insert internal link
    editor.on('horizon-insert-internal-link', async () => {
      this.ngZone.run(async () => {
        const result = await this.promptSelectPage();

        const path = `~/link.aspx?_id=${normalizeIdWithoutDash(result.id)}&_z=z`;
        const displayName = result.displayName;
        editor.execute('internalLink', path, displayName);
      });
    });

    // Reset field value
    editor.on('horizon-reset-field-value', async () => {
      const valueWithAbsoluteXmcUrls = convertXmcUrlsToAbsolute('');
      editor.setData(this.unwrapHtmlWithClass(valueWithAbsoluteXmcUrls));
    });
  }

  private async promptSelectPage() {
    const dialogResult = await firstValueFrom(
      this.contentItemDialogService.show({
        id: null,
        language: null,
        site: null,
        showLanguageSelector: false,
        showPagesOnly: true,
      }),
    );
    return { id: dialogResult.id, displayName: dialogResult.displayName };
  }

  private unwrapHtmlWithClass(html: string): string {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;

    const rootElement = tempElement.querySelector(`.${CK_EDITOR_CONTENT_CLASS_NAME}`);
    if (rootElement && rootElement === tempElement.firstElementChild) {
      return rootElement.innerHTML;
    }

    return html;
  }
}
