/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import type * as FEAAS from '@sitecore-feaas/clientside';
import SDK, { ComponentModel, DatasourceModel, ExternalComponentModel, VersionModel } from '@sitecore-feaas/sdk';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { getGroupedListByKey } from 'app/shared/utils/array.utils';
import { isSameGuid } from 'app/shared/utils/utils';
import { BehaviorSubject, Observable, combineLatest, firstValueFrom, of, switchMap } from 'rxjs';
import {
  DataSourceItemRoot,
  FEaaSComponent,
  FEaaSComponentThumbnail,
  FEaaSComponentsCollection,
  FEaaSExternalComponent,
} from './feaas-component-types';

export interface FEaaSComponentsUtils {
  getUniqueId: () => string;
}

export interface ExternalComponentModeltWithSites extends ExternalComponentModel {
  sites?: Array<{ id: string; name: string }>;
}
@Injectable({
  providedIn: 'root',
})
export class FEaaSComponentsDalService {
  private feaas?: typeof FEAAS;

  private _sitecoreCollections$ = new BehaviorSubject<FEaaSComponentsCollection[]>([]);
  private _externalCollections$ = new BehaviorSubject<FEaaSComponentsCollection[]>([]);

  componentsCollections$: Observable<FEaaSComponentsCollection[]>;

  private readonly _isLoading$ = new BehaviorSubject<boolean>(true);
  readonly isLoading$ = this._isLoading$.asObservable();

  readonly _dataSources$ = new BehaviorSubject<DataSourceItemRoot>({
    dataSources: { externalDataSources: [], xmCloudDataSources: [] },
  });

  configuration: Promise<{ cdnHostName: string; frontEndUrl: string }>;
  utils: Promise<FEaaSComponentsUtils>;

  constructor(
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly translateService: TranslateService,
    private readonly siteService: SiteService,
    private readonly contextService: ContextService,
    private sanitizer: DomSanitizer,
  ) {
    if (!this.featureFlagsService.isFeatureEnabled('pages_fetch-feaas-components')) {
      this.componentsCollections$ = of([]);
      this._isLoading$.next(false);
      this.configuration = Promise.resolve({ cdnHostName: '', frontEndUrl: '' });
      this.utils = Promise.resolve({ getUniqueId: () => '' });
      return;
    }

    try {
      const sdkPromise = new Promise<SDK>((resolve) => {
        const feaasContext = document.querySelector('feaas-context') as any;
        const whenSDKReady = feaasContext?.whenSDKReady as Promise<SDK>;
        if (whenSDKReady) {
          this.feaas = feaasContext.clientside;
          whenSDKReady.then((sdk: SDK) => {
            resolve(sdk);
          });
        } else {
          document.addEventListener('feaasContext', ((e: CustomEvent<{ sdk: SDK; clientside: typeof FEAAS }>) => {
            this.feaas = e.detail.clientside;
            resolve(e.detail.sdk);
          }) as EventListener);
        }
      });

      this.configuration = this.getConfiguration(sdkPromise);
      this.utils = this.getUtils(sdkPromise);
      this.componentsCollections$ = this.getCollections(sdkPromise);
    } catch {
      console.warn('Failed to fetch FEaaS component collections');
      this.componentsCollections$ = of([]);
      this._isLoading$.next(false);
      this.configuration = Promise.resolve({ cdnHostName: '', frontEndUrl: '' });
      this.utils = Promise.resolve({ getUniqueId: () => '' });
    }
  }

  private async getDataSources(sdkPromise: Promise<SDK>): Promise<DataSourceItemRoot> {
    const sdk = await sdkPromise;
    const xmCloudTemplateIds = new Set(
      sdk.auth.tenant?.datasources.map((template: DatasourceModel) => template.id) ?? [],
    );

    const externalDataSources = sdk.datasources
      ?.filter((ds) => !xmCloudTemplateIds.has(ds.id))
      .map((ds) => {
        return {
          dataSourceId: ds.id,
          name: ds.name,
        };
      });
    const xmCloudDataSources = sdk.datasources
      ?.filter((ds) => xmCloudTemplateIds.has(ds.id))
      .map((ds) => {
        return {
          dataSourceId: ds.id,
          name: ds.name,
        };
      });

    return {
      dataSources: {
        externalDataSources,
        xmCloudDataSources,
      },
    };
  }

  getCollections(sdkPromise: Promise<SDK>): Observable<FEaaSComponentsCollection[]> {
    this.fetchSitecoreCollections(sdkPromise);
    this.fetchExternalCollections(sdkPromise);

    return combineLatest([this._sitecoreCollections$, this._externalCollections$]).pipe(
      switchMap(([collections, extCollections]) => this.getCombinedCollections(collections, extCollections)),
    );
  }

  private async getCombinedCollections(
    sitecoreCollections: FEaaSComponentsCollection[],
    externalCollections: FEaaSComponentsCollection[],
  ) {
    const combinedCollections: FEaaSComponentsCollection[] = [];
    const createNewCollection = (collection: FEaaSComponentsCollection): FEaaSComponentsCollection => {
      return {
        name: collection.name,
        components: collection.components,
        isDefault: collection.isDefault,
      };
    };

    sitecoreCollections.forEach((c) => {
      combinedCollections.push(createNewCollection(c));
    });

    const defaultCollection = combinedCollections.find((cc) => cc.isDefault);
    externalCollections.forEach((c) => {
      const existingCollection = combinedCollections.find((cc) => cc.name === c.name);
      if (existingCollection) {
        existingCollection.components = existingCollection.components.concat(c.components);
      } else if (c.isDefault && defaultCollection) {
        defaultCollection.components = defaultCollection.components.concat(c.components);
      } else {
        combinedCollections.push(createNewCollection(c));
      }
    });

    return combinedCollections;
  }

  private async getUtils(sdkPromise: Promise<SDK>): Promise<FEaaSComponentsUtils> {
    const sdk = await sdkPromise;
    return {
      getUniqueId() {
        return sdk.nanoid(15);
      },
    };
  }

  private async getConfiguration(sdkPromise: Promise<SDK>): Promise<{ cdnHostName: string; frontEndUrl: string }> {
    const sdk = await sdkPromise;
    const library = await sdk.library;

    return {
      cdnHostName: sdk.cdn,
      frontEndUrl: sdk.getFrontendURL({ getPath: () => library.getPath() }),
    };
  }

  private async fetchSitecoreCollections(sdkPromise: Promise<SDK>) {
    const sdk = await sdkPromise;
    const library = await sdk.library;

    const fEaaSComponentsCollections: FEaaSComponentsCollection[] = [];
    for (const collection of library.collections) {
      const fEaaSComponentsCollection: FEaaSComponentsCollection = {
        name: collection.name,
        components: [],
        isDefault: collection.isDefault,
      };

      const components = collection.components.filter((component) => component.stagedAt);
      for (const component of components) {
        const dataSettings = component.getDataSettings();
        const cmp: FEaaSComponent = {
          id: component.id,
          name: component.name,
          datasourceIds: component.datasourceIds,
          libraryId: library.id,
          collectionId: collection.id,
          thumbnail: this.getThumbnail(component),
          published: component.status === 'published',
          dataSettings: dataSettings ? JSON.stringify(dataSettings) : undefined,
          isExternal: false,
          canUseXMDatasources:
            !!component.getDatasources && component.getDatasources()?.some((c) => c.type === 'xmTemplate'),
        };

        fEaaSComponentsCollection.components.push(cmp);
      }

      fEaaSComponentsCollections.push(fEaaSComponentsCollection);
    }

    this._sitecoreCollections$.next(fEaaSComponentsCollections);
    const dataSources = await this.getDataSources(sdkPromise);
    this._dataSources$.next(dataSources);
    this._isLoading$.next(false);
  }

  private async fetchExternalCollections(sdkPromise: Promise<SDK>) {
    const sdk = await sdkPromise;
    const externalComponents = sdk.externalComponents;
    if (externalComponents.length) {
      const collections = await this.toFEaaSCollections(externalComponents);
      this._externalCollections$.next(collections);
    }

    sdk.externalComponents.observe(async (components) => {
      const collections = await this.toFEaaSCollections(components);
      this._externalCollections$.next(collections);
    });
  }

  private async toFEaaSCollections(
    externalComponents: ExternalComponentModeltWithSites[],
  ): Promise<FEaaSComponentsCollection[]> {
    const groupedExternalComponents = getGroupedListByKey(externalComponents, 'group');
    const externalComponentsCollections: FEaaSComponentsCollection[] = [];
    const contexSiteId = this.siteService.getSiteByName(this.contextService.siteName)?.id;

    for (const collection of groupedExternalComponents) {
      const extComponentsCollection: FEaaSComponentsCollection = {
        name: collection[0].group ?? (await firstValueFrom(this.translateService.get('EDITOR.DEFAULT_COLLECTION'))),
        components: [],
        isDefault: collection[0].group ? false : true,
      };

      for (const component of collection) {
        // Skip Forms component
        if (component.name.toLowerCase() === 'sitecoreform') {
          continue;
        }

        let cmp: FEaaSExternalComponent;
        if (!component.sites?.length || component.sites.some((s) => isSameGuid(s.id, contexSiteId))) {
          cmp = {
            id: component.id,
            name: component.name,
            title: component.title,
            isExternal: true,
          };

          if (component.thumbnail) {
            const thumbnail: FEaaSComponentThumbnail = {
              url: this.sanitizer.bypassSecurityTrustUrl(component.thumbnail),
            };
            cmp.thumbnail = Promise.resolve(thumbnail);
          }
          extComponentsCollection.components.push(cmp);
        }
      }

      if (extComponentsCollection.components.length > 0) {
        externalComponentsCollections.push(extComponentsCollection);
      }
    }
    return externalComponentsCollections;
  }

  private async getThumbnail(
    component: ComponentModel,
    version?: VersionModel,
  ): Promise<FEaaSComponentThumbnail | undefined> {
    try {
      const getThumbnailPromise: Promise<FEaaSComponentThumbnail> = new Promise((resolve) => {
        this.feaas?.Thumbnail?.get(component, version, (thumbnail: HTMLImageElement | null) => {
          if (!thumbnail) {
            throw new Error('Thumbnail is not set');
          }

          resolve({
            url: this.sanitizer.bypassSecurityTrustUrl(thumbnail.src),
            height: thumbnail.height,
            width: thumbnail.width,
          });
        });
      });
      return getThumbnailPromise;
    } catch {
      return Promise.resolve(undefined);
    }
  }
}
