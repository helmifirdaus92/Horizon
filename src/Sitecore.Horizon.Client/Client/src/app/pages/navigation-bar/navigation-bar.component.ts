/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';

export interface NavigationItem {
  label: string;
  icon: string;
  routerLink: string;
  // Helper attribute for auto tests
  testid: string;
}

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.scss'],
})
export class NavigationBarComponent {
  // We do not translate modes name to keep consistency over different languages.
  navigationItems: NavigationItem[] = [
    {
      label: 'Editor',
      icon: 'file-edit-outline',
      routerLink: '/editor',
      testid: 'nav-editor',
    },
    {
      label: 'Templates',
      icon: 'view-dashboard-outline',
      routerLink: '/templates',
      testid: 'nav-templates',
    },
    {
      label: 'Personalize',
      icon: 'target-account',
      routerLink: '/personalization',
      testid: 'nav-personalization',
    },
    {
      label: 'Analyze',
      icon: 'finance',
      routerLink: '/analytics',
      testid: 'nav-analytics',
    },
  ];
}
