/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { TestBed } from '@angular/core/testing';
import { createSpyObserver, TestBedInjectSpy } from 'app/testing/test.utils';
import { ContextService } from './context.service';
import { ItemChange, ItemChangeService } from './item-change-service';

describe(ItemChangeService.name, () => {
  let contextServiceSpy: jasmine.SpyObj<ContextService>;
  let sut: ItemChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ContextService,
          useValue: jasmine.createSpyObj<ContextService>(['notifyItemStateUpdate']),
        },
      ],
    });

    sut = TestBed.inject(ItemChangeService);
    contextServiceSpy = TestBedInjectSpy(ContextService);
  });

  it('should notify context service before emitting', () => {
    const subscriberSpy = createSpyObserver<ItemChange>();
    sut.watchForChanges().subscribe(subscriberSpy);

    sut.notifyChange('item-1', ['workflow']);

    expect(contextServiceSpy.notifyItemStateUpdate).toHaveBeenCalledBefore(subscriberSpy.next);
    expect(contextServiceSpy.notifyItemStateUpdate).toHaveBeenCalledOnceWith('item-1', ['workflow']);
    expect(subscriberSpy.next).toHaveBeenCalledWith({ itemId: 'item-1', scopes: ['workflow'] });
  });

  it('should re-emit notifications', () => {
    const subscriberSpy = createSpyObserver<ItemChange>();
    sut.watchForChanges().subscribe(subscriberSpy);

    sut.notifyChange('item-1', ['workflow']);
    sut.notifyChange('item-2', ['workflow', 'data-fields']);

    expect(subscriberSpy.next).toHaveBeenCalledTimes(2);
    expect(subscriberSpy.next).toHaveBeenCalledWith({ itemId: 'item-1', scopes: ['workflow'] });
    expect(subscriberSpy.next).toHaveBeenCalledWith({ itemId: 'item-2', scopes: ['workflow', 'data-fields'] });
  });

  it('should filter changes by item id', () => {
    const subscriberSpy = createSpyObserver<ItemChange>();
    sut.watchForChanges({ itemId: 'item-1' }).subscribe(subscriberSpy);

    sut.notifyChange('item-1', ['workflow']);
    sut.notifyChange('item-2', ['workflow', 'data-fields']);
    sut.notifyChange('item-1', ['data-fields']);

    expect(subscriberSpy.next).toHaveBeenCalledTimes(2);
    expect(subscriberSpy.next).toHaveBeenCalledWith({ itemId: 'item-1', scopes: ['workflow'] });
    expect(subscriberSpy.next).toHaveBeenCalledWith({ itemId: 'item-1', scopes: ['data-fields'] });
  });

  it('should filter changes by scope', () => {
    const subscriberSpy = createSpyObserver<ItemChange>();
    sut.watchForChanges({ scopes: ['workflow'] }).subscribe(subscriberSpy);

    sut.notifyChange('item-1', ['workflow']);
    sut.notifyChange('item-2', ['workflow', 'data-fields']);
    sut.notifyChange('item-3', ['data-fields']);

    expect(subscriberSpy.next).toHaveBeenCalledTimes(2);
    expect(subscriberSpy.next).toHaveBeenCalledWith({ itemId: 'item-1', scopes: ['workflow'] });
    expect(subscriberSpy.next).toHaveBeenCalledWith({ itemId: 'item-2', scopes: ['workflow', 'data-fields'] });
  });

  it('should not notify about past changes on subscribe', () => {
    const subscriberSpy = createSpyObserver<ItemChange>();

    sut.notifyChange('item-1', ['workflow']);
    sut.watchForChanges({ itemId: 'item-1' }).subscribe(subscriberSpy);

    expect(subscriberSpy.next).not.toHaveBeenCalled();
  });

  it('should normalize incoming ID values', () => {
    const subscriberSpy = createSpyObserver<ItemChange>();
    sut.watchForChanges().subscribe(subscriberSpy);

    sut.notifyChange('{CD7C2A36-2E83-4146-B966-18EFA403AD23}', []);

    expect(subscriberSpy.next).toHaveBeenCalledWith(
      jasmine.objectContaining({ itemId: 'cd7c2a36-2e83-4146-b966-18efa403ad23' }),
    );
  });

  it('should normalize ID when watching for changes', () => {
    const subscriberSpy = createSpyObserver<ItemChange>();
    sut.watchForChanges({ itemId: 'CD7C2A36-2E83-4146-B966-18EFA403AD23' }).subscribe(subscriberSpy);

    sut.notifyChange('cd7c2a36-2e83-4146-b966-18efa403ad23', []);

    expect(subscriberSpy.next).toHaveBeenCalled();
  });
});
