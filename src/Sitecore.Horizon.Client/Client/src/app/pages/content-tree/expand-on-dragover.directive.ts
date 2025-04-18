/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Directive, OnDestroy, OnInit } from '@angular/core';
import { NestedTreeNodeDirective, TreeControl } from '@sitecore/ng-spd-lib';
import { DraggableDirective } from 'app/shared/component-library/draggable.directive';
import { DropDirective } from 'app/shared/component-library/drop.directive';
import { Lifetime, takeWhileAlive } from 'app/shared/utils/lifetime';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Directive({ selector: '[appExpandOnDragover]' })
export class ExpandOnDragoverDirective implements OnInit, OnDestroy {
  static readonly expandDelay = 300;

  private readonly lifetime = new Lifetime();

  constructor(
    private readonly draggable: DraggableDirective,
    private readonly drop: DropDirective,
    private readonly control: TreeControl<unknown>,
    private readonly spdNode: NestedTreeNodeDirective<unknown>,
  ) {}

  ngOnInit() {
    this.drop.isDragover$
      .pipe(
        takeWhileAlive(this.lifetime),
        distinctUntilChanged(),
        debounceTime(ExpandOnDragoverDirective.expandDelay),
        filter((isDragover) => isDragover),
        filter(() => !this.draggable.isDragging),
      )
      .subscribe(() => this.control.expand(this.spdNode.data));
  }

  ngOnDestroy() {
    this.lifetime.dispose();
  }
}
