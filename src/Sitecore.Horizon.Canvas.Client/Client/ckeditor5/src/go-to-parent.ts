/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { EmitterMixin, mix, } from '@ckeditor/ckeditor5-utils';

export class GotoParent extends Plugin {
  init() {
    const editor = this.editor;
    editor.ui.componentFactory.add('horizonGoToParent', () => {
      const button = new ButtonView();

      button.set({
        label: 'Go to parent',
        withText: false,
        tooltip: "Select parent element",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 18V20H13.5C9.91 20 7 17.09 7 13.5V7.83L3.91 10.92L2.5 9.5L8 4L13.5 9.5L12.09 10.91L9 7.83V13.5C9 16 11 18 13.5 18H20Z" /></svg>'
      });

      button.on('execute', () => {
        editor.fire('horizon-go-to-parent');
      });

      return button;
    });
  }
}

mix(GotoParent, EmitterMixin);
