/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { HttpClient } from '@angular/common/http';
import { NgZone } from '@angular/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  ExtensionManifest,
  GlobalMessaging,
  MetadataExtensionManifest,
  PageComposer,
} from '@sitecore/page-composer-sdk';
import { environment } from 'environments/environment';
import { ApmAuthRedirectReporterService } from './apm/apm-auth-redirect-reporter.service';
import { AuthenticationService } from './authentication/authentication.service';
import { FeatureFlagsService } from './feature-flags/feature-flags.service';
import { GainsightService } from './gainsight/gainsight.service';

export function appInitializer(
  authenticationService: AuthenticationService,
  featureFlagsService: FeatureFlagsService,
  gainsightService: GainsightService,
  apmAuthRedirectReporterService: ApmAuthRedirectReporterService,
) {
  return async () => {
    const result = await authenticationService.authenticate();
    await Promise.all([featureFlagsService.init(result.returnUrl), authenticationService.resolveTenant()]);
    await gainsightService.init(result.user);
    apmAuthRedirectReporterService.addTenantLabels();
  };
}

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, `/assets/i18n/`, `.json?v=${Math.floor(Math.random() * 100000)}`);
}

export function pageComposerInit(ngZone: NgZone): GlobalMessaging {
  return ngZone.runOutsideAngular(() => {
    const pageComposer = new PageComposer();

    let manifests: Array<ExtensionManifest | MetadataExtensionManifest> = [
      {
        type: 'extension',
        addToRegion: 'EditingShell.PropertiesPanel.SelectionDetails',
        name: 'Sample.RenderingPropsEditor',
        renderer: {
          client: {
            name: 'Sample.RenderingPropsEditor',
            path: '/sxa/client/main.js',
            type: 'es2015',
          },
        },
        sortOrder: 500,
        parameters: {},
        basePath: '',
        subPath: '',
      },
      {
        type: 'extension',
        addToRegion: 'EditingShell.System',
        name: 'Sample.RenderingPropsEditorTest',
        renderer: {
          client: {
            name: 'Sample.RenderingPropsEditorTest',
            path: '/sxa/client/datasource.js',
            type: 'es2015',
          },
        },
        sortOrder: 500,
        parameters: {},
      },
    ];

    const fEaaSManifests: Array<ExtensionManifest | MetadataExtensionManifest> = [
      {
        type: 'extension',
        addToRegion: 'EditingShell.Workspace.PropertiesPanel',
        name: 'ExternalComponents.RightPanel',
        renderer: {
          client: {
            name: 'ExternalComponents.RightPanel',
            path: 'https://feaasstatic.blob.core.windows.net/packages/page-extension/latest/loader.js',
            type: 'es2015',
          },
        },
        sortOrder: 500,
        parameters: {},
        basePath: '',
        subPath: '',
      },
      {
        type: 'extension',
        addToRegion: 'EditingShell.System',
        name: 'ExternalComponents.Context',
        renderer: {
          client: {
            name: 'ExternalComponents.Context',
            path: 'https://feaasstatic.blob.core.windows.net/packages/page-extension/latest/loader.js',
            type: 'es2015',
          },
        },
        sortOrder: 500,
        parameters: {},
      },
      {
        type: 'extension',
        addToRegion: 'EditingShell.PropertiesPanel.SlidingPanel',
        name: 'ExternalComponents.SlidingPanel',
        renderer: {
          client: {
            name: 'ExternalComponents.SlidingPanel',
            path: 'https://feaasstatic.blob.core.windows.net/packages/page-extension/latest/loader.js',
            type: 'es2015',
          },
        },
        sortOrder: 500,
        parameters: {
          contentKey: 'components:theme',
        },
      },
    ];

    if (!environment.feaaSDisabled) {
      manifests = manifests.concat(fEaaSManifests);
    }

    if (!!environment.customExtensions) {
      try {
        manifests = manifests.concat(JSON.parse(environment.customExtensions));
        // eslint-disable-next-line no-empty
      } catch {}
    }

    pageComposer.addExtensionManifests(manifests);
    pageComposer.init();

    return pageComposer.getMessaging();
  });
}
