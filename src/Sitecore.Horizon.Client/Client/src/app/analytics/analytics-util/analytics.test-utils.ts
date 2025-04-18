/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CardHeaderComponent } from '@sitecore/ng-spd-lib';

export function getSpdCardHeader(
  fixture: ComponentFixture<any>,
): { component: CardHeaderComponent; title: string; tooltipText: string } | null {
  const component = fixture.debugElement.query(By.directive(CardHeaderComponent))?.componentInstance || null;
  return component
    ? {
        component,
        title: component.title,
        tooltipText: component.tooltipText,
      }
    : null;
}
