/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export class LocalStorageMock {
  store: { [name: string]: string } = {};

  getItem(key: string) {
    return this.store[key];
  }

  setItem(key: string, value: string) {
    this.store[key] = value.toString();
  }

  clear() {
    this.store = {};
  }

  removeItem(key: string) {
    delete this.store[key];
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index: number) {
    return Object.keys(this.store)[index];
  }
}

export const getLocalStorageMock = (): LocalStorageMock => {
  return new LocalStorageMock();
};
