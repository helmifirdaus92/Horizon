/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import Command from '@ckeditor/ckeditor5-core/src/command';
import { ButtonView } from '@ckeditor/ckeditor5-ui';

class PhoneLinkCommand extends Command {
  override execute(phoneNumber: string) {
    const editor = this.editor;

    editor.model.change((writer) => {
      const selection = editor.model.document.selection;

      if (selection.isCollapsed) {
        const position = selection.getFirstPosition();
        writer.insertText(phoneNumber, { linkHref: `tel:${phoneNumber}` }, position!);
      } else {
        const range = selection.getFirstRange();
        if (range) {
          writer.setAttribute('linkHref', `tel:${phoneNumber}`, range);
        }
      }
    });
  }

  override refresh() {
    const editor = this.editor;
    const model = editor.model;
    const selection = model.document.selection;

    const isLink = !!selection.getAttribute('linkHref');
    this.isEnabled = !isLink;
  }
}

export default class AddPhone extends Plugin {
  init() {
    const editor = this.editor;

    // Add the command to the editor
    editor.commands.add('phoneLink', new PhoneLinkCommand(editor));

    editor.ui.componentFactory.add('phoneLink', () => {
      const button = new ButtonView();
      const command = editor.commands.get('phoneLink') as Command;

      button.set({
        label: 'Add phone',
        withText: false,
        tooltip: 'Add phone number',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z" /></svg>',
      });

      // Bind the button's state to the command
      button.bind('isEnabled').to(command, 'isEnabled');

      button.on('execute', () => {
        editor.fire('horizon-add-phone');
      });

      return button;
    });
  }
}
