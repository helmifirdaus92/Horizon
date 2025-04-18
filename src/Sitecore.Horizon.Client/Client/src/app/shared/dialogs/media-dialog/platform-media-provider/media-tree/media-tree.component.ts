/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { TreeControl, TreeNestedDataSource } from '@sitecore/ng-spd-lib';
import { MediaFolder } from 'app/shared/platform-media/media.interface';
import { findNodeAncestors } from 'app/shared/utils/tree.utils';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

function isExpandable(node: MediaFolder) {
  return !!node.hasChildren;
}

function asWritableArray<T>(arr: readonly T[]): T[] {
  return arr as T[];
}

/**
 * HINT: While implementing, I have come to realize that the flat tree is probably more simple and better perfomant
 * We have some expansive operations to transform the data to be nested
 * and to make calculations that would be more simple in a flat structure.
 * The angular material cdk tree that we are building upon recommends flat tree when possible.
 * Consider refactoring if further changes are needed.
 */
@Component({
  selector: 'app-media-tree',
  templateUrl: 'media-tree.component.html',
  styleUrls: ['media-tree.component.scss'],
})
export class MediaTreeComponent implements OnChanges, OnDestroy {
  @Input() data: readonly MediaFolder[] | null = null;
  @Input() select: string | null = null;
  @Output() selectChange = new EventEmitter<MediaFolder>();

  treeDataSource = new TreeNestedDataSource<MediaFolder>();
  treeControl = new TreeControl<MediaFolder>((node) => this.getChildren(node), isExpandable);

  private readonly unsubscribe$ = new Subject();

  @Input()
  getChildren: (dataNode: MediaFolder) => Observable<MediaFolder[]> | MediaFolder[] | undefined | null = () => null;

  constructor() {
    this.treeControl.onSelectChange.pipe(takeUntil(this.unsubscribe$)).subscribe(({ added }) => {
      const selectedFolder = added[0];
      this.treeControl.expand(selectedFolder);
      this.selectChange.emit(selectedFolder);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && this.data) {
      this.treeDataSource.data = asWritableArray(this.data);

      let selectedFolder: MediaFolder | undefined;
      let foldersToExpand: MediaFolder[] = [];

      if (this.select) {
        foldersToExpand = findNodeAncestors(this.data, 'id', this.select);
        selectedFolder = foldersToExpand[foldersToExpand.length - 1];
      }

      if (!selectedFolder) {
        selectedFolder = this.data[0];
        foldersToExpand = selectedFolder ? [selectedFolder] : [];
      }

      if (selectedFolder) {
        this.treeControl.select(selectedFolder);
      }

      foldersToExpand.forEach((folder) => this.treeControl.expand(folder));
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }
}
