/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import Quill from 'quill';
import { Optional } from '../../../utils/lang';
const BlockEmbed = Quill.import('blots/block/embed');

type SourceAttributes = Optional<Pick<HTMLSourceElement, 'src' | 'srcset' | 'media' | 'type' | 'sizes'>, 'src' | 'srcset'>;

interface Video {
  sources: SourceAttributes[];
}

type VideoAttributes = Optional<
  Pick<HTMLVideoElement, 'src' | 'height' | 'width' | 'controls' | 'autoplay' | 'loop' | 'muted' | 'poster' | 'preload'>,
  'src'
>;

function setProperty<T, K extends keyof T>(element: T, key: K, value: T[K] | undefined) {
  if (value !== undefined) {
    element[key] = value;
  }
}

export class HrzRichTextHtml5Video extends BlockEmbed {
  static readonly tagName = 'video';
  static readonly blotName = 'hrzVideo';

  static create(value: Video): HTMLVideoElement {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const node = super.create(value) as HTMLVideoElement;
    value.sources.forEach((source) => {
      const elem = document.createElement('source');
      setProperty(elem, 'src', source.src);
      setProperty(elem, 'srcset', source.srcset);
      setProperty(elem, 'media', source.media);
      setProperty(elem, 'type', source.type);
      setProperty(elem, 'sizes', source.sizes);

      node.appendChild(elem);
    });

    return node;
  }

  static value(domNode: HTMLVideoElement): Video {
    const sources: SourceAttributes[] = [];
    domNode.childNodes.forEach((child) => {
      if (child instanceof HTMLSourceElement) {
        sources.push({
          src: child.src || undefined,
          srcset: child.srcset || undefined,
          media: child.media,
          type: child.type,
          sizes: child.sizes,
        });
      }
    });

    return {
      sources,
    };
  }

  static formats(domNode: HTMLVideoElement): VideoAttributes {
    const value: VideoAttributes = {
      src: domNode.src || undefined,
      height: domNode.height,
      width: domNode.width,
      controls: domNode.controls,
      autoplay: domNode.autoplay,
      loop: domNode.loop,
      muted: domNode.muted,
      poster: domNode.poster,
      preload: domNode.preload,
    };

    return value;
  }

  format<K extends keyof VideoAttributes>(property: K, value: VideoAttributes[K]) {
    setProperty(this.domNode, property, value);
  }
}
