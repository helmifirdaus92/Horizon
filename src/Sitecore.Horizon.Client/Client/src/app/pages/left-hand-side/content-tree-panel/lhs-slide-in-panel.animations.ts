/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { animate, AnimationTriggerMetadata, style, transition, trigger } from '@angular/animations';
import { animationTiming } from 'app/pages/pages.animations';

export const panelAnimations: AnimationTriggerMetadata[] = [
  trigger('lhsSlideInPanel', [
    transition(':enter', [style({ transform: 'translateX(-100%)' }), animate(animationTiming)]),
    transition(':leave', animate(animationTiming, style({ transform: 'translateX(-100%)' }))),
  ]),
];
