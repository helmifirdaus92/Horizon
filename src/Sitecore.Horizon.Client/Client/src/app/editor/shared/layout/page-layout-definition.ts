/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface PageLayoutDefinition {
  devices: LayoutDeviceDefinition[];
}

export interface LayoutDeviceDefinition {
  id: string;
  layoutId: string;

  placeholders: Array<{
    key: string;
    instanceId: string;
    metadataId: string;
  }>;

  renderings: LayoutRenderingDefinition[];
}

export interface LayoutRenderingDefinition {
  id: string;
  instanceId: string;
  placeholderKey: string;
  dataSource?: string;
  parameters: Record<string, string>;

  caching?: {
    cacheable?: boolean;
    varyByData?: boolean;
    varyByDevice?: boolean;
    varyByLogin?: boolean;
    varyByParameters?: boolean;
    varyByQueryString?: boolean;
    varyByUser?: boolean;
    clearOnIndexUpdate?: boolean;
  };

  personalization?: PersonalizationDefinition;
}

export interface PersonalizationDefinition {
  ruleSet?: RuleSetDefinition;
  multiVariateTestId?: string;
  conditions?: string;
  personalizationTest?: string;
}

export interface RuleSetDefinition {
  pet?: boolean;
  rules: Rule[];
  parameters?: Record<string, string>;
}

export interface Rule {
  uniqueId: string;
  name: string;
  conditions?: string;
  actions?: RuleAction[];
  parameters?: Record<string, string>;
}

export interface RuleAction {
  uniqueId: string;
  id: string;
  dataSource?: string;
  renderingItem?: string;
  parameters?: Record<string, string>;
  renderingParameters?: Record<string, string>;
}
