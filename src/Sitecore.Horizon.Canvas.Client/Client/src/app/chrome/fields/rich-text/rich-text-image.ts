/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import Quill from 'quill';
const Image = Quill.import('formats/image');

export class HrzRichTextImage extends Image {
  static formats(domNode: HTMLVideoElement) {
    const formats = super.formats(domNode);
    if (domNode.hasAttribute('style')) {
      formats.style = domNode.getAttribute('style');
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return formats;
  }

  format(property: string, value: string | undefined) {
    const domNode = this.domNode as HTMLImageElement;

    if (property === 'style' && value !== undefined) {
      domNode.setAttribute('style', value);
      return;
    }

    super.format(property, value);
  }
}
