/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface ChromeInitializationStrategy {
  onReady(callback: () => void): void;
}

export class ImmediateInitializationStrategy implements ChromeInitializationStrategy {
  onReady(callback: () => void): void {
    callback();
  }
}
