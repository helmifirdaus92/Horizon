/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BYOC_RENDERING_ID } from 'app/editor/right-hand-side/feaas-rhs-region/feaas-extension-filter';
import { FeatureFlagsService } from 'app/feature-flags/feature-flags.service';
import { ContextService } from 'app/shared/client-state/context.service';
import { TimedNotificationsService } from 'app/shared/notifications/timed-notifications.service';
import { RenderingHostFeaturesService } from 'app/shared/rendering-host/rendering-host-features.service';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { normalizeGuid } from 'app/shared/utils/utils';
import { environment } from 'environments/environment.dev';
import { BehaviorSubject, combineLatest, EMPTY, map, Observable, switchMap, tap } from 'rxjs';
import { DesigningService } from '../designing.service';
import { DragndropService } from '../dragndrop.service';
import { FORM_WRAPPER_RENDERING_ID } from './form-wrapper-filter';
import { FormsComponentsDalService, FormsEntity, FormsEntityResponse } from './forms-components.dal.service';
import { FormsComponentsService } from './forms-components.service';

const FORMS_COMPONENT_GALLERY_ACCORDION_NAME_CONST = 'hz-acc-frm';

@Component({
  selector: 'app-forms-components-gallery',
  templateUrl: './forms-components-gallery.component.html',
  styleUrls: ['../feaas-components-gallery/feaas-components-gallery.component.scss'],
})
export class FormsComponentsGalleryComponent implements OnInit, OnDestroy, OnChanges {
  @Input() mode: 'selectable' | 'draggable' = 'draggable';
  @Input() searchText: string | null = null;

  @Input()
  set isByocSupportedEditingHost(value: boolean) {
    this.updateFormsWrapperAvailability(value);
  }

  @Output() componentSelect = new EventEmitter<string>();
  @Output() hasFilteredComponents = new EventEmitter<boolean>();

  private thumbnailContainerHeight = 140;
  private thumbnailContainerWidth = 252;
  formsComponents$: Observable<FormsEntity[]> = EMPTY;
  filteredFormsComponents$: Observable<FormsEntity[]> = EMPTY;

  private readonly lifetime = new Lifetime();

  private _searchString$ = new BehaviorSubject<string>('');
  normalizedSearchText$ = this._searchString$.pipe(map((searchString) => searchString.toLowerCase().trim()));

  useFormWrapperComponent = false;

  private _isAccordionHeaderOpen: boolean =
    localStorage.getItem(FORMS_COMPONENT_GALLERY_ACCORDION_NAME_CONST) === 'true';

  get isAccordionHeaderOpen(): boolean {
    return this._isAccordionHeaderOpen;
  }

  set isAccordionHeaderOpen(value: boolean) {
    this._isAccordionHeaderOpen = value;
    localStorage.setItem(FORMS_COMPONENT_GALLERY_ACCORDION_NAME_CONST, value.toString());
  }

  private normalizedAllowedIds: string[] = [];
  get isFormWrapperComponentAllowed(): boolean {
    return this.normalizedAllowedIds.includes(
      normalizeGuid(this.useFormWrapperComponent ? FORM_WRAPPER_RENDERING_ID : BYOC_RENDERING_ID),
    );
  }

  constructor(
    private readonly formsComponentDalService: FormsComponentsDalService,
    private readonly contextService: ContextService,
    private readonly draggableService: DragndropService,
    private readonly formsComponentService: FormsComponentsService,
    private readonly timedNotificationsService: TimedNotificationsService,
    private readonly translateService: TranslateService,
    private readonly renderingHostFeaturesService: RenderingHostFeaturesService,
    private readonly featureFlagsService: FeatureFlagsService,
    private designingService: DesigningService,
  ) {}

  ngOnInit(): void {
    this.designingService.droppableRenderingIds
      .pipe(
        map((ids) => new Set(ids.map((id) => normalizeGuid(id)))),
        takeWhileAlive(this.lifetime),
      )
      .subscribe((normalizedIdsSet) => {
        this.normalizedAllowedIds = Array.from(normalizedIdsSet);
      });

    this.formsComponents$ = this.contextService.siteName$.pipe(
      takeWhileAlive(this.lifetime),
      switchMap((contextSite) => {
        if (environment.inventoryConnectedMode) {
          return this.formsComponentDalService.getEntities(contextSite);
        }
        return [];
      }),
      map((response: FormsEntityResponse) => {
        if (response.apiError) {
          this.timedNotificationsService.push(
            'form-fetch-error',
            this.translateService.get('ERRORS.FORMS_API_ERROR_MESSAGE'),
            'error',
          );
          return [];
        }
        return response.FormsEntities;
      }),
    );

    this.filteredFormsComponents$ = combineLatest([this.formsComponents$, this.normalizedSearchText$]).pipe(
      map(([components, searchText]) => this.filterComponents(components, searchText)),
      tap((filteredComponents) => {
        this.hasFilteredComponents.next(filteredComponents.length > 0);
      }),
    );

    this._searchString$.next(this.searchText ?? '');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.searchText) {
      this._searchString$.next(this.searchText ?? '');
    }
  }

  ngOnDestroy(): void {
    this.lifetime.dispose();
  }

  setStyles(event: Event): void {
    const img = event.target as HTMLImageElement;

    const height = (img.height / img.width) * this.thumbnailContainerWidth;
    img.style.alignSelf = height > this.thumbnailContainerHeight ? 'flex-start' : 'center';
    img.style.willChange = 'transform';
  }

  scrollThumbnailDown(event: Event) {
    const img = event.target as HTMLImageElement;
    const overflow = Math.max(0, img.height - this.thumbnailContainerHeight);

    img.style.transition = `transform ${overflow * 0.009}s linear`;
    img.style.transform = `translateY(-${overflow}px)`;
  }

  scrollThumbnailUp(event: Event) {
    const img = event.target as HTMLImageElement;
    const overflow = Math.max(0, img.height - this.thumbnailContainerHeight);

    img.style.transition = `transform ${overflow * 0.002}s`;
    img.style.transform = ``;
  }

  isThumbnailTooHigh(img: HTMLImageElement): boolean {
    const height = (img.height / img.width) * this.thumbnailContainerWidth;
    return height > this.thumbnailContainerHeight;
  }

  componentDragstart(event: DragEvent, component: FormsEntity) {
    if (this.mode === 'selectable') {
      return;
    }

    this.formsComponentService.startInsertComponent(component);

    if (event.dataTransfer) {
      // workaround for firefox, which otherwise ignores the event.
      event.dataTransfer.setData('Text', '');
    }

    this.draggableService.dragstart(this.useFormWrapperComponent ? FORM_WRAPPER_RENDERING_ID : BYOC_RENDERING_ID);
  }

  componentDragend() {
    this.draggableService.dragend();
  }

  selectComponent(component: FormsEntity) {
    if (this.mode === 'draggable') {
      return;
    }

    this.formsComponentService.startInsertComponent(component);

    this.componentSelect.emit(this.useFormWrapperComponent ? FORM_WRAPPER_RENDERING_ID : BYOC_RENDERING_ID);
  }

  filterComponents(components: FormsEntity[], searchText: string): FormsEntity[] {
    return components.filter((component) => component.name.toLowerCase().includes(searchText));
  }

  private updateFormsWrapperAvailability(isByocSupported: boolean): void {
    if (!isByocSupported) {
      this.useFormWrapperComponent = true;
      return;
    }

    if (!this.featureFlagsService.isFeatureEnabled('pages_use-form-wrapper-component')) {
      this.useFormWrapperComponent = false;
      return;
    }

    this.renderingHostFeaturesService
      .watchComponents()
      .pipe(
        map((componentsState) => componentsState.components.some((component) => component.toLowerCase() === 'form')),
        takeWhileAlive(this.lifetime),
      )
      .subscribe((hasFormComponent) => {
        this.useFormWrapperComponent = hasFormComponent;
      });
  }
}
