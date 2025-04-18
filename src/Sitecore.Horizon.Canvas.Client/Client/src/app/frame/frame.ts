/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Chrome } from '../chrome/chrome';

export interface Frame {
  show(host: Element): void;
  hide(): void;
  updatePosAndSize(): void;
}

export class FrameWithChrome<TChrome extends Chrome = Chrome> implements Frame {
  constructor(private readonly frame: Frame, public readonly chrome: TChrome) {}

  show(host: Element): void {
    this.frame.show(host);
  }

  hide(): void {
    this.frame.hide();
  }

  updatePosAndSize(): void {
    this.frame.updatePosAndSize();
  }
}
