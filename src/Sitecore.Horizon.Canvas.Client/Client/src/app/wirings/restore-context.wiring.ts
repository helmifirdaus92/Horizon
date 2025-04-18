/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChromePersistSelection } from '../chrome/chrome-persist-selection';
import { Wiring } from './wiring';

export class RestoreContextWiring implements Wiring {
  constructor(private readonly chromePersistSelection: ChromePersistSelection) {}

  wire(): void {
    this.chromePersistSelection.restoreSnapshot();
  }
}
