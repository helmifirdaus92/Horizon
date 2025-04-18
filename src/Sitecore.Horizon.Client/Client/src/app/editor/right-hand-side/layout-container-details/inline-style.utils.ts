/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export function parseInlineStyle(inlineStyle: string | undefined): Record<string, string | undefined> {
  const stylePairs = (inlineStyle ?? '').split(';');
  const styleObject: Record<string, string> = {};
  stylePairs.forEach((pair) => {
    const [key, value] = pair.split(':');
    if (key && value) {
      styleObject[key.trim()] = value.trim();
    }
  });

  return styleObject;
}

export function parsePadding(paddingValue: string | undefined): {
  value: { top: number; right: number; bottom: number; left: number };
  unit: string;
} {
  const padding = (paddingValue?.split(' ') ?? []).slice(0, 4).map((padding) => {
    const parsedValue = parseStyleValue(padding);
    const numericValue = parseFloat(parsedValue.value);
    return {
      value: isNaN(numericValue) ? 0 : numericValue,
      unit: parsedValue.unit,
    };
  });
  return {
    value: {
      top: padding[0]?.value ?? 0,
      right: padding[1]?.value ?? padding[0]?.value ?? 0,
      bottom: padding[2]?.value ?? padding[0]?.value ?? 0,
      left: padding[3]?.value ?? padding[1]?.value ?? padding[0]?.value ?? 0,
    },
    unit: padding[0]?.unit ?? padding[1]?.unit ?? padding[2]?.unit ?? padding[3]?.unit ?? 'px',
  };
}

export function parseStyleValue(styleParam: string): { value: string; unit: string } {
  const regex = /^(.*?)(px|rem)$/;
  const match = styleParam?.trim().match(regex);

  if (!match) {
    return { value: styleParam, unit: 'px' };
  }

  const rawValue = match[1].trim();
  const value = rawValue.toString();

  return {
    value: value,
    unit: match[2].trim(),
  };
}

export function unitValueConverter(
  newUnit: string,
  currentSetting: { value: number; unit: string },
  baseFactor: number,
): number {
  if (!baseFactor) {
    return currentSetting.value;
  }

  let convertedValue = currentSetting.value;

  if (newUnit !== currentSetting.unit) {
    if (newUnit === 'rem') {
      convertedValue = currentSetting.value / baseFactor;
    } else if (newUnit === 'px') {
      convertedValue = currentSetting.value * baseFactor;
    }
  }
  return Number(convertedValue.toPrecision(3));
}
