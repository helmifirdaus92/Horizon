/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface Logger {
  warn(msg: string): void;
  error(msg: string): void;
}

export const ConsoleLogger: Logger = {
  warn(msg) {
    // eslint-disable-next-line no-console
    console.warn(msg);
  },

  error(msg) {
    // eslint-disable-next-line no-console
    console.error(msg);
  },
};

export const ThrowingLogger: Logger = {
  warn(msg) {
    throw Error(`Warning not expected: ${msg}`);
  },

  error(msg) {
    throw Error(`Error not expected: ${msg}`);
  },
};
