/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ButtonView, Command, Plugin } from 'ckeditor5';

class InternalLinkCommand extends Command {
  override execute(path: string, displayText: string) {
    const editor = this.editor;

    editor.model.change((writer) => {
      const selection = editor.model.document.selection;

      // If no text is selected, we show selected item's display name as a text in canvas field.
      if (selection.isCollapsed) {
        editor.model.change((write) => {
          const position = selection.getFirstPosition();
          write.insertText(displayText, { linkHref: path }, position!);
        });
      } else {
        const range = selection.getFirstRange();
        if (range) {
          writer.setAttribute('linkHref', path, range);
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

export class InternalLink extends Plugin {
  init() {
    const editor = this.editor;

    // Add the command to the editor
    editor.commands.add('internalLink', new InternalLinkCommand(editor));

    editor.ui.componentFactory.add('internalLink', () => {
      const command = editor.commands.get('internalLink') as Command;

      const button = new ButtonView();
      button.set({
        label: 'Internal link',
        withText: false,
        tooltip: 'Insert internal link',
        icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7,7H11V9H7A3,3 0 0,0 4,12A3,3 0 0,0 7,15H11V17H7A5,5 0 0,1 2,12A5,5 0 0,1 7,7M17,7A5,5 0 0,1 22,12H20A3,3 0 0,0 17,9H13V7H17M8,11H16V13H8V11M17,12H19V15H22V17H19V20H17V17H14V15H17V12Z" /></svg>',
      });

      // Bind the button's state to the command
      button.bind('isEnabled').to(command, 'isEnabled');

      button.on('execute', () => {
        editor.fire('horizon-insert-internal-link');
      });
      return button;
    });
  }
}
