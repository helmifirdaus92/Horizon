/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export type AuthErrorType = 'noXmCloudTenant' | 'noCdpTenant' | 'noOrganization' | 'noStreamTenant' | '';

export interface IdentityParams {
  organization: string | null;
  tenantName: string | null;
}

// XM cloud user uinfo
export declare class User {
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: string;
  updated_at?: string;
  sub?: string;
  [key: string]: any;
}

export enum TokenCustomClaimKeysEnum {
  ORG_ID = 'https://auth.sitecorecloud.io/claims/org_id',
  ORG_DISPLAY_NAME = 'https://auth.sitecorecloud.io/claims/org_display_name',
  ORG_TYPE = 'https://auth.sitecorecloud.io/claims/org_type',
  ORG_ACC_ID = 'https://auth.sitecorecloud.io/claims/org_account_id',
  TENANT_NAME = 'https://auth.sitecorecloud.io/claims/tenant_name',
  TENANT_ID = 'https://auth.sitecorecloud.io/claims/tenant_id',
  ROLES = 'https://auth.sitecorecloud.io/claims/roles',
}

export interface SitecoreUser extends User {
  [TokenCustomClaimKeysEnum.ORG_ID]: string;
  [TokenCustomClaimKeysEnum.ORG_DISPLAY_NAME]: string;
  [TokenCustomClaimKeysEnum.ORG_TYPE]: string;
  [TokenCustomClaimKeysEnum.ORG_ACC_ID]: string;
  [TokenCustomClaimKeysEnum.TENANT_NAME]: string;
  [TokenCustomClaimKeysEnum.TENANT_ID]: string;
  [TokenCustomClaimKeysEnum.ROLES]: string[];
}
