/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ButtonView, EmitterMixin, mix, Plugin } from 'ckeditor5';

export class ResetFieldValue extends Plugin {
  init() {
    const editor = this.editor;
    editor.ui.componentFactory.add('horizonResetFieldValue', () => {
      const button = new ButtonView();

      button.set({
        label: 'Reset field value',
        withText: false,
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z" /></svg>',
        tooltip: 'Reset field value',
      });

      button.on('execute', () => {
        editor.fire('horizon-reset-field-value');
      });

      return button;
    });
  }
}

mix(ResetFieldValue, EmitterMixin);
