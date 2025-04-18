/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { DialogOverlayService, PopoverDirective } from '@sitecore/ng-spd-lib';
import { PageDataViewComponent } from 'app/editor/lhs-panel/data-view/page-data-view/page-data-view.component';
import { LhsPanelComponent } from 'app/editor/lhs-panel/lhs-panel.component';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { CreateFolderService } from 'app/pages/left-hand-side/create-page/create-folder.service';
import { TemplateSelectionDialogService } from 'app/pages/left-hand-side/create-page/template-selection-dialog/template-selection-dialog.service';
import { PageSettingsDialogComponent } from 'app/pages/page-settings/page-settings-dialog.component';
import { ContextService } from 'app/shared/client-state/context.service';
import { ConfigurationService } from 'app/shared/configuration/configuration.service';
import { StaticConfigurationService } from 'app/shared/configuration/static-configuration.service';
import { ErrorDialogComponent } from 'app/shared/dialogs/error-dialog/error-dialog.component';
import { WarningDialogComponent } from 'app/shared/dialogs/warning-dialog/warning-dialog.component';
import { SiteService } from 'app/shared/site-language/site-language.service';
import { getExplorerAppUrl, isSameGuid } from 'app/shared/utils/utils';
import { firstValueFrom } from 'rxjs';
import { ContentTreeNode } from '../content-tree-node';
import { ContentTreeService } from '../content-tree.service';

@Component({
  selector: 'app-content-tree-context',
  templateUrl: './content-tree-context.component.html',
  styleUrls: ['./content-tree-context.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentTreeContextComponent {
  get canCreate(): boolean {
    return this.node.permissions.canCreate;
  }

  get canRename(): boolean {
    return this.node.permissions.canRename;
  }

  get canCreateSameLevel(): boolean {
    return !!this.node.parent && this.node.parent.permissions.canCreate;
  }

  get canDelete(): boolean {
    return this.node.permissions.canDelete;
  }

  get isLocked(): boolean {
    return this.node.locking.isLocked;
  }

  get isLockedByCurrentUser(): boolean {
    return this.node.locking.lockedByCurrentUser;
  }

  get explorerUrl(): SafeUrl {
    const baseUrl = this.staticConfigurationService.explorerAppBaseUrl;
    return this.domSanitizer.bypassSecurityTrustUrl(
      getExplorerAppUrl(baseUrl, this.contextService.siteName, this.contextService.language, this.node.id),
    );
  }

  @Input() node = ContentTreeNode.createEmpty();
  @Input() isSelectedNode = false;
  @Input() rootNodesIds: string[] = [];

  @Output() readonly createVersionChange = new EventEmitter<ContentTreeNode>();

  @ViewChild('popoverInstance', { static: true }) private popoverInstance?: PopoverDirective;

  readonly popoverIsActive = (): boolean | undefined => this.popoverInstance?.isPopoverVisible();
  isFeatureEnabled = () => this.featureFlagService.isFeatureEnabled('pages_context-panel-field-editing');

  constructor(
    private readonly dialogService: DialogOverlayService,
    private readonly contentTreeService: ContentTreeService,
    private readonly createFolderService: CreateFolderService,
    private readonly translateService: TranslateService,
    private readonly templateSelectionDialogService: TemplateSelectionDialogService,
    private readonly domSanitizer: DomSanitizer,
    private readonly staticConfigurationService: StaticConfigurationService,
    private readonly contextService: ContextService,
    private readonly siteService: SiteService,
    private readonly configurationService: ConfigurationService,
    private readonly featureFlagService: FeatureFlagsService,
  ) {}

  async createPage() {
    await firstValueFrom(this.templateSelectionDialogService.show(this.node.id, this.node.text));
  }

  async createPageSameLevel() {
    const parent = this.node.parent;

    if (parent) {
      await firstValueFrom(this.templateSelectionDialogService.show(parent.id, parent.text));
    }
  }

  duplicatePage() {
    const parent = this.node.parent;

    if (parent) {
      this.contentTreeService.addTempDuplicatedItem(
        this.node.id,
        this.node.text,
        this.node.isFolder,
        parent.id,
        this.node.hasChildren,
      );
    }
  }

  createFolder() {
    this.createFolderService.startCreateOperation(this.node.id);
  }

  openPageSettingsDialog(targetItemId: string): void {
    if (!isSameGuid(this.contextService.itemId, targetItemId)) {
      this.contextService.updateContext({ itemId: targetItemId });
    }
    LhsPanelComponent.show(PageSettingsDialogComponent);
  }

  openPageFieldEditingPanel(targetItemId: string) {
    if (!isSameGuid(this.contextService.itemId, targetItemId)) {
      this.contextService.updateContext({ itemId: targetItemId });
    }
    LhsPanelComponent.show(PageDataViewComponent);
    LhsPanelComponent.HasExpand = true;
  }

  isStartItem(): boolean {
    const sites = this.siteService.getSites();
    const nodeId = this.node.id;
    return sites.some((site) => isSameGuid(site.startItemId, nodeId));
  }

  isLastRootItem(): boolean {
    return this.rootNodesIds.length <= 1 && isSameGuid(this.node.id, this.rootNodesIds[0]);
  }

  async promptDelete() {
    const { component: dialog } = WarningDialogComponent.show(this.dialogService);

    dialog.title = await firstValueFrom(this.translateService.get('EDITOR.DELETE_ITEM.DIALOG_HEADER'));
    const item = this.node;
    const itemText = item.text;
    if (item.hasChildren) {
      dialog.text = await firstValueFrom(
        this.translateService.get('EDITOR.DELETE_ITEM.PROMPT_CONFIRM_DELETE_WITH_CHILDREN', { itemText }),
      );
    } else {
      dialog.text = await firstValueFrom(
        this.translateService.get('EDITOR.DELETE_ITEM.PROMPT_CONFIRM_DELETE', { itemText }),
      );
    }
    dialog.declineText = await firstValueFrom(this.translateService.get('COMMON.CANCEL'));
    dialog.confirmText = await firstValueFrom(this.translateService.get('COMMON.DELETE'));

    dialog.dialogResultEvent.subscribe((result) => {
      if (result.confirmed) {
        this.deleteItemAndRemoveParentReference(item);
      }
    });
  }

  private async deleteItemAndRemoveParentReference(item: ContentTreeNode) {
    const errorText = await firstValueFrom(this.translateService.get('EDITOR.DELETE_ITEM.ERRORS.DELETE_FAIL'));

    const result = this.configurationService.isDeleteItemContextFieldsAvailable()
      ? this.contentTreeService.deleteItem(item.id, this.contextService.siteName, this.contextService.language)
      : this.contentTreeService.deleteItem(item.id);

    result.subscribe({
      next: () => {},
      error: (error) => {
        this.showError(error.message, errorText);
      },
    });
  }

  private showError(message: string, title: string) {
    const { component } = ErrorDialogComponent.show(this.dialogService);

    component.title = title;
    component.text = message;
  }
}
