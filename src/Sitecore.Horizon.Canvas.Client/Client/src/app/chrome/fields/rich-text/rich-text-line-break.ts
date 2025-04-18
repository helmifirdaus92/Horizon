/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Blot, Parent } from 'parchment/dist/src/blot/abstract/blot';
import Quill from 'quill';

const Delta = Quill.import('delta');
const Break = Quill.import('blots/break');
const Embed = Quill.import('blots/embed');

export function lineBreakMatcher() {
  const newDelta = new Delta();
  newDelta.insert({ break: '' });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return newDelta;
}

export function removeExtraneousLineBreak(quill: Quill) {
  const length = quill.getLength();
  if (!length) {
    return;
  }

  const text = quill.getText(length - 2, 2);

  if (text === '\n\n') {
    quill.deleteText(length - 2, 2);
  }
}

export class HrzRichTextLineBreak extends Break {
  insertInto(parent: Parent, ref: Blot) {
    Embed.prototype.insertInto.call(this, parent, ref);
  }

  length() {
    return 1;
  }

  value() {
    return '\n';
  }
}
