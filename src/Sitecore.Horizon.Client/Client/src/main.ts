/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { INIT_NG_GLOBAL_TESTABILITY } from 'global-testability/initializer';
import { AppModule } from './app/app.module';

platformBrowserDynamic([INIT_NG_GLOBAL_TESTABILITY])
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
