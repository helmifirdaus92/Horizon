/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ButtonView, EmitterMixin, mix, Plugin } from 'ckeditor5';

export class SelectMedia extends Plugin {
  init() {
    const editor = this.editor;

    editor.ui.componentFactory.add('horizonSelectMedia', () => {
      const button = new ButtonView();

      button.set({
        label: 'Select media',
        withText: false,
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 13.5L11 16.5L14.5 12L19 18H5L8.5 13.5ZM21 19V5C21 3.89 20.1 3 19 3H5C4.47 3 3.961 3.211 3.586 3.586C3.211 3.961 3 4.47 3 5V19C3 19.53 3.211 20.039 3.586 20.414C3.961 20.789 4.47 21 5 21H19C19.53 21 20.039 20.789 20.414 20.414C20.789 20.039 21 19.53 21 19Z" fill="black"/></svg>',
        tooltip: 'Select media',
      });

      button.on('execute', () => {
        editor.fire('horizon-media-selection');
      });

      return button;
    });
  }
}

mix(SelectMedia, EmitterMixin);
