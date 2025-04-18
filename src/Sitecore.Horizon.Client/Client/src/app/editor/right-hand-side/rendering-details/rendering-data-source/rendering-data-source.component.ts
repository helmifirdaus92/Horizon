/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, Input, OnDestroy } from '@angular/core';
import { PageDataViewComponent } from 'app/editor/lhs-panel/data-view/page-data-view/page-data-view.component';
import { LhsPanelComponent } from 'app/editor/lhs-panel/lhs-panel.component';
import { CanvasServices } from 'app/editor/shared/canvas.services';
import { PersonalizationLayoutService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.layout.service';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { DatasourceDialogService } from 'app/shared/dialogs/datasource-dialog/datasource-dialog.service';
import { BaseItemDalService } from 'app/shared/graphql/item.dal.service';
import { RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { isSameGuid, isSameItemVersion } from 'app/shared/utils/utils';
import { BehaviorSubject, map } from 'rxjs';
import { AbTestInfo } from '../../editor-rhs.component';

@Component({
  selector: 'app-rendering-data-source',
  templateUrl: './rendering-data-source.component.html',
  styleUrl: './rendering-data-source.component.scss',
})
export class RenderingDataSourceComponent implements OnDestroy {
  private readonly lifetime = new Lifetime();
  _displayName$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  displayName$ = this._displayName$.asObservable();
  usesPageItemAsDataSource = false;

  @Input() abTest?: AbTestInfo;
  private _chrome: RenderingChromeInfo;
  @Input() set chrome(value: RenderingChromeInfo) {
    if (!value || isSameItemVersion(value.contextItem, this._chrome?.contextItem)) {
      return;
    }

    this._chrome = value;
    this.init();
  }

  get chrome(): RenderingChromeInfo {
    return this._chrome;
  }

  constructor(
    private readonly contextService: ContextService,
    private readonly itemDalService: BaseItemDalService,
    private readonly personalizationLayoutService: PersonalizationLayoutService,
    private readonly datasourceDialogService: DatasourceDialogService,
    private readonly canvasServices: CanvasServices,
    private readonly personalizationService: PersonalizationService,
  ) {}

  init() {
    this.usesPageItemAsDataSource = isSameGuid(this._chrome.contextItem.id, this.contextService.itemId);
    const item = this._chrome.contextItem;
    this.setDisplayName(item.id, item.language, item.version);
  }
  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  openPageContent() {
    LhsPanelComponent.show(PageDataViewComponent);
  }

  async selectDataSource() {
    const isDefaultVariant = !this.contextService.variant;
    const rendering = this.canvasServices.getCurrentLayout().getRendering(this.chrome.renderingInstanceId);
    this.datasourceDialogService
      .show({
        renderingId: this.chrome.renderingDefinitionId,
        select: await this.getDataSourceFromLayout(),
        renderingDetails: {
          instanceId: rendering.instanceId,
          parameters: rendering.parameters,
          placeholderKey: rendering.placeholderKey,
        },
        mode: isDefaultVariant ? 'ChangeDatasource' : 'Personalize',
      })
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe((dataSourceSelect) => {
        this.setDataSource(dataSourceSelect.layoutRecord);
        this.setDisplayName(dataSourceSelect.itemId, this.contextService.language);
      });
  }

  private setDisplayName(id: string, language: string, version?: number) {
    const site = this.contextService.siteName;
    this.itemDalService
      .getItem(id, language, site, version)
      .pipe(
        map((item) => item.displayName),
        takeWhileAlive(this.lifetime),
      )
      .subscribe((value) => this._displayName$.next(value));
  }

  private async getDataSourceFromLayout() {
    const dataSourceFromRule = await this.personalizationLayoutService.getPersonalizedRenderingDataSource(
      this.chrome.renderingInstanceId,
      this.contextService.variant,
    );
    const defaultDataSource = this.canvasServices
      .getCurrentLayout()
      .getRendering(this.chrome.renderingInstanceId).dataSource;
    return dataSourceFromRule ?? defaultDataSource ?? undefined;
  }

  private setDataSource(dataSource: string) {
    if (!this.contextService.variant) {
      this.setDefaultDataSource(dataSource);
      return;
    }

    if (this.personalizationService.getIsInPersonalizationMode()) {
      this.setPersonalizedDataSource(dataSource);
      return;
    }

    if (this.abTest) {
      this.setAbTestDataSource(dataSource);
      return;
    }

    // set default datasource when component doesn't have AB test and not in a personalization mode
    // but variant is defined: some other component on a page has AB test and non default variant is selected there
    this.setDefaultDataSource(dataSource);
  }

  private setDefaultDataSource(dataSourceItemId: string) {
    this.canvasServices
      .getCurrentLayout()
      .updateRenderings([
        { renderingInstanceId: this.chrome.renderingInstanceId, update: { dataSource: dataSourceItemId } },
      ]);
  }

  private setPersonalizedDataSource(dataSourceItemId: string) {
    this.personalizationLayoutService.addSetDataSourcePersonalizationRule(
      this.chrome.renderingInstanceId,
      this.contextService.variant,
      dataSourceItemId,
    );
  }

  private async setAbTestDataSource(dataSourceItemId: string) {
    const contextVariantRuleInfo = await this.personalizationLayoutService.getPersonalizedRenderingInfo(
      this.chrome.renderingInstanceId,
      this.contextService.variant,
    );
    const testUsesContextVariant =
      contextVariantRuleInfo?.dataSource ||
      contextVariantRuleInfo?.renderingId ||
      contextVariantRuleInfo?.renderingParameters;
    if (testUsesContextVariant) {
      this.setPersonalizedDataSource(dataSourceItemId);
    } else {
      this.setDefaultDataSource(dataSourceItemId);
    }
  }
}
