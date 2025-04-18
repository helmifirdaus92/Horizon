/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-unsafe-call */
import Quill from 'quill';

const Link = Quill.import('formats/link');

interface SitecoreLink {
  url: string | null;
  title: string | null;
  target: string | null;
}

export class HrzRichTextLink extends Link {
  static create(value: SitecoreLink): HTMLAnchorElement {
    const node = super.create(value.url) as HTMLAnchorElement;
    value.url = this.sanitize(value.url);

    if (value.title) {
      node.setAttribute('title', value.title);
    }

    if (value.target) {
      node.setAttribute('target', value.target);
    } else {
      node.removeAttribute('target');
    }

    return node;
  }

  static formats(domNode: HTMLAnchorElement): SitecoreLink {
    const link: SitecoreLink = {
      url: domNode.getAttribute('href'),
      title: domNode.getAttribute('title'),
      target: domNode.getAttribute('target'),
    };

    return link;
  }

  format(name: string, value: SitecoreLink | false) {
    if (!value) {
      super.format('link', value);

      return;
    }

    if (name !== this.statics.blotName || !value) {
      super.format(name, value.url);
    } else {
      this.domNode.setAttribute('href', value.url);
    }

    if (value.title) {
      this.domNode.setAttribute('title', value.title);
    }

    if (value.target) {
      this.domNode.setAttribute('target', value.target);
    } else {
      this.domNode.removeAttribute('target');
    }
  }
}
