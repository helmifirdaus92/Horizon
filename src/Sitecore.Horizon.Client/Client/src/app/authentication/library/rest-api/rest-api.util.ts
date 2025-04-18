/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface ApiResponse<T> {
  apiIsBroken: boolean;
  requestIsInvalid: boolean;
  data: T | null;
}

export async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  // Authentication error
  if (response.status === 401) {
    return { apiIsBroken: true, requestIsInvalid: false, data: null };
  }

  // Resource not found error
  if (response.status === 404) {
    return { apiIsBroken: false, requestIsInvalid: false, data: null };
  }

  // Client error
  if (response.status >= 400 && response.status < 500) {
    return { apiIsBroken: false, requestIsInvalid: true, data: null };
  }

  // Server error
  if (response.status >= 500) {
    return { apiIsBroken: true, requestIsInvalid: false, data: null };
  }

  // Default
  return { apiIsBroken: false, requestIsInvalid: false, data: response.ok ? await response.json() : null };
}
