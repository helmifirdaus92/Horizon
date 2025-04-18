/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-media-card',
  template: `
    <ng-spd-thumbnail>
      @if (fileExtension === 'pdf' || fileExtension === 'doc' || fileExtension === 'docx') {
        <div class="icon-wrapper" [ngClass]="fileExtension">
          <span
            class="mdi"
            [ngClass]="{
              'mdi-file-document-outline': fileExtension === 'doc',
              'mdi-file-pdf-box': fileExtension === 'pdf',
              'mdi-file-word-box': fileExtension === 'docx',
            }"
          ></span>
        </div>
      } @else {
        <img [src]="src" [attr.alt]="text" />
      }
    </ng-spd-thumbnail>
    <div class="text" [title]="text">{{ text }}</div>
  `,
  styleUrls: ['./media-card.component.scss'],
  host: {
    '[class.select]': 'select',
  },
})
export class MediaCardComponent {
  @Input() src?: string;
  @Input() text = '';
  @Input() select = false;
  @Input() fileExtension = '';
}
