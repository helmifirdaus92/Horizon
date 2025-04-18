/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { RestApiService } from './rest-api.service';

describe(RestApiService.name, () => {
  let sut: RestApiService;
  let fetchMock: jasmine.Spy;
  let token$: Promise<string>;

  const response = new Response();

  const errorResponse = new Response('Failed to fetch', {
    status: 500,
    statusText: 'Failed to fetch ',
  });

  beforeEach(() => {
    token$ = new Promise((resolve) => resolve('test-token'));

    sut = new RestApiService();
    fetchMock = spyOn(sut, 'fetch');
  });

  it('should be created', () => {
    expect(true).toBeTruthy();
  });

  it('should be able to make GET call to rest API endpoint', async () => {
    fetchMock.and.returnValue(new Promise<Response>((resolve) => resolve(response)));

    const actual = sut.get('/get-endpoint', token$);

    await expectAsync(actual).toBeResolvedTo(response);

    expect(fetchMock).toHaveBeenCalledWith('/get-endpoint', {
      method: 'GET',
      headers: { authorization: 'Bearer test-token', 'Content-Type': 'application/json', mode: 'no-cors' },
    });
  });

  it('should return error if unable to retrieve items from the API', async () => {
    fetchMock.and.returnValue(Promise.reject(errorResponse));

    const actual = sut.get('/get-endpoint', token$);

    await expectAsync(actual).toBeResolvedTo(errorResponse);
  });
});
