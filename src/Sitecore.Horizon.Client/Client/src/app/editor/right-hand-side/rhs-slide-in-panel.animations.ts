/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { animate, AnimationTriggerMetadata, style, transition, trigger } from '@angular/animations';
import { animationTimingValue } from 'app/pages/pages.animations';

const animationTiming = `${animationTimingValue} ease-in-out`;

export const panelAnimations: AnimationTriggerMetadata[] = [
  trigger('rhsSlideInPanel', [
    transition(':enter', [style({ transform: 'translateX(100%)' }), animate(animationTiming)]),
    transition(':leave', animate(animationTiming, style({ transform: 'translateX(100%)' }))),
  ]),
  trigger('rhsSlideInPanelClose', [
    transition(':enter', [style({ opacity: 0 }), animate(animationTiming)]),
    transition(':leave', animate(animationTiming, style({ opacity: 0 }))),
  ]),
  trigger('rhsSlideInPanelOpacityOnEnter', [transition(':enter', [style({ opacity: 0 }), animate(animationTiming)])]),
];
