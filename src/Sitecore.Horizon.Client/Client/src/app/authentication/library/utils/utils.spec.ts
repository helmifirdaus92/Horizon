/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { callListeners, clearRedirectQueryParams, persistParams, restoreParams } from './utils';

const expectParams = (organization: string | null, tenantName: string | null) => ({
  organization,
  tenantName,
});
const setToQuery = (param: string, value: string) => {
  const url = new URL(window.location.href);
  if (!!value) {
    url.searchParams.set(param, value);
  } else {
    url.searchParams.delete(param);
  }
  window.history.pushState(null, '', url.toString());
};
const getUrl = () => new URL(window.location.href);

describe('Storing utils', () => {
  beforeEach(() => {
    persistParams({ organization: null, tenantName: null });
  });

  afterEach(() => {
    persistParams({ organization: null, tenantName: null });
  });

  describe('restoreParams', () => {
    it('should restore params - no data', () => {
      expect(restoreParams()).toEqual(expectParams(null, null));
    });

    describe('from query string', () => {
      it('should restore params - org', () => {
        setToQuery('organization', 'my-org');

        expect(restoreParams()).toEqual(expectParams('my-org', null));
      });

      it('should restore params - tenant', () => {
        setToQuery('tenantName', 'name');

        expect(restoreParams()).toEqual(expectParams(null, 'name'));
      });
    });

    describe('from local storage', () => {
      it('should restore params - org', () => {
        window.localStorage.setItem('pages:org_id', 'my-org');

        expect(restoreParams()).toEqual(expectParams('my-org', null));
      });

      it('should restore params - tenantName', () => {
        window.localStorage.setItem('pages:tenantName', 'name');

        expect(restoreParams()).toEqual(expectParams(null, 'name'));
      });
    });

    describe('from session storage', () => {
      it('should restore params - org', () => {
        window.sessionStorage.setItem('pages:org_id', 'my-org');

        expect(restoreParams()).toEqual(expectParams('my-org', null));
      });

      it('should restore params - tenantName', () => {
        window.sessionStorage.setItem('pages:tenantName', 'name');

        expect(restoreParams()).toEqual(expectParams(null, 'name'));
      });
    });

    describe('restore with prioritization logic', () => {
      it('case 1', () => {
        setToQuery('organization', 'my-org1');
        window.sessionStorage.setItem('pages:org_id', 'my-org2');
        window.localStorage.setItem('pages:org_id', 'my-org3');

        setToQuery('tenantName', 'name1');
        window.sessionStorage.setItem('pages:tenantName', 'name2');
        window.localStorage.setItem('pages:tenantName', 'name3');

        expect(restoreParams()).toEqual(expectParams('my-org1', 'name1'));
      });

      it('case 2', () => {
        window.sessionStorage.setItem('pages:org_id', 'my-org2');
        window.localStorage.setItem('pages:org_id', 'my-org3');

        window.sessionStorage.setItem('pages:tenantName', 'name2');
        window.localStorage.setItem('pages:tenantName', 'name3');

        expect(restoreParams()).toEqual(expectParams('my-org2', 'name2'));
      });
    });
  });

  describe('setParams', () => {
    describe('to query string', () => {
      it('should set params - case 1', () => {
        persistParams({ organization: 'org', tenantName: null });

        expect(getUrl().searchParams.get('organization')).toBe('org');
        expect(getUrl().searchParams.get('tenantName')).toBe(null);
      });

      it('should set params - case 2', () => {
        persistParams({ organization: null, tenantName: 'name' });
        expect(getUrl().searchParams.get('organization')).toBe(null);
        expect(getUrl().searchParams.get('tenantName')).toBe('name');

        persistParams({ organization: 'org', tenantName: 'name2' });
        expect(getUrl().searchParams.get('organization')).toBe('org');
        expect(getUrl().searchParams.get('tenantName')).toBe('name2');

        persistParams({ organization: null, tenantName: null });
        expect(getUrl().searchParams.get('organization')).toBe(null);
        expect(getUrl().searchParams.get('tenantName')).toBe(null);
      });
    });

    describe('to session storage string', () => {
      it('should set params - case 1', () => {
        persistParams({ organization: 'org', tenantName: null });

        expect(sessionStorage.getItem('pages:org_id')).toBe('org');
        expect(sessionStorage.getItem('pages:tenantName')).toBe(null);
      });

      it('should set params - case 2', () => {
        persistParams({ organization: null, tenantName: 'name' });
        expect(sessionStorage.getItem('pages:org_id')).toBe(null);
        expect(sessionStorage.getItem('pages:tenantName')).toBe('name');

        persistParams({ organization: 'org', tenantName: 'name2' });
        expect(sessionStorage.getItem('pages:org_id')).toBe('org');
        expect(sessionStorage.getItem('pages:tenantName')).toBe('name2');

        persistParams({ organization: null, tenantName: null });
        expect(sessionStorage.getItem('pages:org_id')).toBe(null);
        expect(sessionStorage.getItem('pages:tenantName')).toBe(null);
      });
    });

    describe('to local storage storage string', () => {
      it('should set params - case 1', () => {
        persistParams({ organization: 'org', tenantName: null });

        expect(localStorage.getItem('pages:org_id')).toBe('org');
        expect(localStorage.getItem('pages:tenantName')).toBe(null);
      });

      it('should set params - case 2', () => {
        persistParams({ organization: null, tenantName: 'name' });
        expect(localStorage.getItem('pages:org_id')).toBe(null);
        expect(localStorage.getItem('pages:tenantName')).toBe('name');

        persistParams({ organization: 'org', tenantName: 'name2' });
        expect(localStorage.getItem('pages:org_id')).toBe('org');
        expect(localStorage.getItem('pages:tenantName')).toBe('name2');

        persistParams({ organization: null, tenantName: null });
        expect(localStorage.getItem('pages:org_id')).toBe(null);
        expect(localStorage.getItem('pages:tenantName')).toBe(null);
      });
    });
  });

  describe('clearRedirectQueryParams', () => {
    it('should clear redirect params from url', () => {
      const url = getUrl();
      url.searchParams.set('code', 'code-value');
      url.searchParams.set('state', 'state-value');
      window.history.pushState(null, '', url.toString());
      expect(getUrl().searchParams.get('code')).toBe('code-value');
      expect(getUrl().searchParams.get('state')).toBe('state-value');

      clearRedirectQueryParams();

      expect(getUrl().searchParams.get('code')).toBe(null);
      expect(getUrl().searchParams.get('state')).toBe(null);
    });
  });

  describe('callListeners', () => {
    it('should call listeners', () => {
      const l1 = jasmine.createSpy();
      const l2 = jasmine.createSpy();
      const l3 = jasmine.createSpy();

      const arr1 = [l1, l2];
      const arr2 = [l3];

      callListeners(arr1, 'val1');
      callListeners(arr2, 'val2');

      expect(l1).toHaveBeenCalledOnceWith('val1');
      expect(l2).toHaveBeenCalledOnceWith('val1');
      expect(l3).toHaveBeenCalledOnceWith('val2');
    });
  });
});
