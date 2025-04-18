/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import {
  BYOC_RENDERING_ID,
  FEAAS_RENDERING_ID,
} from 'app/editor/right-hand-side/feaas-rhs-region/feaas-extension-filter';
import { panelAnimations } from 'app/editor/right-hand-side/rhs-slide-in-panel.animations';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { getJsonValueFromLocalStorage } from 'app/shared/utils/utils';
import { EMPTY, map, Observable, tap } from 'rxjs';
import { DragndropService } from '../dragndrop.service';
import {
  FEaaSComponent,
  FEaaSComponentsCollection,
  FEaaSComponentThumbnail,
  FEaaSExternalComponent,
} from './feaas-component-types';
import { FEaaSComponentsService } from './feaas-components.service';

const FEAAS_COMPONENT_GALLERY_ACCORDION_NAME_CONST = 'hz-acc-fc';

@Component({
  selector: 'app-feaas-components-gallery',
  templateUrl: './feaas-components-gallery.component.html',
  styleUrls: ['./feaas-components-gallery.component.scss'],
  animations: panelAnimations,
})
export class FEaaSComponentsGalleryComponent implements OnInit, OnDestroy, OnChanges {
  @Input() mode: 'selectable' | 'draggable' = 'draggable';
  @Input() renderFEaaSComponents = false;
  @Input() renderFEaaSExternalComponents = false;
  @Input() selectedDataSourceIds: string[] = [];
  @Input() searchText: string | null = null;
  @Output() componentSelect = new EventEmitter<string>();
  @Output() componentsFetched = new EventEmitter<boolean>();
  @Output() hasFilteredComponents = new EventEmitter<boolean>();

  private thumbnailContainerHeight = 140;
  private thumbnailContainerWidth = 252;
  private readonly lifetime = new Lifetime();

  componentsCollections$: Observable<FEaaSComponentsCollection[]> = EMPTY;

  private _accordionHeaderOpenList: Record<string, boolean> = getJsonValueFromLocalStorage(
    FEAAS_COMPONENT_GALLERY_ACCORDION_NAME_CONST,
  );
  accordionHeaderOpenList = {
    get: (key: string) => this._accordionHeaderOpenList[key],
    set: (key: string, value: boolean) => {
      this._accordionHeaderOpenList[key] = value;
      localStorage.setItem(FEAAS_COMPONENT_GALLERY_ACCORDION_NAME_CONST, JSON.stringify(this._accordionHeaderOpenList));
    },
  };

  constructor(
    private readonly fEaaSComponentsService: FEaaSComponentsService,
    private readonly draggableService: DragndropService,
  ) {}

  ngOnInit() {
    this.componentsCollections$ = this.getComponentCollections();

    this.fEaaSComponentsService.isLoading$.pipe(takeWhileAlive(this.lifetime)).subscribe((loading) => {
      this.componentsFetched.next(!loading);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.searchText || changes.selectedDataSourceIds) {
      this.componentsCollections$ = this.getComponentCollections().pipe(
        takeWhileAlive(this.lifetime),
        map((collections) => this.filterComponents(collections, this.searchText ?? '', this.selectedDataSourceIds)),
        tap((filteredCollections) => {
          const hasComponents = filteredCollections.some((col) => col.components.length > 0);
          this.hasFilteredComponents.next(hasComponents);
        }),
        map((collections) => collections.filter((col) => col.components.length > 0)),
      );
    }
  }

  filterComponents(
    componentCollections: FEaaSComponentsCollection[],
    searchText: string,
    selectedDataSourceIds: string[],
  ): FEaaSComponentsCollection[] {
    return componentCollections.map((col) => {
      let filteredComponentsResult: FEaaSComponentsCollection | [] = [];
      if (col.name.toLowerCase().includes(searchText)) {
        filteredComponentsResult = col;
      } else {
        const filteredComponents = col.components.filter(
          (comp) =>
            comp.name.toLowerCase().includes(searchText) ||
            (comp as FEaaSExternalComponent).title?.toLowerCase().includes(searchText),
        );
        filteredComponentsResult = {
          ...col,
          components: filteredComponents,
        };
      }
      if (selectedDataSourceIds.length > 0) {
        const filteredComponents = filteredComponentsResult.components.filter((comp) => {
          const fEaasComp = comp as FEaaSComponent;
          return selectedDataSourceIds.some((id) => fEaasComp.datasourceIds?.includes(id));
        });
        return {
          ...filteredComponentsResult,
          components: filteredComponents,
        };
      }
      return filteredComponentsResult;
    });
  }

  private getComponentCollections(): Observable<FEaaSComponentsCollection[]> {
    return this.fEaaSComponentsService.componentsCollections$.pipe(
      takeWhileAlive(this.lifetime),
      map((collections) => {
        if (!this.renderFEaaSComponents) {
          collections.map((col) => {
            col.components = col.components.filter((cmp) => cmp.isExternal);
          });
        }
        if (!this.renderFEaaSExternalComponents) {
          collections.map((col) => {
            col.components = col.components.filter((cmp) => !cmp.isExternal);
          });
        }
        return collections.filter((col) => col.components.length);
      }),
    );
  }

  componentDragstart(event: DragEvent, component: FEaaSComponent | FEaaSExternalComponent) {
    if (this.mode === 'selectable') {
      return;
    }

    this.fEaaSComponentsService.startInsertComponent(component);

    if (event.dataTransfer) {
      // workaround for firefox, which otherwise ignores the event.
      event.dataTransfer.setData('Text', '');
    }
    if (component.isExternal) {
      this.draggableService.dragstart(BYOC_RENDERING_ID);
      return;
    }
    this.draggableService.dragstart(FEAAS_RENDERING_ID);
  }

  componentDragend() {
    this.draggableService.dragend();
  }

  selectComponent(component: FEaaSComponent | FEaaSExternalComponent) {
    if (this.mode === 'draggable') {
      return;
    }

    this.fEaaSComponentsService.startInsertComponent(component);

    if (component.isExternal) {
      this.componentSelect.emit(BYOC_RENDERING_ID);
      return;
    }

    this.componentSelect.emit(FEAAS_RENDERING_ID);
  }

  setStyles(event: Event, thumbnail: FEaaSComponentThumbnail): void {
    const img = event.target as HTMLImageElement;
    thumbnail.height = thumbnail.height ?? img.height;
    thumbnail.width = thumbnail.width ?? img.width;

    const height = (thumbnail.height / thumbnail.width) * this.thumbnailContainerWidth;
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

  isThumbnailTooHigh(thumbnail: FEaaSComponentThumbnail, img: HTMLImageElement): boolean {
    thumbnail.height = thumbnail.height ?? img.height;
    thumbnail.width = thumbnail.width ?? img.width;
    const height = (thumbnail.height / thumbnail.width) * this.thumbnailContainerWidth;
    return height > this.thumbnailContainerHeight;
  }

  isExternalComponent(component: FEaaSComponent | FEaaSExternalComponent): component is FEaaSExternalComponent {
    return component.isExternal;
  }

  ngOnDestroy() {
    this.lifetime.dispose();
  }
}
