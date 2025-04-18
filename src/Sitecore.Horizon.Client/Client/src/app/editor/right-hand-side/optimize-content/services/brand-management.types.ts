/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface BrandKitRequest {
  brandKitId: string;
  includeDeleted?: boolean;
}

export interface BrandKitResponse {
  id: string;
  name: string;
  apiError?: boolean;
}
