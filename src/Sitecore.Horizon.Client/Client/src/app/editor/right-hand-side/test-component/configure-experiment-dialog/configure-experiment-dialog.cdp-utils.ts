/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

import { BXComponentFlowDefinition } from 'app/pages/left-hand-side/personalization/personalization.types';

/**
 * These utilities are copied from an existing logic in CDP to mimic their calculations.
 * It should be used only for display values, but not to mutate data.
 */

// Inverse cumulative distribution function (CDF) for the normal distribution
// Source: Peter John Acklam's algorithm
function normalInv(p: number) {
  let q: number;
  let r: number;
  let returnValue: number;

  const a1 = -39.6968302866538;
  const a2 = 220.946098424521;
  const a3 = -275.928510446969;
  const a4 = 138.357751867269;
  const a5 = -30.6647980661472;
  const a6 = 2.50662827745924;
  const b1 = -54.4760987982241;
  const b2 = 161.585836858041;
  const b3 = -155.698979859887;
  const b4 = 66.8013118877197;
  const b5 = -13.2806815528857;
  const c1 = -7.78489400243029e-3;
  const c2 = -0.322396458041136;
  const c3 = -2.40075827716184;
  const c4 = -2.54973253934373;
  const c5 = 4.37466414146497;
  const c6 = 2.93816398269878;
  const d1 = 7.78469570904146e-3;
  const d2 = 0.32246712907004;
  const d3 = 2.445134137143;
  const d4 = 3.75440866190742;
  const p_low = 0.02425;
  const p_high = 1 - p_low;

  if (p < 0 || p > 1) {
    returnValue = 0;
  } else if (p < p_low) {
    q = Math.sqrt(-2 * Math.log(p));
    returnValue =
      (((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  } else if (p <= p_high) {
    q = p - 0.5;
    r = q * q;
    returnValue =
      ((((((a1 * r + a2) * r + a3) * r + a4) * r + a5) * r + a6) * q) /
      (((((b1 * r + b2) * r + b3) * r + b4) * r + b5) * r + 1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    returnValue =
      -(((((c1 * q + c2) * q + c3) * q + c4) * q + c5) * q + c6) / ((((d1 * q + d2) * q + d3) * q + d4) * q + 1);
  }

  return returnValue;
}

export function calcRequiredSessionsPerVariant(config: BXComponentFlowDefinition['sampleSizeConfig']): number {
  const upliftDirections = 2; // 1 for tracking just positive uplifts, 2 for tracking positive and negative
  const power = 80; // 80%

  const alpha = (1 - config.confidenceLevel) / upliftDirections;
  const powerValue = 1 - power / 100;
  const p1 = config.baseValue;
  const p2 = p1 + config.minimumDetectableDifference * p1;
  const z = -normalInv(alpha);
  const zp = 1 * -normalInv(powerValue);
  const d = p1 - p2;
  const s = 2 * (((p1 + p2) / 2) * (1 - (p1 + p2) / 2));
  const n = (s * Math.pow(zp + z, 2)) / Math.pow(d, 2);

  return parseInt(n.toFixed(0), 10);
}
