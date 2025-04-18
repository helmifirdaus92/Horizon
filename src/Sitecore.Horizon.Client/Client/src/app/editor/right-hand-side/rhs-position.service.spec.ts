/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { RhsPositionService } from './rhs-position.service';

describe(RhsPositionService.name, () => {
  let service: RhsPositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RhsPositionService],
    });

    service = TestBed.inject(RhsPositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with isDocked as true', async () => {
    const isDocked = await firstValueFrom(service.isDocked$);
    expect(isDocked).toBe(true);
  });

  it('should toggle isDocked when called without parameter', async () => {
    expect(await firstValueFrom(service.isDocked$)).toBe(true);

    service.toggleDock();
    expect(await firstValueFrom(service.isDocked$)).toBe(false);

    service.toggleDock();
    expect(await firstValueFrom(service.isDocked$)).toBe(true);
  });

  it('should set isDocked to specified value when parameter provided', async () => {
    service.setDockState(false);
    expect(await firstValueFrom(service.isDocked$)).toBe(false);

    service.setDockState(true);
    expect(await firstValueFrom(service.isDocked$)).toBe(true);
  });
});
