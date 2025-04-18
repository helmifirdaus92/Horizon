/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export interface PromptInputs {
  componentGoal: string;
  seoKeywords: string[];
  audiences: string[];
}
export interface RecommendationField {
  name: string;
  value: string;
}

export interface Reference {
  type: string;
  id: string;
  path: string;
}

export interface VariantsRequest {
  promptInputs?: PromptInputs;
  numberOfVariants: number;
  componentId: string;
  fields: RecommendationField[];
  predefinedPrompt?: number;
  prompt?: string;
  references?: Reference[];
  language?: string;
}

export interface Feedback {
  type: 'good' | 'neutral' | 'bad';
  message?: string;
  reason?: string;
  categories?: string[];
}

export interface RecommendationVariant {
  id: string;
  fields: RecommendationField[];
  feedback?: Feedback;
}

export interface VariantsResponse {
  id: string;
  variants: RecommendationVariant[];
  apiError?: boolean;
}
