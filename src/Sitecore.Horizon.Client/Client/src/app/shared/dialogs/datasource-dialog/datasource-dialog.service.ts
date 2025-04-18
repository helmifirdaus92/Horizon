/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { NgCommandManager } from '@sitecore/ng-page-composer';
import { DialogOverlayService } from '@sitecore/ng-spd-lib';
import { ContextService } from 'app/shared/client-state/context.service';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { asObservable, MaybeObservable, shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { isSameGuid } from 'app/shared/utils/utils';
import { combineLatest, EMPTY, from, Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import {
  DatasourceDialogCommands,
  DatasourceDialogMode,
  DatasourcePickerOptions,
  RenderingDatasourceDetails,
} from 'sdk';
import { DataSourcePickerSelect } from '../datasource-picker/datasource-picker.component';
import { DatasourceDialogComponent } from './datasource-dialog.component';

export const LocalDataFolderTemplateId = '1c82e550-ebcd-4e5d-8abd-d50d0809541e';
export const LocalDataSourcePrefix = 'local:';

export interface DatasourceRenderingDetails {
  instanceId?: string;
  parameters?: Record<string, string>;
  placeholderKey?: string;
}

export interface PageDatasource {
  itemId: string;
  layoutRecord: string;
}

@Injectable({ providedIn: 'root' })
export class DatasourceDialogService {
  constructor(
    private readonly overlayService: DialogOverlayService,
    private readonly commandManager: NgCommandManager<DatasourceDialogCommands>,
    private readonly contextService: ContextService,
    private readonly siteService: SiteService,
  ) {}

  show(
    {
      renderingId,
      select,
      renderingDetails,
      mode,
    }: {
      renderingId: MaybeObservable<string>;
      select?: MaybeObservable<string>;
      renderingDetails?: MaybeObservable<DatasourceRenderingDetails>;
      mode: DatasourceDialogMode;
    },
    options?: DatasourcePickerOptions,
  ): Observable<PageDatasource> {
    const renderingId$ = asObservable(renderingId).pipe(shareReplayLatest());
    const initialSelect$ = asObservable(select || '').pipe(shareReplayLatest());
    const renderingDetails$ = asObservable(renderingDetails).pipe(shareReplayLatest());

    return combineLatest([renderingId$, initialSelect$, renderingDetails$]).pipe(
      take(1),
      switchMap(([_renderingId, _initialSelect, _renderingDetails]) =>
        this.hookBeforeShow({
          renderingId: _renderingId,
          dataSource: _initialSelect || null,
          compatibleTemplateIds: options?.compatibleTemplateIds ?? [],
          renderingDetails: _renderingDetails,
          pipelineArgs: { aborted: false, mode, customParameters: options?.customParameters },
        }).pipe(
          switchMap((updatedContext) => {
            if (updatedContext.pipelineArgs.aborted) {
              return EMPTY;
            }

            const dialog = this.overlayService.open(DatasourceDialogComponent, {
              size: 'FixedLarge',
            });

            if (updatedContext.compatibleTemplateIds.length > 0) {
              options = {
                ...options,
                compatibleTemplateIds: updatedContext.compatibleTemplateIds,
              };
            }

            // Normalize supported option types to always pass `Observable` to the component.
            dialog.component.renderingId$ = renderingId$;
            dialog.component.initialSelect$ = initialSelect$;
            dialog.component.datasourcePickerOptions = options;
            return dialog.component.onSelect;
          }),
          switchMap((result) => this.enrichWithLocalDatasourceInfo(result)),
        ),
      ),
    );
  }

  private async enrichWithLocalDatasourceInfo(selection: DataSourcePickerSelect): Promise<PageDatasource> {
    return {
      itemId: selection.id,
      layoutRecord: (await this.getLocalDatasource(selection)) ?? selection.id,
    };
  }

  private async getLocalDatasource(selection: DataSourcePickerSelect): Promise<string | null> {
    const site = this.siteService.getContextSite();
    if (!site.properties.isSxaSite || !site.properties.isLocalDatasourcesEnabled) {
      return null;
    }

    let hasDataParentFolder: boolean = false;
    let parent = selection.parent;
    while (parent) {
      if (
        isSameGuid(parent.template.id, LocalDataFolderTemplateId) ||
        parent.template.baseTemplateIds.some((id) => isSameGuid(id, LocalDataFolderTemplateId))
      ) {
        hasDataParentFolder = true;
        break;
      }
      parent = parent.parent;
    }
    if (!hasDataParentFolder) {
      return null;
    }

    const contextItemPath = (await this.contextService.getItem()).path.toLowerCase();
    if (!selection.path.toLowerCase().startsWith(contextItemPath)) {
      return null;
    }

    const relativeDsPath = selection.path.substring(contextItemPath.length);
    return LocalDataSourcePrefix + relativeDsPath;
  }

  private hookBeforeShow(context: RenderingDatasourceDetails): Observable<RenderingDatasourceDetails> {
    return from(this.commandManager.invoke('pages:editor:datasource:dialog:show', context));
  }
}
