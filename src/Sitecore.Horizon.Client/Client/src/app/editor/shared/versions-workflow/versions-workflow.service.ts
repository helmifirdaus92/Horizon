/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Injectable } from '@angular/core';
import { Context, ContextService } from 'app/shared/client-state/context.service';
import { ItemChangeService } from 'app/shared/client-state/item-change-service';
import { Item } from 'app/shared/graphql/item.interface';
import { replayWhen, shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { BehaviorSubject, filter, firstValueFrom, map, Observable, switchMap, tap } from 'rxjs';
import { BaseVersionsDalService } from './versions.dal.service';
import { BaseWorkflowDalService, ExecuteWorkflowCommandOutput } from './workflow.dal.service';

export interface VersionsInfo {
  versions: VersionDetails[];
  permissions: {
    canWrite: boolean;
    canDelete: boolean;
    canPublish: boolean;
  };
}

export interface VersionDetails {
  versionNumber: number;
  name: string;
  lastModifiedBy: string;
  lastModifiedAt: string;
  validFrom: string;
  validTo: string;
  isAvailableToPublish: boolean;
  workflowState: string;
  isLatestPublishableVersion: boolean;
}

export type ItemWithVersionDetails = Omit<Item, 'versions'> & { versions: VersionDetails[] };

export function fromItemVersionsToVersionsDetails(item: Item): ItemWithVersionDetails {
  return {
    ...item,
    ...{
      versions: [...item.versions].map((itemVersion) => {
        return {
          versionNumber: itemVersion.version,
          name: itemVersion.versionName,
          lastModifiedBy: itemVersion.updatedBy,
          lastModifiedAt: itemVersion.updatedDate,
          validFrom: itemVersion.publishing.validFromDate,
          validTo: itemVersion.publishing.validToDate,
          isAvailableToPublish: itemVersion.publishing.isAvailableToPublish,
          workflowState: itemVersion.workflow?.displayName ?? '',
          isLatestPublishableVersion: itemVersion.isLatestPublishableVersion,
        };
      }),
    },
  };
}

export function fromVersionsToActiveVersion(
  versions: VersionDetails[],
  contextItemVersion?: number,
): VersionDetails | undefined {
  return versions.filter((version: VersionDetails) => version.versionNumber === contextItemVersion)[0];
}

@Injectable({ providedIn: 'root' })
export class VersionsWorkflowService {
  private allVersionsInfoAndWorkflowChange$: Observable<ItemWithVersionDetails>;
  private versionsLoading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private readonly versionsDalService: BaseVersionsDalService,
    private readonly context: ContextService,
    private readonly itemChangeService: ItemChangeService,
    private readonly workflowDalService: BaseWorkflowDalService,
  ) {
    this.allVersionsInfoAndWorkflowChange$ = this.context.value$.pipe(
      replayWhen((_context) =>
        this.itemChangeService.watchForChanges({ itemId: _context.itemId, scopes: ['versions', 'workflow'] }),
      ),
      tap(() => this.versionsLoading$.next(true)),
      // When user switches via LHS tree it updates context without the item version,
      // so, it produces the first emission without the item version and then with the one
      // so that, we skip the first emission
      filter((val) => !!val.itemVersion),
      switchMap((_context) => this.context.getItem()),
      map(fromItemVersionsToVersionsDetails),
      tap(() => this.versionsLoading$.next(false)),
    );
  }

  watchVersionsAndWorkflow(): Observable<ItemWithVersionDetails> {
    return this.allVersionsInfoAndWorkflowChange$.pipe(shareReplayLatest());
  }

  watchActiveVersion(): Observable<VersionDetails | undefined> {
    return this.allVersionsInfoAndWorkflowChange$.pipe(
      map((item) => item.versions),
      map((versions) => versions.filter((version) => version.versionNumber === this.context.itemVersion)[0]),
      shareReplayLatest(),
    );
  }

  watchVersionsLoading(): Observable<boolean> {
    return this.versionsLoading$.asObservable().pipe(shareReplayLatest());
  }

  createVersion(
    path: string,
    language: string,
    siteName: string,
    versionName?: string,
    baseVersionNumber?: number,
  ): Observable<{ success: boolean; itemVersion?: number }> {
    this.versionsLoading$.next(true);

    return this.versionsDalService
      .addItemVersion({
        path,
        language,
        siteName,
        versionName,
        baseVersionNumber,
      })
      .pipe(tap(() => this.versionsLoading$.next(false)));
  }

  renameVersion(
    path: string,
    versionNumber: number,
    newName: string,
    language: string,
    siteName: string,
  ): Observable<{ success: boolean }> {
    this.versionsLoading$.next(true);

    return this.versionsDalService
      .renameItemVersion({
        path,
        versionNumber,
        newName,
        language,
        siteName,
      })
      .pipe(tap(() => this.versionsLoading$.next(false)));
  }

  removeVersion(
    path: string,
    language: string,
    siteName: string,
    versionNumber: number,
  ): Observable<{ success: boolean; latestPublishableVersion?: number }> {
    this.versionsLoading$.next(true);

    return this.versionsDalService
      .deleteItemVersion({
        path,
        versionNumber,
        language,
        siteName,
      })
      .pipe(tap(() => this.versionsLoading$.next(false)));
  }

  setPublishingSettings(
    path: string,
    versionNumber: number,
    validFromDate: string,
    validToDate: string,
    isAvailableToPublish: boolean,
    language: string,
    siteName: string,
  ): Observable<{ success: boolean }> {
    this.versionsLoading$.next(true);

    return this.versionsDalService
      .setPublishingSettings({
        path,
        versionNumber,
        validFromDate,
        validToDate,
        isAvailableToPublish,
        language,
        siteName,
      })
      .pipe(tap(() => this.versionsLoading$.next(false)));
  }

  async executeCommand(
    commandId: string,
    comments: string,
    context: Context,
  ): Promise<ExecuteWorkflowCommandOutput | undefined> {
    return firstValueFrom(
      this.workflowDalService.executeCommand(commandId, comments, context).pipe(
        tap((response) => {
          if (response && response.completed) {
            this.itemChangeService.notifyChange(context.itemId, ['workflow', 'versions']);
          }
        }),
      ),
    ).catch(() => undefined);
  }
}
