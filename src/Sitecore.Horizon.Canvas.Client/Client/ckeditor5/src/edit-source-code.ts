/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { EmitterMixin, mix } from '@ckeditor/ckeditor5-utils';

export class EditSourceCode extends Plugin {
  init() {
    const editor = this.editor;
    editor.ui.componentFactory.add('horizonEditSourceCode', () => {
      const button = new ButtonView();

      button.set({
        label: 'HTML',
        withText: false,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z" /></svg>',
        tooltip: 'Edit source code',
      });

      button.on('execute', () => {
        editor.fire('horizon-edit-source-code');
      });

      return button;
    });
  }
}

mix(EditSourceCode, EmitterMixin);
