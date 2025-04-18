/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { PopoverDirective, SearchInputComponent } from '@sitecore/ng-spd-lib';
import { DragndropService } from 'app/editor/designing/dragndrop.service';
import { EditorWorkspaceService } from 'app/editor/editor-workspace/editor-workspace.service';
import {
  BYOC_RENDERING_ID,
  FEAAS_RENDERING_ID,
} from 'app/editor/right-hand-side/feaas-rhs-region/feaas-extension-filter';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { PersonalizationService } from 'app/pages/left-hand-side/personalization/personalization-services/personalization.service';
import { pagesAnimations } from 'app/pages/pages.animations';
import { RenderingChromeInfo } from 'app/shared/messaging/horizon-canvas.contract.parts';
import { RenderingHostFeaturesService } from 'app/shared/rendering-host/rendering-host-features.service';
import { RenderingHostService } from 'app/shared/rendering-host/rendering-host.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { shareReplayLatest } from 'app/shared/utils/rxjs/rxjs-custom';
import { getJsonValueFromLocalStorage, normalizeGuid } from 'app/shared/utils/utils';
import { environment } from 'environments/environment';
import { BehaviorSubject, EMPTY, Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { FEaaSComponentsDalService } from '../feaas-components-gallery/feaas-components.dal.service';
import { FORM_WRAPPER_RENDERING_ID } from '../forms-components-gallery/form-wrapper-filter';
import { ComponentGalleryService, ComponentInfo, ComponentsResult } from './component-gallery.service';

const COMPONENT_GALLERY_ACCORDION_NAME_CONST = 'hz-acc-cg';

@Component({
  selector: 'app-component-gallery',
  templateUrl: './component-gallery.component.html',
  styleUrls: ['./component-gallery.component.scss'],
  animations: pagesAnimations,
  host: {
    '[class.mode-selectable]': 'mode == "selectable"',
  },
})
export class ComponentGalleryComponent implements OnInit, OnDestroy {
  @Input() phAllowedRenderingIds: readonly string[] = [];
  @Input() rendering?: RenderingChromeInfo;
  @Output() selectRendering = new EventEmitter<string>();
  @ViewChild('popoverInstanceRef') private popoverInstance?: PopoverDirective;

  @ViewChild('searchInput') private searchInput?: SearchInputComponent;
  @Input() set clearSearch(_val: boolean) {
    if (this.searchInput) {
      this.searchInput.searchValue = '';
      this.searchInput.onKeyup('');
    }
  }

  hasScroll = false;
  canvasIsLoading$: Observable<boolean> = EMPTY;
  fEaaSComponentsFetched = false;
  componentsResult$: Observable<ComponentsResult> = EMPTY;
  componentsSearchResult$: Observable<ComponentsResult> = EMPTY;
  hasSearchedFEaasComponents?: boolean;
  hasSearchedFormsComponents?: boolean;
  hasSearchedSxaComponents$: Observable<boolean> = EMPTY;
  selectedFeaasDataSourceIds: string[] = [];

  private readonly lifetime = new Lifetime();

  readonly defaultDimension = 22;

  isFEaaSSupportedEditingHost = false;

  private _accordionHeaderOpenList: Record<string, boolean> = getJsonValueFromLocalStorage(
    COMPONENT_GALLERY_ACCORDION_NAME_CONST,
  );
  accordionHeaderOpenList = {
    get: (key: string) => this._accordionHeaderOpenList[key],
    set: (key: string, value: boolean) => {
      this._accordionHeaderOpenList[key] = value;
      localStorage.setItem(COMPONENT_GALLERY_ACCORDION_NAME_CONST, JSON.stringify(this._accordionHeaderOpenList));
    },
  };

  private _searchString$ = new BehaviorSubject<string>('');
  normalizedSearchText$: Observable<string> = this._searchString$.pipe(
    map((searchString) => searchString.toLowerCase().trim()),
  );

  get renderFEaaSComponents(): boolean {
    return (
      !environment.feaaSDisabled &&
      this.isFEaaSSupportedEditingHost &&
      this.featureFlagsService.isFeatureEnabled('pages_fetch-feaas-components') &&
      !this.personalizationService.getIsInPersonalizationMode() &&
      (!this.phAllowedRenderingIds.length ||
        this.phAllowedRenderingIds.map((r) => normalizeGuid(r)).includes(normalizeGuid(FEAAS_RENDERING_ID)))
    );
  }

  get renderFEaaSExternalComponents(): boolean {
    return (
      !environment.feaaSDisabled &&
      this.isFEaaSSupportedEditingHost &&
      this.featureFlagsService.isFeatureEnabled('pages_fetch-feaas-external-components') &&
      !this.personalizationService.getIsInPersonalizationMode() &&
      (!this.phAllowedRenderingIds.length ||
        this.phAllowedRenderingIds.map((r) => normalizeGuid(r)).includes(normalizeGuid(BYOC_RENDERING_ID)))
    );
  }

  get mode(): 'selectable' | 'draggable' {
    return this.rendering || this.phAllowedRenderingIds.length ? 'selectable' : 'draggable';
  }

  constructor(
    private readonly componentService: ComponentGalleryService,
    private readonly editorService: EditorWorkspaceService,
    private readonly draggableService: DragndropService,
    private readonly personalizationService: PersonalizationService,
    private readonly featureFlagsService: FeatureFlagsService,
    private readonly fEaaSComponentsDalService: FEaaSComponentsDalService,
    private readonly renderingHostFeaturesService: RenderingHostFeaturesService,
    private readonly renderingHostService: RenderingHostService,
  ) {}

  async ngOnInit() {
    this.canvasIsLoading$ = this.editorService.watchCanvasLoadState().pipe(
      map((value) => value.isLoading),
      takeWhileAlive(this.lifetime),
    );

    this.renderingHostFeaturesService
      .watchFeaturesLoading()
      .pipe(takeWhileAlive(this.lifetime))
      .subscribe(async () => {
        this.isFEaaSSupportedEditingHost = await this.renderingHostService.isReactRenderingHost();
      });

    if (!this.phAllowedRenderingIds.length) {
      this.componentsResult$ = this.componentService.watchComponents();
    } else if (this.rendering && this.rendering.compatibleRenderings) {
      this.componentsResult$ = this.componentService.getCompatibleComponents(this.rendering.compatibleRenderings);
    } else {
      this.componentsResult$ = this.componentService.getPlaceholderAllowedComponents(this.phAllowedRenderingIds);
    }

    this.componentsResult$ = this.filterAvailbleRHComponents(this.componentsResult$);

    this.componentsResult$ = this.componentsSearchResult$ = combineLatest([
      this.componentsResult$,
      this.normalizedSearchText$,
    ]).pipe(
      switchMap(([componentsResult, searchString]) => {
        if (!searchString) {
          return of(componentsResult);
        } else {
          const searchedComponents = this.filterComponentsBySearchText(componentsResult, searchString);
          return of(searchedComponents);
        }
      }),
    );

    this.hasSearchedSxaComponents$ = this.componentsSearchResult$.pipe(
      map((searchedComponents) => searchedComponents.groups.length > 0 || searchedComponents.ungrouped.length > 0),
    );
  }
  readonly popoverIsActive = (): boolean | undefined => this.popoverInstance?.isPopoverVisible();

  private filterComponentsBySearchText(componentsResult: ComponentsResult, searchText: string): ComponentsResult {
    const groups = componentsResult.groups
      .map((group) => {
        if (group.title.toLowerCase().includes(searchText)) {
          return group;
        } else {
          return {
            ...group,
            components: group.components.filter(
              (component) =>
                component.displayName.toLowerCase().includes(searchText) && component.id !== FORM_WRAPPER_RENDERING_ID,
            ),
          };
        }
      })
      .filter((group) => group.components.length > 0);
    const ungrouped = componentsResult.ungrouped.filter(
      (component) =>
        component.displayName.toLowerCase().includes(searchText) && component.id !== FORM_WRAPPER_RENDERING_ID,
    );

    return { groups, ungrouped };
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  private filterAvailbleRHComponents(componentsResult$: Observable<ComponentsResult>): Observable<ComponentsResult> {
    const rhComponentsState = this.renderingHostFeaturesService.watchComponents();
    return combineLatest([componentsResult$, rhComponentsState]).pipe(
      map(([components, { components: rhComponents, bypass }]) => {
        if (bypass) {
          return components;
        }

        const allowedComponentNames = new Set(rhComponents);
        return {
          groups: components.groups.map((group) => ({
            ...group,
            components: group.components.map((component) => ({
              ...component,
              disabled: !!component.componentName && !allowedComponentNames.has(component.componentName),
            })),
          })),
          ungrouped: components.ungrouped.map((component) => ({
            ...component,
            disabled: !!component.componentName && !allowedComponentNames.has(component.componentName),
          })),
        };
      }),
      shareReplayLatest(),
    );
  }

  itemDragstart(event: DragEvent, item: ComponentInfo) {
    if (event.dataTransfer) {
      // workaround for firefox, which otherwise ignores the event.
      event.dataTransfer.setData('Text', '');
    }
    this.draggableService.dragstart(item.id);
  }

  itemDragend() {
    this.draggableService.dragend();
  }

  itemClick(renderingId: string) {
    this.selectRendering.emit(renderingId);
  }

  setFEaaSComponentsFetchedState(isFetched: boolean) {
    this.fEaaSComponentsFetched = isFetched;
  }

  onSearchValueChanged(searchValue: string): void {
    this._searchString$.next(searchValue);
  }

  setScrollState(event: Event) {
    this.hasScroll = (event.target as HTMLElement).scrollTop > 0;
  }

  async navigateToFEaaSComponents() {
    const url = (await this.fEaaSComponentsDalService.configuration).frontEndUrl;
    if (url) {
      window.open(url, '_blank');
    }
  }
}
