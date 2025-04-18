/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { LoggingService } from 'app/shared/logging.service';
import { convertToNestedTree, retrieveParentHierarchy } from 'app/shared/utils/tree.utils';
import { normalizeGuid } from 'app/shared/utils/utils';
import { BehaviorSubject, EMPTY, Observable, Subject, combineLatest, merge, of, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import { DatasourcePickerOptions } from 'sdk';
import { ContextMenuState, NodeChangeEvent, TreeNode } from '../../../shared/item-tree/item-tree.component';
import { ContextMenuActionInvoke } from './context-menu/datasource-picker-context-menu.component';
import { DatasourcePickerService } from './datasource-picker.service';
import { TemplatePickerResult } from './datasource-template-picker/datasource-template-picker.component';
import { RawItem, RawItemAncestor, RenderingDefinition } from './datasource.dal.service';

export const VIRTUAL_PAGE_TEMPLATE_ID = '83754CB5-0447-4022-906D-BB36718AD183';
export const PAGE_RELATIVE_PATH = 'page:';
export interface DataSourcePickerSelect {
  id: string;
  path: string;
  isCompatible: boolean;
  templateId?: string;
  parent?: ParentItemHierarchy;
}

export interface ParentItemHierarchy {
  id: string;
  template: { id: string; baseTemplateIds: string[] };
  parent?: ParentItemHierarchy;
}

interface TemplatePickerViewContext {
  showPicker: boolean;
  node: TreeNode | undefined;
}

function addTempItemToTree(parentId: string, tempItem: RawItem, tree: RawItemAncestor[]): RawItemAncestor[] {
  let parentHasFoundFlag = false;

  const treeWithInsertedItem = tree.map((item: any) => {
    if (parentHasFoundFlag) {
      return item;
    }

    if (normalizeGuid(item.id) === normalizeGuid(parentId)) {
      const updatedItem: RawItem = {
        id: item.id,
        path: item.path,
        displayName: item.displayName,
        hasChildren: true,
        isFolder: item.isFolder,
        template: item.template,
        children: [...[tempItem], ...(item.children || [])],
      };

      parentHasFoundFlag = true;

      return updatedItem;
    }

    if (item.children) {
      item.children = addTempItemToTree(parentId, tempItem, item.children);
    }

    return item;
  });

  return treeWithInsertedItem;
}

@Component({
  selector: 'app-datasource-picker',
  templateUrl: './datasource-picker.component.html',
  styleUrls: ['./datasource-picker.component.scss'],
  providers: [DatasourcePickerService],
})
export class DatasourcePickerComponent implements OnInit {
  @Input() renderingId$: Observable<string> = EMPTY;
  @Input() rawDatasource$: Observable<string> = EMPTY;
  @Input() datasourcePickerOptions?: DatasourcePickerOptions;

  @Output() readonly selectChange = new EventEmitter<DataSourcePickerSelect | null>();

  readonly select$ = new BehaviorSubject<DataSourcePickerSelect | null>(null);

  data$: Observable<TreeNode[]> = EMPTY;
  private _data: TreeNode[] = [];
  canCreate$: Observable<boolean> = EMPTY;
  datasource$: Observable<string> = EMPTY;
  private selectItemId$ = new Subject<string>();
  renderingDefinition$: Observable<RenderingDefinition> = EMPTY;
  hasScroll = false;
  contextMenuIsActive?: ContextMenuState;

  private transaction: {
    tempItemToAdd: RawItem;
    selectId: string;
  } | null = null;

  private compatibleTemplateIds$: Observable<string[]> = EMPTY;
  private contentRootItemId$: Observable<string> = EMPTY;
  templatePickerContext: TemplatePickerViewContext = {
    showPicker: false,
    node: undefined,
  };

  readonly getChildren = (node: TreeNode) => this._getChildren(node);

  // This property is used by datasource-dialog.component
  get isBusy(): boolean {
    return !!this.transaction;
  }

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly logger: LoggingService,
    private readonly datasourcePickerService: DatasourcePickerService,
  ) {}

  ngOnInit() {
    this.renderingDefinition$ = this.renderingId$.pipe(
      switchMap((renderingId$) => this.datasourcePickerService.getRenderingDefinition(renderingId$)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.compatibleTemplateIds$ = this.getCompatibleTemplates();

    this.contentRootItemId$ = this.configurationService.configuration$.pipe(
      map(({ contentRootItemId }) => contentRootItemId),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.datasource$ = merge(
      this.selectItemId$,
      this.rawDatasource$.pipe(
        switchMap((ds) =>
          ds && ds !== PAGE_RELATIVE_PATH
            ? this.datasourcePickerService.resolveDatasource(ds).pipe(
                map((p) => p.id),
                catchError((ex) => {
                  if (ex === 'InvalidDataSource') {
                    return of('');
                  }

                  return throwError(() => ex);
                }),
              )
            : of(ds),
        ),
      ),
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));

    this.updateTree();

    this.canCreate$ = combineLatest([this.select$, this.datasource$]).pipe(
      map(([select, renderingId$]) => !!select || !!renderingId$),
    );
  }

  storeScroll(event: Event) {
    this.hasScroll = (event.target as HTMLElement).scrollTop > 0;
  }

  onSelect(_select: TreeNode) {
    const parent = retrieveParentHierarchy(this._data, _select.id);
    const select: DataSourcePickerSelect = {
      id: _select.id,
      path: _select.path ?? '',
      isCompatible: !!_select.isCompatible,
      templateId: _select.template?.id,
      parent,
    };

    this.select$.next(select);
    this.selectChange.emit(select);
  }

  async handleContextMenuActionInvoke(action: ContextMenuActionInvoke) {
    switch (action.actionType) {
      case 'CreateNew': {
        this.showTemplatePicker(action.node);
        break;
      }
      case 'Duplicate': {
        const newName = await this.datasourcePickerService.handleDuplicateName(action.node.displayName);

        this.datasourcePickerService.duplicateItem(action.node.id, newName).subscribe((item) => {
          if (!item) {
            return;
          }

          this.updateTree(item.id);
        });

        break;
      }
    }
  }

  handleContextMenuState(action: ContextMenuState) {
    this.contextMenuIsActive = action;
  }

  showTemplatePicker(node: TreeNode) {
    this.templatePickerContext = { showPicker: true, node };
  }

  handleTemplatePickerResult(result: TemplatePickerResult) {
    this.templatePickerContext.showPicker = false;
    if (result.kind === 'OK' && this.templatePickerContext.node?.id) {
      this.addTempItem(result.templateId, this.templatePickerContext.node.id);
    }
  }

  nodeChange(event: NodeChangeEvent) {
    if (event.status === 'Canceled' || !this.transaction) {
      this.updateTree(this.transaction?.selectId);
      this.transaction = null;

      return;
    }

    this.datasourcePickerService
      .createRawItem(this.transaction.selectId, event.node.displayName, this.transaction.tempItemToAdd.template.id)
      .pipe(
        catchError(async (errorCode) => {
          this.logger.warn(`Create failed for item "${event.node.displayName}" with code: ${errorCode}`);
          this.datasourcePickerService.showNotificationForCreationFailed(errorCode, event.node.displayName);
          return null;
        }),
      )
      .subscribe((item) => {
        if (!item) {
          this.updateTree(this.transaction?.selectId);
          this.transaction = null;
          this.selectChange.emit(null);

          return;
        }

        this.updateTree(item.id);
        this.transaction = null;
      });
  }

  private getCompatibleTemplates(): Observable<string[]> {
    if (this.datasourcePickerOptions?.compatibleTemplateIds.length) {
      return of(this.datasourcePickerOptions?.compatibleTemplateIds);
    }
    return this.renderingDefinition$.pipe(
      map(({ templates }) => templates.map((template) => template.id)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

  private updateTree(selectId?: string) {
    if (selectId) {
      this.selectItemId$.next(selectId);
    }

    const rawTree = this.fetchRawTreeData(this.datasource$);
    this.data$ = this.initTree(rawTree);
  }

  private fetchRawTreeData(selectId: Observable<string>): Observable<RawItemAncestor[]> {
    return combineLatest([
      this.renderingDefinition$,
      selectId,
      this.contentRootItemId$,
      this.compatibleTemplateIds$,
    ]).pipe(
      switchMap(([{ datasourceRootItems }, datasource, contentRootItemId, compatibleTemplateIds]) => {
        const roots = datasourceRootItems.map((value) => value.id);
        const defaultDataSource = this.resolveDefaultDatasourceRoot(datasourceRootItems, contentRootItemId);
        // Either a datasource is selected or fallback to a default
        const datasourceOrDefault = datasource || defaultDataSource;

        return this.datasourcePickerService.fetchFlatTree(datasourceOrDefault, compatibleTemplateIds, roots).pipe(
          catchError((ex) => {
            if (ex === 'ItemNotFound' || ex === 'RootNotReachable') {
              return this.datasourcePickerService.fetchFlatTree(defaultDataSource, compatibleTemplateIds, roots);
            }

            return throwError(() => ex);
          }),
          map((data) => data.filter((item) => item.id !== contentRootItemId)),
        );
      }),
      map((data) => convertToNestedTree(data)),
    );
  }

  private initTree(rawData$: Observable<RawItemAncestor[]>): Observable<TreeNode[]> {
    return rawData$.pipe(
      withLatestFrom(this.compatibleTemplateIds$),
      map(([rawData, templateIds]) =>
        rawData.map((item) =>
          this.datasourcePickerService.mapTreeFromRawItemToTreeNode(item, templateIds.length === 0),
        ),
      ),
      map((treeData) => {
        return treeData.map((root) => {
          root.isRoot = true;
          return root;
        });
      }),
      tap((data) => (this._data = data)),
    );
  }

  private _getChildren({ id, children, hasChildren }: TreeNode): Observable<TreeNode[]> | TreeNode[] {
    if (!hasChildren) {
      return [];
    }

    if (!!children) {
      return children;
    }

    return this.datasourcePickerService.fetchChildren(id, this.compatibleTemplateIds$);
  }

  private resolveDefaultDatasourceRoot(rootIds: ReadonlyArray<{ id: string }>, contentRootItemId: string): string {
    return rootIds && rootIds[0] ? rootIds[0].id : contentRootItemId;
  }

  private async addTempItem(templateId: string, parentId: string) {
    const tempItemToAdd: RawItem = await this.datasourcePickerService.generateDraftRawItem(templateId);

    const rawData$ = this.fetchRawTreeData(of(parentId)).pipe(
      map((rawData) => addTempItemToTree(parentId, tempItemToAdd, rawData)),
    );

    this.transaction = {
      tempItemToAdd,
      selectId: parentId,
    };

    this.selectItemId$.next(tempItemToAdd.id);
    this.data$ = this.initTree(rawData$);
  }
}
