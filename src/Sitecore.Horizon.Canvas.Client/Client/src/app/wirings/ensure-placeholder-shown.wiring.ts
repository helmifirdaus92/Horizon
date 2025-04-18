/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TranslationService } from '../services/translation.service';
import { Wiring } from './wiring';

export class EnsurePlaceholderIsShownWiring implements Wiring {
  constructor() {}

  wire(): void {
    const hiddenPlaceholders = window.document.querySelectorAll(
      'div[style*="/sitecore/shell/themes/standard/images/pageeditor/bg_hidden_rendering.png"]',
    );

    (hiddenPlaceholders as NodeListOf<HTMLElement>).forEach((ph) => {
      if (ph) {
        if (ph.parentElement) {
          ph.parentElement.style.display = 'flex';
        }

        ph.textContent = TranslationService.get('RENDERING_IS_HIDDEN');

        // set layout styles
        ph.style.height = 'unset';
        ph.style.display = 'flex';
        ph.style.justifyContent = 'center';
        ph.style.alignItems = 'center';
        ph.style.padding = '30px';
        ph.style.flexGrow = '1';

        // set text styles.
        // values are set to be consistent with look and feel of the Horizon app.
        // may need to be adjusted with the product evolution
        ph.style.setProperty('font', 'initial', 'important');
        ph.style.setProperty(
          'font-family',
          `-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
            'Oxygen', 'Ubuntu', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial,
            sans-serif`,
          'important',
        );
        ph.style.setProperty('font-size', '16px', 'important');
        ph.style.setProperty('font-weight', '600', 'important');
        ph.style.setProperty('font-feature-settings', 'initial', 'important');
        ph.style.setProperty('font-size-adjust', 'initial', 'important');
        ph.style.setProperty('font-stretch', 'initial', 'important');
        ph.style.setProperty('font-style', 'initial', 'important');
        ph.style.setProperty('font-variant', 'initial', 'important');
        ph.style.setProperty('color', 'initial', 'important');
        ph.style.setProperty('text-transform', 'initial', 'important');
        ph.style.setProperty('text-decoration', 'initial', 'important');
        ph.style.setProperty('text-shadow', 'initial', 'important');
        ph.style.setProperty('line-height', 'initial', 'important');
        ph.style.setProperty('word-spacing', 'initial', 'important');
        ph.style.setProperty('letter-spacing', 'initial', 'important');
        ph.style.setProperty('text-indent', 'initial', 'important');
      }
    });
  }
}
