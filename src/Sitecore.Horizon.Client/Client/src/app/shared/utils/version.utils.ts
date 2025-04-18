/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export class Version {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;

  constructor(private readonly version: string) {
    // eslint-disable-next-line no-useless-escape
    const versionArray: number[] = (typeof this.version === 'string' ? this.version : '').split(/[.+\-]/).map(Number);

    this.major = versionArray[0] || 0;
    this.minor = versionArray[1] || 0;
    this.patch = versionArray[2] || 0;
  }

  isLocalBuild() {
    if (this.version === '0.0.0.0' || (this.major === 0 && this.minor === 0 && this.patch === 0)) {
      return true;
    }

    return false;
  }

  isEqualOrGreaterThan(versionToCompare: Version): boolean {
    if (this.isLocalBuild() || versionToCompare.isLocalBuild()) {
      return true;
    }

    if (this.major > versionToCompare.major) {
      return true;
    } else if (this.major < versionToCompare.major) {
      return false;
    }

    if (this.minor > versionToCompare.minor) {
      return true;
    } else if (this.minor < versionToCompare.minor) {
      return false;
    }

    if (this.patch > versionToCompare.patch) {
      return true;
    } else if (this.patch < versionToCompare.patch) {
      return false;
    }

    // The final case is versions are equal
    return true;
  }
}
