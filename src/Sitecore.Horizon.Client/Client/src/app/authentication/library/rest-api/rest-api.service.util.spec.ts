/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { handleResponse } from './rest-api.util';

const success = new Response(JSON.stringify('test1'), {
  status: 200,
});

const clientError = new Response(JSON.stringify('test2'), {
  status: 400,
});

const authenticationError = new Response(JSON.stringify('test3'), {
  status: 401,
});

const resourceNotFoundError = new Response(JSON.stringify('test4'), {
  status: 404,
});

const serverError = new Response(JSON.stringify('test5'), {
  status: 500,
});

const multipleResponse = new Response(JSON.stringify('test6'), {
  status: 300,
});

describe(handleResponse.name, () => {
  it('should handle success response', async () => {
    const result = await handleResponse(success);
    expect(result.apiIsBroken).toBe(false);
    expect(result.requestIsInvalid).toBe(false);
    expect(result.data).toBe('test1');
  });

  it('should handle client error response', async () => {
    const result = await handleResponse(clientError);
    expect(result.apiIsBroken).toBe(false);
    expect(result.requestIsInvalid).toBe(true);
    expect(result.data).toBe(null);
  });

  it('should handle authentication error response', async () => {
    const result = await handleResponse(authenticationError);
    expect(result.apiIsBroken).toBe(true);
    expect(result.requestIsInvalid).toBe(false);
    expect(result.data).toBe(null);
  });

  it('should handle resource not found error response', async () => {
    const result = await handleResponse(resourceNotFoundError);
    expect(result.apiIsBroken).toBe(false);
    expect(result.requestIsInvalid).toBe(false);
    expect(result.data).toBe(null);
  });

  it('should handle server error response', async () => {
    const result = await handleResponse(serverError);
    expect(result.apiIsBroken).toBe(true);
    expect(result.requestIsInvalid).toBe(false);
    expect(result.data).toBe(null);
  });

  it('should handle multiple response error', async () => {
    const result = await handleResponse(multipleResponse);
    expect(result.apiIsBroken).toBe(false);
    expect(result.requestIsInvalid).toBe(false);
    expect(result.data).toBe(null);
  });
});
