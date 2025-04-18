/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { createSpyObserver } from 'app/testing/test.utils';
import { AiHypophysisPanelService } from './ai-hypophysis-panel.service';

describe(AiHypophysisPanelService.name, () => {
  let sut: AiHypophysisPanelService;
  beforeEach(() => {
    sut = new AiHypophysisPanelService();
  });

  it('should be closed by first', () => {
    const spy = createSpyObserver();

    sut.panelState$.subscribe(spy);

    expect(spy.next).toHaveBeenCalledWith(false);
  });

  it('should emit open state with key and header when call openPanel', () => {
    const spy = createSpyObserver();

    sut.openPanel();
    sut.panelState$.subscribe(spy);

    expect(spy.next).toHaveBeenCalledWith(true);
  });

  it('should not emit open state when panel is already opened', () => {
    const spy = createSpyObserver();

    sut.openPanel();
    sut.panelState$.subscribe(spy);
    sut.openPanel();

    expect(spy.next).toHaveBeenCalledTimes(1);
  });

  it('should emit closed state when closePanel is called', () => {
    const spy = createSpyObserver();

    sut.openPanel();
    sut.closePanel();
    sut.panelState$.subscribe(spy);

    expect(spy.next).toHaveBeenCalledWith(false);
  });
});
