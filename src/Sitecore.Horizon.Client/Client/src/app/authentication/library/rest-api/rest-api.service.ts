/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export class RestApiService {
  async get(serviceEndpoint: string, token$: Promise<string>): Promise<Response> {
    const token = (await token$.catch(() => '')) ?? '';

    const response = await this.fetch(serviceEndpoint, {
      method: 'GET',
      headers: this.requestHeaders(token),
    })
      .then((result) => {
        return result;
      })
      // To clear the console in case of network related problem as it is unable to fetch any response.
      .catch((err) => {
        return err;
      });

    return response;
  }

  private requestHeaders(token: string): {
    authorization: string;
    'Content-Type': 'application/json';
    mode: 'no-cors';
  } {
    return {
      authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
      mode: 'no-cors',
    };
  }

  fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    // window object is not writable so cannot be mocked for testing,
    // to make code testable it is wrapped inside another function
    return window.fetch(input, init);
  }
}
