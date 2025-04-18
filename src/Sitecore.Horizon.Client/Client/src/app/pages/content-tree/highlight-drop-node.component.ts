/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DropDirective } from 'app/shared/component-library/drop.directive';

@Component({
  selector: 'app-highlight-drop-node',
  template: '<ng-content></ng-content>',
  styleUrls: ['./highlight-drop-node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.dragover]': 'drop.isDragover',
    '[class.no-drop]': '!drop.canDrop',
    '[class.drop-before]': 'drop.offsetTop <= beforeAfterHeight',
    '[class.drop-after]': 'drop.offsetBottom <= beforeAfterHeight',
  },
})
export class HighlightDropNodeComponent {
  @Input() beforeAfterHeight = 0;
  constructor(public readonly drop: DropDirective) {}
}
