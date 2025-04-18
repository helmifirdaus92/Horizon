/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { MessagingRpcServicesClient } from '@sitecore/page-composer-sdk';
import { GlobalMessagingTesting } from 'app/testing/global-messaging-testing';
import { createSpyObserver } from 'app/testing/test.utils';
import { Observer } from 'rxjs';
import { PagesUIRpc, PageUIContract } from 'sdk/contracts/pages-ui.contract';
import { PagesService } from './pages.service';

describe(PagesService.name, () => {
  let sut: PagesService;
  let messaging: GlobalMessagingTesting;
  let changeRHSObserver: jasmine.SpyObj<Observer<any>>;
  let rpc: MessagingRpcServicesClient<PagesUIRpc>;

  beforeEach(async () => {
    messaging = new GlobalMessagingTesting();
    sut = new PagesService(messaging);

    changeRHSObserver = createSpyObserver();
    sut.rhsStateChange$.subscribe(changeRHSObserver);

    rpc = await messaging.getRpc(PageUIContract);
  });

  describe('RHS control', () => {
    it('should emit open state when call openRHS', () => {
      sut.openRHS();

      expect(changeRHSObserver.next).toHaveBeenCalledWith('open');
    });

    it('should emit open state when Messaging calls openRHS', () => {
      rpc.openRHS();

      expect(changeRHSObserver.next).toHaveBeenCalledWith('open');
    });

    it('should emit close state when closeRHS is called', () => {
      sut.closeRHS();

      expect(changeRHSObserver.next).toHaveBeenCalledWith('close');
    });

    it('should emit close state when Messaging calls closeRHS', () => {
      rpc.closeRHS();

      expect(changeRHSObserver.next).toHaveBeenCalledWith('close');
    });

    it('should emit toggle state when toggleRHS is called', () => {
      sut.toggleRHS();

      expect(changeRHSObserver.next).toHaveBeenCalledWith('toggle');
    });

    it('should emit toggle state when Messaging calls toggleRHS', () => {
      rpc.toggleRHS();

      expect(changeRHSObserver.next).toHaveBeenCalledWith('toggle');
    });
  });
});
