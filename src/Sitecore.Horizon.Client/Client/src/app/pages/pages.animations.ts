/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { animate, AnimationTriggerMetadata, query, style, transition, trigger } from '@angular/animations';
import { Animation } from '@sitecore/ng-spd-lib';

export const animationTimingValue = Animation.speed;
export const animationTiming = `${animationTimingValue} ease-in-out`;

export const pagesAnimations: AnimationTriggerMetadata[] = [
  trigger('routerTransition', [
    // Next line targets leaving router-outlets and forces them to remain loaded for the duration of the animation
    transition('* => *', query(':leave', style({ visibility: 'visible' }), { optional: true })),
  ]),

  trigger('pageLoader', [transition(':enter', [style({ opacity: 0 }), animate(animationTiming)])]),
];
