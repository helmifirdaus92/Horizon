/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Inject, Injectable } from '@angular/core';
import { FeatureFlags } from 'app/feature-flags/feature-flags.types';
import { filter, firstValueFrom, map, Observable, of, ReplaySubject, startWith, switchMap } from 'rxjs';
import { RenderingHostConfig, RenderingHostConfigDalService } from './rendering-host-config.dal.service';
import { RH_FEATURE_DEFINITIONS, RHFeatureDefinition, RHFeatureKeys } from './rendering-host-features';
import { RenderingHostResolverService } from './rendering-host-resolver.service';

export interface RHConfigState {
  isLoading: boolean;
  isFailed: boolean;
  config: RenderingHostConfig | null;
}

@Injectable({
  providedIn: 'root',
})
export class RenderingHostFeaturesService {
  private readonly renderingHostConfigState$ = new ReplaySubject<RHConfigState>(1);

  constructor(
    private readonly renderingHostConfigService: RenderingHostConfigDalService,
    private readonly renderingHostResolverService: RenderingHostResolverService,
    @Inject(RH_FEATURE_DEFINITIONS) private readonly renderingHostFeatureDefinitions: RHFeatureDefinition[],
  ) {
    this.renderingHostResolverService.hostUrl$
      .pipe(switchMap((rhUrl) => this.getRHConfigEventually(rhUrl)))
      .subscribe(this.renderingHostConfigState$);
  }

  watchFeatureEnabled(featureName: RHFeatureKeys): Observable<{ enabled: boolean; loading: boolean }> {
    const featureDef = this.renderingHostFeatureDefinitions.find((def) => def.name === featureName);
    if (!featureDef) {
      return of({ enabled: false, loading: false });
    }

    return this.renderingHostConfigState$.pipe(map((state) => this.evaluateFeatureDef(featureDef, state)));
  }

  isFeatureEnabled(featureName: RHFeatureKeys): Promise<boolean> {
    return firstValueFrom(
      this.watchFeatureEnabled(featureName).pipe(
        filter((f) => !f.loading),
        map((f) => f.enabled),
      ),
    );
  }

  watchFeaturesLoading(): Observable<boolean> {
    return this.renderingHostConfigState$.pipe(map((state) => state.isLoading));
  }

  watchComponents(): Observable<{ components: string[]; bypass: boolean }> {
    return this.renderingHostConfigState$.pipe(
      filter((state) => !state.isLoading),
      map((state) => {
        if (state.isFailed) {
          return {
            components: [],
            bypass: true,
          };
        }

        return {
          components: state.config?.components ?? [],
          bypass: false,
        };
      }),
    );
  }

  getFeatureFlags(): Promise<FeatureFlags[]> {
    return firstValueFrom(
      this.renderingHostConfigState$.pipe(
        filter((state) => !state.isLoading),
        map((state) =>
          this.renderingHostFeatureDefinitions.map((def) => ({
            name: def.name,
            enabled: this.evaluateFeatureDef(def, state).enabled,
          })),
        ),
      ),
    );
  }

  private evaluateFeatureDef(
    featureDef: RHFeatureDefinition,
    state: RHConfigState,
  ): { enabled: boolean; loading: boolean } {
    if (state.isLoading) {
      return { enabled: featureDef.fallback ?? false, loading: true };
    }

    if (state.isFailed) {
      return { enabled: featureDef.fallback ?? false, loading: false };
    }

    return { enabled: featureDef.enabled(state.config ?? { components: [], packages: {} }), loading: false };
  }

  private getRHConfigEventually(renderingHostUrl: string | undefined): Observable<RHConfigState> {
    return this.renderingHostConfigService.getRenderingHostConfig(renderingHostUrl).pipe(
      map((response) => ({
        isLoading: false,
        isFailed: response.apiIsBroken || response.requestIsInvalid || !response.data,
        config: response.data,
      })),
      startWith({ isLoading: true, isFailed: false, config: null }),
    );
  }
}
