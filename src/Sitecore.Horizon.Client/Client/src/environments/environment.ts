/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { environment as defaultEnvironment } from './environment.dev';

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// Using dev as default to avoid having to maintain an additional "empty environment".
// This default environment is always replaced by the corresponding mode but needs to exist in order to import it in the code.
export const environment = defaultEnvironment;
