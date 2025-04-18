/*!
 * © Sitecore Corporation A/S. All rights reserved. Sitecore® is a registered trademark of Sitecore Corporation A/S.
 */

export function pickDefinedProperties<T, K extends keyof T>(object: T, props: K[]): Pick<T, K> {
  const definedProps: Partial<T> = {};

  props.forEach((key) => {
    const value = object[key];

    if (value !== undefined) {
      definedProps[key] = object[key];
    }
  });

  return definedProps as Pick<T, K>;
}
