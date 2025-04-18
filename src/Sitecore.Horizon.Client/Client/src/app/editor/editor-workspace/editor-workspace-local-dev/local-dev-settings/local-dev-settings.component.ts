/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from 'environments/environment';

export const FORCE_SHOWING_PANES = 'Sitecore.Horizon.ForceShowingPanes';

// Should be aligned to the parameter in environment
export const DISCONNECTED_MODE = 'Sitecore.Horizon.DisconnectedMode';
export const SITE_SWITCHER_MODE = 'Sitecore.Horizon.SiteSwitcherDevMode';
export const INVENTORY_DISCONNECTED_MODE = 'Sitecore.Horizon.InventoryDisconnectedMode';
export const SETTINGS_ENABLED_MODE = 'Sitecore.Pages.SettingsNavigationEnabled';
export const FEAAS_ENABLED_MODE = 'Sitecore.Pages.FeaaSDisabled';
export const FACADE_API_ENABLED_MODE = 'Sitecore.Pages.SitesAPIEnabled';

/**
 * WARNING: This component is featured for local development only. Please do NOT use it in production.
 */
@Component({
  selector: 'app-local-dev-settings',
  templateUrl: './local-dev-settings.component.html',
  styleUrls: ['./local-dev-settings.component.scss'],
})
export class LocalDevelopmentSettingsComponent {
  isProductionMode = environment.production;

  isShowPanesMode = false;

  isDisconnectedMode = !environment.personalizationIntegrationConnectedMode;

  isInventoryConnectedMode = environment.inventoryConnectedMode;

  settingsMenuEnabled = environment.settingsNavigationEnabled;

  isFeaasEnabled = !environment.feaaSDisabled;

  isFacadeApiEnabled = environment.sitesApiEnabled;

  constructor(private readonly domSanitizer: DomSanitizer) {
    if (!this.isProductionMode) {
      // Restore from storage
      this.applyShowPanes(!!localStorage.getItem(FORCE_SHOWING_PANES));
      this.isDisconnectedMode = !!localStorage.getItem(DISCONNECTED_MODE);
      this.isInventoryConnectedMode = !!localStorage.getItem(INVENTORY_DISCONNECTED_MODE);
    }
  }

  getPagesURL() {
    return this.domSanitizer.bypassSecurityTrustUrl(
      'https://pages-staging.sitecore-staging.cloud' + window.location.href.split(':5001')[1],
    );
  }

  toggleShowingPanes(variant: boolean) {
    this.setShowPanesToStorage(variant);
    this.applyShowPanes(variant);
  }

  toggleDisconnectedMode() {
    this.isDisconnectedMode = !this.isDisconnectedMode;
    this.setDisconnectedModeToStorage(this.isDisconnectedMode);
    window.location.reload();
  }

  toggleInventoryConnectedMode() {
    this.isInventoryConnectedMode = !this.isInventoryConnectedMode;
    this.setInventoryDisconnectedModeToStorage(this.isInventoryConnectedMode);
    window.location.href = window.location.origin + window.location.pathname;
  }

  toggleSettingsEnabledMode() {
    this.settingsMenuEnabled = !this.settingsMenuEnabled;
    this.setSettingsNavigationEnabledToStorage(this.settingsMenuEnabled);
    window.location.reload();
  }

  toggleFeaasEnabledMode() {
    this.isFeaasEnabled = !this.isFeaasEnabled;
    this.setFeaasEnabledToStorage(this.isFeaasEnabled);
    window.location.reload();
  }

  toggleFacadeApiMode() {
    this.isFacadeApiEnabled = !this.isFacadeApiEnabled;
    this.setFacadeAPIEnabledToStorage(this.isFacadeApiEnabled);
    window.location.reload();
  }

  private setDisconnectedModeToStorage(variant: boolean) {
    if (variant) {
      localStorage.setItem(DISCONNECTED_MODE, '1');
    } else {
      localStorage.removeItem(DISCONNECTED_MODE);
    }
  }

  private setShowPanesToStorage(variant: boolean) {
    if (variant) {
      localStorage.setItem(FORCE_SHOWING_PANES, '1');
    } else {
      localStorage.removeItem(FORCE_SHOWING_PANES);
    }
  }

  private setInventoryDisconnectedModeToStorage(variant: boolean) {
    if (variant) {
      localStorage.setItem(INVENTORY_DISCONNECTED_MODE, '1');
    } else {
      localStorage.removeItem(INVENTORY_DISCONNECTED_MODE);
    }
  }

  private setSettingsNavigationEnabledToStorage(variant: boolean) {
    if (variant) {
      localStorage.setItem(SETTINGS_ENABLED_MODE, '1');
    } else {
      localStorage.removeItem(SETTINGS_ENABLED_MODE);
    }
  }

  private setFeaasEnabledToStorage(variant: boolean) {
    if (!variant) {
      localStorage.setItem(FEAAS_ENABLED_MODE, '1');
    } else {
      localStorage.removeItem(FEAAS_ENABLED_MODE);
    }
  }

  private setFacadeAPIEnabledToStorage(variant: boolean) {
    if (variant) {
      localStorage.setItem(FACADE_API_ENABLED_MODE, '1');
    } else {
      localStorage.removeItem(FACADE_API_ENABLED_MODE);
    }
  }

  private applyShowPanes(variant: boolean) {
    this.isShowPanesMode = variant;

    const lhsEl = document.querySelectorAll('ng-spd-page > .page-app > ng-spd-split-pane')[1];
    const rhsEl = document.querySelector('ng-spd-page > .page-app > ng-spd-page-pane');

    if (this.isShowPanesMode) {
      lhsEl?.classList.add('show');
      rhsEl?.classList.add('show');
    } else {
      lhsEl?.classList.remove('show');
      rhsEl?.classList.remove('show');
    }
  }
}
