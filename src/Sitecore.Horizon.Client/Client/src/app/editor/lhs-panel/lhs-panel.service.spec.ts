/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { createSpyObserver } from 'app/testing/test.utils';
import { LhsPanelStateService } from './lhs-panel.service';

describe(LhsPanelStateService.name, () => {
  let sut: LhsPanelStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    sut = TestBed.inject(LhsPanelStateService);
  });

  it('should be created', () => {
    expect(sut).toBeTruthy();
  });

  it('should be collapsed by default', () => {
    const resultSpy = createSpyObserver();

    sut.isExpanded$.subscribe(resultSpy);

    expect(resultSpy.next).toHaveBeenCalledWith(false);
  });

  it('toggleExpand should toggle the state', () => {
    const resultSpy = createSpyObserver();

    sut.toggleExpand();
    sut.isExpanded$.subscribe(resultSpy);

    expect(resultSpy.next).toHaveBeenCalledWith(true);
    expect(sut.isExpanded()).toBeTrue();
  });

  it('setExpand should set the state', () => {
    const resultSpy = createSpyObserver();

    sut.setExpand(true);
    sut.isExpanded$.subscribe(resultSpy);

    expect(resultSpy.next).toHaveBeenCalledWith(true);
    expect(sut.isExpanded()).toBeTrue();
  });
});
